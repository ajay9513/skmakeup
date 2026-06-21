import { CounterModel } from '../models/counter.model';
import { ICounterRepository } from '../../../domain/interfaces/repositories';

export class CounterRepository implements ICounterRepository {
  async getNextSequence(name: string): Promise<number> {
    const counter = await CounterModel.findByIdAndUpdate(
      name,
      { $inc: { sequence: 1 } },
      { new: true, upsert: true },
    ).exec();

    return counter.sequence;
  }
}
