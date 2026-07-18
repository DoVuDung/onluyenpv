import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CompanyDocument = CompanyDocumentClass & Document;

@Schema({
  collection: 'companies',
  timestamps: true,
})
export class CompanyDocumentClass {
  @Prop({ required: true, unique: true, index: true })
  slug!: string;

  @Prop({ required: true })
  name!: string;

  @Prop({ required: false })
  logoUrl?: string;

  readonly createdAt!: Date;
  readonly updatedAt!: Date;
}

export const CompanySchema = SchemaFactory.createForClass(CompanyDocumentClass);
CompanySchema.index({ slug: 1 }, { unique: true });
