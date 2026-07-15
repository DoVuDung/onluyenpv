import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type BookmarkDocument = BookmarkDocumentClass & Document;

@Schema({
  collection: 'bookmarks',
  timestamps: true,
})
export class BookmarkDocumentClass {
  @Prop({ required: true, index: true })
  userId!: string;

  @Prop({ required: true, index: true })
  questionId!: string;
}

export const BookmarkSchema = SchemaFactory.createForClass(BookmarkDocumentClass);
BookmarkSchema.index({ userId: 1, questionId: 1 }, { unique: true });
