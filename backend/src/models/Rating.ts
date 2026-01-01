import mongoose, { Schema, Document } from 'mongoose';

export interface IRatingDocument extends Document {
  job: mongoose.Types.ObjectId;
  client: mongoose.Types.ObjectId;
  labour: mongoose.Types.ObjectId;
  rating: number;
  comment?: string;
}

const ratingSchema = new Schema<IRatingDocument>({
  job: {
    type: Schema.Types.ObjectId,
    ref: 'Job',
    required: true,
    unique: true, // One rating per job
  },
  client: {
    type: Schema.Types.ObjectId,
    ref: 'Client',
    required: true,
  },
  labour: {
    type: Schema.Types.ObjectId,
    ref: 'Labour',
    required: true,
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  comment: {
    type: String,
    trim: true,
    maxlength: 500,
  },
}, {
  timestamps: true,
});

// Indexes
ratingSchema.index({ labour: 1, createdAt: -1 });
ratingSchema.index({ client: 1 });

export const Rating = mongoose.model<IRatingDocument>('Rating', ratingSchema);