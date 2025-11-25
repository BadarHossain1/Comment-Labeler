import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IComment extends Document {
  text: string;
  labelCount: number;
  finalLabel: string | null;
  status: 'open' | 'resolved' | 'needs_admin_review';
  createdAt: Date;
  updatedAt: Date;
}

const CommentSchema = new Schema<IComment>(
  {
    text: {
      type: String,
      required: [true, 'Comment text is required'],
      trim: true,
    },
    labelCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    finalLabel: {
      type: String,
      default: null,
      enum: {
        values: [null, 'Hope', 'Fear', 'Determination', 'Neutral'],
        message: '{VALUE} is not a valid label',
      },
    },
    status: {
      type: String,
      enum: {
        values: ['open', 'resolved', 'needs_admin_review'],
        message: '{VALUE} is not a valid status',
      },
      default: 'open',
    },
  },
  {
    timestamps: true,
  }
);

// Add indexes for better query performance
CommentSchema.index({ status: 1 });
CommentSchema.index({ finalLabel: 1 });

const Comment: Model<IComment> =
  mongoose.models.Comment || mongoose.model<IComment>('Comment', CommentSchema);

export default Comment;
