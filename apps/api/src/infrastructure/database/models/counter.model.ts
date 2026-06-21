import mongoose, { Schema } from 'mongoose';

export interface ICounterDocument {
  _id: string;
  sequence: number;
}

const CounterSchema = new Schema<ICounterDocument>({
  _id: { type: String, required: true },
  sequence: { type: Number, default: 0 },
});

export const CounterModel = mongoose.model<ICounterDocument>('Counter', CounterSchema);
