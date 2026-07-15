import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TagDocument = TagDocumentClass & Document;

@Schema({
  collection: 'tags',
  timestamps: true,
})
export class TagDocumentClass {
  @Prop({ required: true, unique: true, index: true })
  slug!: string;

  @Prop({ required: true })
  name!: string;
}

export const TagSchema = SchemaFactory.createForClass(TagDocumentClass);
TagSchema.index({ slug: 1 }, { unique: true });
