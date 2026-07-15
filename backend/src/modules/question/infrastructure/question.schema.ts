import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Difficulty, QuestionOption, TestCase } from '@onluyenphongvan/types';

export type QuestionDocument = QuestionDocumentClass & Document;

@Schema({
  collection: 'questions',
  timestamps: true,
})
export class QuestionDocumentClass {
  @Prop({ required: true, unique: true, index: true })
  slug!: string;

  @Prop({ required: true, enum: ['junior', 'middle', 'senior', 'staff', 'principal'] })
  difficulty!: Difficulty;

  @Prop({ required: true })
  title!: string;

  @Prop({ required: true })
  markdown!: string;

  @Prop({ required: true })
  explanation!: string;

  @Prop({ required: true, enum: ['multiple-choice', 'fill-blank', 'code-output', 'coding-challenge'], index: true })
  type!: 'multiple-choice' | 'fill-blank' | 'code-output' | 'coding-challenge';

  @Prop({ type: [Object], required: false })
  options?: QuestionOption[];

  @Prop({ type: [String], required: false })
  blanks?: string[];

  @Prop({ required: false })
  codeSnippet?: string;

  @Prop({ required: false })
  expectedOutput?: string;

  @Prop({ required: false })
  starterCode?: string;

  @Prop({ type: [Object], required: false })
  testCases?: TestCase[];

  @Prop({ type: [String], required: true, index: true })
  tagIds!: string[];

  @Prop({ required: true, index: true })
  categoryId!: string;

  @Prop({ required: false })
  topicId?: string;

  @Prop({ type: [String], required: true, index: true })
  companyIds!: string[];
}

export const QuestionSchema = SchemaFactory.createForClass(QuestionDocumentClass);
QuestionSchema.index({ categoryId: 1, difficulty: 1 });
QuestionSchema.index({ companyIds: 1, difficulty: 1 });
QuestionSchema.index({ title: 'text', markdown: 'text' });
