import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AttemptDocument = AttemptDocumentClass & Document;

@Schema({
  collection: 'attempts',
  timestamps: true,
})
export class AttemptDocumentClass {
  @Prop({ required: true, index: true })
  userId!: string;

  @Prop({ required: true, index: true })
  questionId!: string;

  @Prop({ required: false })
  selectedOptionId?: string;

  @Prop({ required: false })
  submittedAnswer?: string;

  @Prop({ required: true })
  correct!: boolean;

  @Prop({ required: true })
  durationMs!: number;

  @Prop({ required: true })
  sm2Interval!: number;

  @Prop({ required: true })
  sm2EFactor!: number;

  @Prop({ required: true })
  sm2Repetitions!: number;

  readonly createdAt!: Date;
  readonly updatedAt!: Date;
}

export const AttemptSchema = SchemaFactory.createForClass(AttemptDocumentClass);
AttemptSchema.index({ userId: 1, createdAt: -1 });
AttemptSchema.index({ questionId: 1 });
