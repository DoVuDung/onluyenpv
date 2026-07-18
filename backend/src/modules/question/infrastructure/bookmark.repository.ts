import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Bookmark } from '@onluyenphongvan/types';
import { IBookmarkRepository } from '../domain/repositories.interface';
import { BookmarkDocument, BookmarkDocumentClass } from './bookmark.schema';

@Injectable()
export class BookmarkRepositoryImpl implements IBookmarkRepository {
  constructor(
    @InjectModel(BookmarkDocumentClass.name)
    private readonly bookmarkModel: Model<BookmarkDocument>
  ) {}

  private mapToDomain(doc: BookmarkDocument): Bookmark {
    return {
      _id: doc._id.toString(),
      userId: doc.userId,
      questionId: doc.questionId,
      createdAt: doc.createdAt || new Date(),
    };
  }

  async create(userId: string, questionId: string): Promise<Bookmark> {
    const doc = new this.bookmarkModel({ userId, questionId });
    const saved = await doc.save();
    return this.mapToDomain(saved);
  }

  async delete(userId: string, questionId: string): Promise<boolean> {
    const res = await this.bookmarkModel.deleteOne({ userId, questionId }).exec();
    return res.deletedCount > 0;
  }

  async findByUser(userId: string): Promise<Bookmark[]> {
    const docs = await this.bookmarkModel
      .find({ userId })
      .sort({ createdAt: -1 })
      .exec();
    return docs.map((doc) => this.mapToDomain(doc));
  }

  async exists(userId: string, questionId: string): Promise<boolean> {
    const count = await this.bookmarkModel.countDocuments({ userId, questionId }).exec();
    return count > 0;
  }
}
