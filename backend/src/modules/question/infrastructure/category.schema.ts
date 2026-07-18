import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CategoryDocument = CategoryDocumentClass & Document;

@Schema({
  collection: 'categories',
  timestamps: true,
})
export class CategoryDocumentClass {
  @Prop({ required: true, unique: true, index: true })
  slug!: string;

  @Prop({ required: true })
  name!: string;

  @Prop({ required: true })
  description!: string;

  @Prop({ required: false })
  icon?: string;

  readonly createdAt!: Date;
  readonly updatedAt!: Date;
}

export const CategorySchema = SchemaFactory.createForClass(CategoryDocumentClass);
CategorySchema.index({ slug: 1 }, { unique: true });
