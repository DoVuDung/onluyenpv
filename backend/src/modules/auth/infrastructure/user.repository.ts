import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, Role } from '@onluyenphongvan/types';
import { UserDocument, UserDocumentClass } from './user.schema';

export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<(User & { passwordHash: string }) | null>;
  create(data: { email: string; passwordHash: string; name: string; role?: Role }): Promise<User>;
}

@Injectable()
export class UserRepositoryImpl implements IUserRepository {
  constructor(
    @InjectModel(UserDocumentClass.name)
    private readonly userModel: Model<UserDocument>
  ) {}

  private mapToDomain(doc: UserDocument): User {
    return {
      _id: doc._id.toString(),
      email: doc.email,
      name: doc.name,
      role: doc.role,
      avatarUrl: doc.avatarUrl,
      createdAt: (doc as unknown as { createdAt: Date }).createdAt || new Date(),
      updatedAt: (doc as unknown as { updatedAt: Date }).updatedAt || new Date(),
    };
  }

  async findById(id: string): Promise<User | null> {
    const doc = await this.userModel.findById(id).exec();
    return doc ? this.mapToDomain(doc) : null;
  }

  async findByEmail(email: string): Promise<(User & { passwordHash: string }) | null> {
    const doc = await this.userModel.findOne({ email }).exec();
    if (!doc) {
      return null;
    }
    const domain = this.mapToDomain(doc);
    return {
      ...domain,
      passwordHash: doc.passwordHash,
    };
  }

  async create(data: {
    email: string;
    passwordHash: string;
    name: string;
    role?: Role;
  }): Promise<User> {
    const doc = new this.userModel({
      email: data.email,
      passwordHash: data.passwordHash,
      name: data.name,
      role: data.role ?? 'user',
    });
    const saved = await doc.save();
    return this.mapToDomain(saved);
  }
}
