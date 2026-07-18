import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TopicDocument = TopicDocumentClass & Document;

@Schema({
  collection: 'topics',
  timestamps: true,
})
export class TopicDocumentClass {
  @Prop({ required: true, unique: true, index: true })
  slug!: string;

  @Prop({ required: true })
  name!: string;

  @Prop({ required: true, index: true })
  categoryId!: string;

  readonly createdAt!: Date;
  readonly updatedAt!: Date;
}

export const TopicSchema = SchemaFactory.createForClass(TopicDocumentClass);
TopicSchema.index({ categoryId: 1 });
