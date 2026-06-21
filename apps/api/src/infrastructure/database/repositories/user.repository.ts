import { UserModel } from '../models/user.model';
import {
  IUserRepository,
  CreateUserData,
  UpdateUserData,
} from '../../../domain/interfaces/repositories';
import { UserEntity } from '../../../domain/entities';
import { mapUserDocumentToEntity } from '../mappers/user.mapper';

export class UserRepository implements IUserRepository {
  async findById(id: string): Promise<UserEntity | null> {
    const doc = await UserModel.findById(id).select('+passwordHash').exec();
    return doc ? mapUserDocumentToEntity(doc) : null;
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    const doc = await UserModel.findOne({ email: email.toLowerCase() })
      .select('+passwordHash')
      .exec();
    return doc ? mapUserDocumentToEntity(doc) : null;
  }

  async findAll(options: { page: number; limit: number }): Promise<{ users: UserEntity[]; total: number }> {
    const skip = (options.page - 1) * options.limit;

    const [docs, total] = await Promise.all([
      UserModel.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(options.limit)
        .exec(),
      UserModel.countDocuments().exec(),
    ]);

    return {
      users: docs.map(mapUserDocumentToEntity),
      total,
    };
  }

  async create(data: CreateUserData): Promise<UserEntity> {
    const doc = await UserModel.create({
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email.toLowerCase(),
      passwordHash: data.passwordHash,
      role: data.role,
      status: 'active',
      failedLoginAttempts: 0,
    });

    const created = await UserModel.findById(doc._id).select('+passwordHash').exec();
    if (!created) {
      throw new Error('Failed to create user');
    }

    return mapUserDocumentToEntity(created);
  }

  async update(id: string, data: UpdateUserData): Promise<UserEntity | null> {
    const updateData: Record<string, unknown> = { ...data };

    if (data.email) {
      updateData.email = data.email.toLowerCase();
    }

    if (data.lockUntil === null) {
      updateData.lockUntil = undefined;
      updateData.failedLoginAttempts = 0;
    }

    const doc = await UserModel.findByIdAndUpdate(id, updateData, { new: true })
      .select('+passwordHash')
      .exec();

    return doc ? mapUserDocumentToEntity(doc) : null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await UserModel.findByIdAndDelete(id).exec();
    return result !== null;
  }

  async countByRole(role: UserEntity['role']): Promise<number> {
    return UserModel.countDocuments({ role }).exec();
  }
}
