import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type RankingDocument = RankingDocumentClass & Document;

@Schema({
  collection: 'rankings',
  timestamps: true,
})
export class RankingDocumentClass {
  @Prop({ required: true, index: true })
  contestId!: string;

  @Prop({ required: true, index: true })
  userId!: string;

  @Prop({ required: true, default: 0 })
  totalScore!: number;

  @Prop({ required: true, default: 0 })
  totalDurationMs!: number;
}

export const RankingSchema = SchemaFactory.createForClass(RankingDocumentClass);
RankingSchema.index({ contestId: 1, userId: 1 }, { unique: true });
RankingSchema.index({ contestId: 1, totalScore: -1, totalDurationMs: 1 });
