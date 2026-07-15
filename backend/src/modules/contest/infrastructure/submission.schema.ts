import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SubmissionDocument = SubmissionDocumentClass & Document;

@Schema({
  collection: 'submissions',
  timestamps: true,
})
export class SubmissionDocumentClass {
  @Prop({ required: true, index: true })
  contestId!: string;

  @Prop({ required: true, index: true })
  userId!: string;

  @Prop({ required: true })
  questionId!: string;

  @Prop({ required: true })
  submittedAnswer!: string;

  @Prop({ required: true })
  correct!: boolean;

  @Prop({ required: true })
  score!: number;
}

export const SubmissionSchema = SchemaFactory.createForClass(SubmissionDocumentClass);
SubmissionSchema.index({ contestId: 1, userId: 1, questionId: 1 }, { unique: true });
