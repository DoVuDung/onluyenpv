import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ContestStatus } from '@onluyenphongvan/types';

export type ContestDocument = ContestDocumentClass & Document;

@Schema({
  collection: 'contests',
  timestamps: true,
})
export class ContestDocumentClass {
  @Prop({ required: true })
  title!: string;

  @Prop({ required: true, unique: true, index: true })
  slug!: string;

  @Prop({ required: true })
  description!: string;

  @Prop({ required: true, index: true })
  startTime!: Date;

  @Prop({ required: true, index: true })
  endTime!: Date;

  @Prop({ type: [String], required: true })
  questionIds!: string[];

  @Prop({ required: true, enum: ['upcoming', 'live', 'ended'], default: 'upcoming' })
  status!: ContestStatus;

  readonly createdAt!: Date;
  readonly updatedAt!: Date;
}

export const ContestSchema = SchemaFactory.createForClass(ContestDocumentClass);
ContestSchema.index({ status: 1, startTime: 1 });
