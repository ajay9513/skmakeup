import { IMediaAssetDocument, MediaAssetModel } from '../models/media-asset.model';
import { MediaListQueryInput, UpdateMediaInput } from '@sk-makeup/shared';
import { parseListQuery, buildSearchFilter } from '../../../utils/query-builder';
import { escapeRegex } from '../../../utils/escape-regex';
import { NotFoundError, ConflictError } from '../../../domain/errors';
import mongoose from 'mongoose';

function mapMedia(doc: IMediaAssetDocument) {
  return {
    id: doc._id.toString(),
    publicId: doc.publicId,
    secureUrl: doc.secureUrl,
    url: doc.url,
    width: doc.width,
    height: doc.height,
    format: doc.format,
    size: doc.size,
    folder: doc.folder,
    alt: doc.alt || '',
    caption: doc.caption || '',
    tags: doc.tags,
    uploadedBy: doc.uploadedBy.toString(),
    entityType: doc.entityType,
    entityId: doc.entityId?.toString(),
    entityField: doc.entityField,
    isOrphan: doc.isOrphan,
    version: doc.version,
    status: doc.status,
    replacedByPublicId: doc.replacedByPublicId,
    originalFilename: doc.originalFilename,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
}

export class MediaAssetRepository {
  async findById(id: string) {
    const doc = await MediaAssetModel.findById(id).exec();
    return doc ? mapMedia(doc) : null;
  }

  async findByPublicId(publicId: string) {
    const doc = await MediaAssetModel.findOne({ publicId }).exec();
    return doc ? mapMedia(doc) : null;
  }

  async findAll(query: MediaListQueryInput) {
    const { page, limit, skip, sort, search } = parseListQuery(query);
    const filter: Record<string, unknown> = {};

    if (query.folder) filter.folder = { $regex: `^${escapeRegex(query.folder)}$`, $options: 'i' };
    if (query.status) filter.status = query.status;
    if (query.isOrphan !== undefined) filter.isOrphan = query.isOrphan;
    if (query.tags) filter.tags = { $in: query.tags.split(',').map((t) => t.trim().toLowerCase()) };

    Object.assign(filter, buildSearchFilter(search, ['publicId', 'alt', 'caption', 'originalFilename', 'tags']));

    const [docs, total] = await Promise.all([
      MediaAssetModel.find(filter).sort(sort).skip(skip).limit(limit).lean().exec(),
      MediaAssetModel.countDocuments(filter).exec(),
    ]);

    return {
      items: docs.map((d) => mapMedia(d as unknown as IMediaAssetDocument)),
      total,
      page,
      limit,
    };
  }

  async create(data: {
    publicId: string;
    secureUrl: string;
    url: string;
    width: number;
    height: number;
    format: string;
    size: number;
    folder: string;
    uploadedBy: string;
    originalFilename?: string;
    alt?: string;
    caption?: string;
    tags?: string[];
  }) {
    const existing = await MediaAssetModel.findOne({ publicId: data.publicId }).exec();
    if (existing) throw new ConflictError('Media asset already exists', 'DUPLICATE_PUBLIC_ID');

    const doc = await MediaAssetModel.create({
      ...data,
      uploadedBy: new mongoose.Types.ObjectId(data.uploadedBy),
      isOrphan: true,
      status: 'active',
      tags: data.tags || [],
    });

    return mapMedia(doc);
  }

  async update(id: string, data: UpdateMediaInput & {
    secureUrl?: string;
    url?: string;
    width?: number;
    height?: number;
    format?: string;
    size?: number;
    originalFilename?: string;
    version?: number;
  }) {
    const doc = await MediaAssetModel.findByIdAndUpdate(id, data, { new: true }).exec();
    if (!doc) throw new NotFoundError('Media asset not found');
    return mapMedia(doc);
  }

  async markReplaced(id: string, replacedByPublicId: string) {
    await MediaAssetModel.findByIdAndUpdate(id, {
      status: 'replaced',
      replacedByPublicId,
    }).exec();
  }

  async softDelete(id: string) {
    const doc = await MediaAssetModel.findByIdAndUpdate(id, { status: 'deleted' }, { new: true }).exec();
    if (!doc) throw new NotFoundError('Media asset not found');
    return mapMedia(doc);
  }

  async restore(id: string) {
    const doc = await MediaAssetModel.findByIdAndUpdate(id, { status: 'active' }, { new: true }).exec();
    if (!doc) throw new NotFoundError('Media asset not found');
    return mapMedia(doc);
  }

  async linkToEntity(id: string, entityType: string, entityId: string, entityField?: string) {
    const doc = await MediaAssetModel.findByIdAndUpdate(
      id,
      {
        entityType,
        entityId: new mongoose.Types.ObjectId(entityId),
        entityField,
        isOrphan: false,
      },
      { new: true },
    ).exec();
    if (!doc) throw new NotFoundError('Media asset not found');
    return mapMedia(doc);
  }

  async countReferences(publicId: string): Promise<number> {
    return MediaAssetModel.countDocuments({ publicId, status: 'active' }).exec();
  }
}
