import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface ILabel extends Document {
  commentId: Types.ObjectId;
  userName: string;
  label: 'Hope' | 'Fear' | 'Determination' | 'Neutral' | 'Skip';
  createdAt: Date;
}

const LabelSchema = new Schema<ILabel>(
  {
    commentId: {
      type: Schema.Types.ObjectId,
      ref: 'Comment',
      required: [true, 'Comment ID is required'],
      index: true,
    },
    userName: {
      type: String,
      required: [true, 'User name is required'],
      trim: true,
    },
    label: {
      type: String,
      required: [true, 'Label is required'],
      enum: {
        values: ['Hope', 'Fear', 'Determination', 'Neutral', 'Skip'],
        message: '{VALUE} is not a valid label',
      },
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false, // We only need createdAt, not updatedAt
  }
);

// Add compound index to prevent duplicate labels from same user on same comment
LabelSchema.index({ commentId: 1, userName: 1 }, { unique: true });

// Add index for querying labels by user
LabelSchema.index({ userName: 1 });

const Label: Model<ILabel> =
  mongoose.models.Label || mongoose.model<ILabel>('Label', LabelSchema);

export default Label;
