import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Category, Topic, Company, Tag } from '@onluyenphongvan/types';
import {
  ICategoryRepository,
  ITopicRepository,
  ICompanyRepository,
  ITagRepository,
} from '../domain/repositories.interface';
import { CategoryDocument, CategoryDocumentClass } from './category.schema';
import { TopicDocument, TopicDocumentClass } from './topic.schema';
import { CompanyDocument, CompanyDocumentClass } from './company.schema';
import { TagDocument, TagDocumentClass } from './tag.schema';

@Injectable()
export class CategoryRepositoryImpl implements ICategoryRepository {
  constructor(
    @InjectModel(CategoryDocumentClass.name)
    private readonly categoryModel: Model<CategoryDocument>
  ) {}

  async findAll(): Promise<Category[]> {
    const docs = await this.categoryModel.find().sort({ name: 1 }).exec();
    return docs.map((d) => ({
      _id: d._id.toString(),
      slug: d.slug,
      name: d.name,
      description: d.description,
      icon: d.icon,
      createdAt: (d as unknown as { createdAt: Date }).createdAt || new Date(),
      updatedAt: (d as unknown as { updatedAt: Date }).updatedAt || new Date(),
    }));
  }

  async findById(id: string): Promise<Category | null> {
    const d = await this.categoryModel.findById(id).exec();
    return d
      ? {
          _id: d._id.toString(),
          slug: d.slug,
          name: d.name,
          description: d.description,
          icon: d.icon,
          createdAt: (d as unknown as { createdAt: Date }).createdAt || new Date(),
          updatedAt: (d as unknown as { updatedAt: Date }).updatedAt || new Date(),
        }
      : null;
  }

  async findBySlug(slug: string): Promise<Category | null> {
    const d = await this.categoryModel.findOne({ slug }).exec();
    return d
      ? {
          _id: d._id.toString(),
          slug: d.slug,
          name: d.name,
          description: d.description,
          icon: d.icon,
          createdAt: (d as unknown as { createdAt: Date }).createdAt || new Date(),
          updatedAt: (d as unknown as { updatedAt: Date }).updatedAt || new Date(),
        }
      : null;
  }

  async create(data: Omit<Category, '_id' | 'createdAt' | 'updatedAt'>): Promise<Category> {
    const doc = new this.categoryModel(data);
    const d = await doc.save();
    return {
      _id: d._id.toString(),
      slug: d.slug,
      name: d.name,
      description: d.description,
      icon: d.icon,
      createdAt: (d as unknown as { createdAt: Date }).createdAt || new Date(),
      updatedAt: (d as unknown as { updatedAt: Date }).updatedAt || new Date(),
    };
  }
}

@Injectable()
export class TopicRepositoryImpl implements ITopicRepository {
  constructor(
    @InjectModel(TopicDocumentClass.name)
    private readonly topicModel: Model<TopicDocument>
  ) {}

  async findByCategory(categoryId: string): Promise<Topic[]> {
    const docs = await this.topicModel.find({ categoryId }).sort({ name: 1 }).exec();
    return docs.map((d) => ({
      _id: d._id.toString(),
      slug: d.slug,
      name: d.name,
      categoryId: d.categoryId,
      createdAt: (d as unknown as { createdAt: Date }).createdAt || new Date(),
      updatedAt: (d as unknown as { updatedAt: Date }).updatedAt || new Date(),
    }));
  }
}

@Injectable()
export class CompanyRepositoryImpl implements ICompanyRepository {
  constructor(
    @InjectModel(CompanyDocumentClass.name)
    private readonly companyModel: Model<CompanyDocument>
  ) {}

  async findAll(): Promise<Company[]> {
    const docs = await this.companyModel.find().sort({ name: 1 }).exec();
    return docs.map((d) => ({
      _id: d._id.toString(),
      slug: d.slug,
      name: d.name,
      logoUrl: d.logoUrl,
      createdAt: (d as unknown as { createdAt: Date }).createdAt || new Date(),
      updatedAt: (d as unknown as { updatedAt: Date }).updatedAt || new Date(),
    }));
  }

  async findBySlug(slug: string): Promise<Company | null> {
    const d = await this.companyModel.findOne({ slug }).exec();
    return d
      ? {
          _id: d._id.toString(),
          slug: d.slug,
          name: d.name,
          logoUrl: d.logoUrl,
          createdAt: (d as unknown as { createdAt: Date }).createdAt || new Date(),
          updatedAt: (d as unknown as { updatedAt: Date }).updatedAt || new Date(),
        }
      : null;
  }

  async create(data: Omit<Company, '_id' | 'createdAt' | 'updatedAt'>): Promise<Company> {
    const doc = new this.companyModel(data);
    const d = await doc.save();
    return {
      _id: d._id.toString(),
      slug: d.slug,
      name: d.name,
      logoUrl: d.logoUrl,
      createdAt: (d as unknown as { createdAt: Date }).createdAt || new Date(),
      updatedAt: (d as unknown as { updatedAt: Date }).updatedAt || new Date(),
    };
  }
}

@Injectable()
export class TagRepositoryImpl implements ITagRepository {
  constructor(
    @InjectModel(TagDocumentClass.name)
    private readonly tagModel: Model<TagDocument>
  ) {}

  async findAll(): Promise<Tag[]> {
    const docs = await this.tagModel.find().sort({ name: 1 }).exec();
    return docs.map((d) => ({
      _id: d._id.toString(),
      slug: d.slug,
      name: d.name,
      createdAt: (d as unknown as { createdAt: Date }).createdAt || new Date(),
      updatedAt: (d as unknown as { updatedAt: Date }).updatedAt || new Date(),
    }));
  }
}
