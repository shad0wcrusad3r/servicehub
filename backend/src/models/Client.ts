import mongoose, { Schema, Document } from 'mongoose';

export interface IClientDocument extends Document {
  user: mongoose.Types.ObjectId;
  name: string;
  company?: string;
}

const clientSchema = new Schema<IClientDocument>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
  },
  company: {
    type: String,
    trim: true,
    maxlength: 100,
  },
}, {
  timestamps: true,
});

export const Client = mongoose.model<IClientDocument>('Client', clientSchema);