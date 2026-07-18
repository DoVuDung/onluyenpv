import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Role } from '@onluyenphongvan/types';

export type UserDocument = UserDocumentClass & Document;

@Schema({
  collection: 'users',
  timestamps: true,
})
export class UserDocumentClass {
  @Prop({ required: true, unique: true, index: true })
  email!: string;

  @Prop({ required: true })
  passwordHash!: string;

  @Prop({ required: true })
  name!: string;

  @Prop({ required: true, enum: ['guest', 'user', 'premium', 'moderator', 'admin'], default: 'user' })
  role!: Role;

  @Prop({ required: false })
  avatarUrl?: string;

  readonly createdAt!: Date;
  readonly updatedAt!: Date;
}

export const UserSchema = SchemaFactory.createForClass(UserDocumentClass);
UserSchema.index({ email: 1 }, { unique: true });
