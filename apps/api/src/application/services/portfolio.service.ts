import { PortfolioItemModel } from '../../infrastructure/database/models/portfolio-item.model';
import { AuditHelper } from '../helpers/audit.helper';
import { ListQueryInput } from '@sk-makeup/shared';
import { parseListQuery, buildSearchFilter, softDeleteFilter } from '../../utils/query-builder';
import { uniqueSlug } from '../../utils/slugify';
import { releaseSlug } from '../../utils/slug-release';
import { NotFoundError } from '../../domain/errors';
import { randomBytes } from 'crypto';

const PREVIEW_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;

function previewExpiry() {
  return new Date(Date.now() + PREVIEW_TOKEN_TTL_MS);
}

function newPreviewToken() {
  return {
    previewToken: randomBytes(16).toString('hex'),
    previewTokenExpiresAt: previewExpiry(),
  };
}

export class PortfolioService {
  constructor(private readonly auditHelper: AuditHelper) {}

  private mapDoc(doc: InstanceType<typeof PortfolioItemModel>) {
    const o = doc.toObject();
    return {
      id: doc._id.toString(),
      ...o,
      _id: undefined,
      serviceReference: o.serviceReference?.toString(),
      createdBy: o.createdBy?.toString(),
      updatedBy: o.updatedBy?.toString(),
      createdAt: o.createdAt?.toISOString(),
      updatedAt: o.updatedAt?.toISOString(),
      publishedAt: o.publishedAt?.toISOString(),
      scheduledPublishAt: o.scheduledPublishAt?.toISOString(),
      previewTokenExpiresAt: o.previewTokenExpiresAt?.toISOString(),
    };
  }

  async processScheduledPublishes() {
    const now = new Date();
    await PortfolioItemModel.updateMany(
      { published: false, scheduledPublishAt: { $lte: now }, ...softDeleteFilter() },
      { $set: { published: true, publishedAt: now }, $unset: { scheduledPublishAt: 1 } },
    ).exec();
  }

  async list(query: ListQueryInput) {
    const { page, limit, skip, sort, search } = parseListQuery(query);
    const filter: Record<string, unknown> = { ...softDeleteFilter() };
    if (query.category) filter.category = query.category;
    if (query.featured !== undefined) filter.featured = query.featured;
    if (query.published !== undefined) filter.published = query.published;
    Object.assign(filter, buildSearchFilter(search, ['title', 'description', 'tags']));

    const [docs, total] = await Promise.all([
      PortfolioItemModel.find(filter).sort(sort).skip(skip).limit(limit).exec(),
      PortfolioItemModel.countDocuments(filter).exec(),
    ]);

    return { items: docs.map((d) => this.mapDoc(d)), total, page, limit };
  }

  async getById(id: string) {
    const doc = await PortfolioItemModel.findOne({ _id: id, ...softDeleteFilter() }).exec();
    if (!doc) throw new NotFoundError('Portfolio item not found');
    return this.mapDoc(doc);
  }

  async create(data: Record<string, unknown>, userId: string) {
    const slug = await uniqueSlug(data.title as string, async (s) => {
      const exists = await PortfolioItemModel.findOne({ slug: s }).exec();
      return !!exists;
    });

    const doc = await PortfolioItemModel.create({
      ...data,
      slug,
      ...newPreviewToken(),
      createdBy: userId,
      updatedBy: userId,
      publishedAt: data.published ? new Date() : undefined,
    });

    await this.auditHelper.log({ userId, action: 'portfolio.create', entityType: 'portfolio', entityId: doc._id.toString() });
    return this.mapDoc(doc);
  }

  async update(id: string, data: Record<string, unknown>, userId: string) {
    const existing = await PortfolioItemModel.findOne({ _id: id, ...softDeleteFilter() }).exec();
    if (!existing) throw new NotFoundError('Portfolio item not found');

    const payload: Record<string, unknown> = { updatedBy: userId };

    if (data.title !== undefined) payload.title = data.title;
    if (data.category !== undefined) payload.category = data.category;
    if (data.description !== undefined) payload.description = data.description;
    if (data.featuredImage !== undefined) payload.featuredImage = data.featuredImage;
    if (data.galleryImages !== undefined) payload.galleryImages = data.galleryImages;
    if (data.beforeImage !== undefined) payload.beforeImage = data.beforeImage;
    if (data.afterImage !== undefined) payload.afterImage = data.afterImage;
    if (data.tags !== undefined) payload.tags = data.tags;
    if (data.serviceReference !== undefined) payload.serviceReference = data.serviceReference;
    if (data.featured !== undefined) payload.featured = data.featured;
    if (data.published !== undefined) payload.published = data.published;
    if (data.displayOrder !== undefined) payload.displayOrder = data.displayOrder;
    if (data.seo !== undefined) payload.seo = data.seo;

    if (data.title && data.title !== existing.title) {
      payload.slug = await uniqueSlug(data.title as string, async (s) => {
        const exists = await PortfolioItemModel.findOne({ slug: s, _id: { $ne: id } }).exec();
        return !!exists;
      }, existing.slug);
    }

    if (data.published && !existing.published) payload.publishedAt = new Date();

    const unset: Record<string, 1> = {};
    if (data.published) unset.scheduledPublishAt = 1;
    if (data.scheduledPublishAt === null) unset.scheduledPublishAt = 1;
    else if (data.scheduledPublishAt !== undefined) payload.scheduledPublishAt = data.scheduledPublishAt;

    const updateOp: Record<string, unknown> = { $set: payload };
    if (Object.keys(unset).length > 0) updateOp.$unset = unset;

    const doc = await PortfolioItemModel.findByIdAndUpdate(id, updateOp, { new: true, runValidators: true }).exec();
    if (!doc) throw new NotFoundError('Portfolio item not found');

    await this.auditHelper.log({ userId, action: 'portfolio.update', entityType: 'portfolio', entityId: id });
    return this.mapDoc(doc);
  }

  async delete(id: string, userId: string) {
    const existing = await PortfolioItemModel.findOne({ _id: id, ...softDeleteFilter() }).exec();
    if (!existing) throw new NotFoundError('Portfolio item not found');
    const doc = await PortfolioItemModel.findOneAndUpdate(
      { _id: id, ...softDeleteFilter() },
      { deletedAt: new Date(), updatedBy: userId, slug: releaseSlug(existing.slug, id) },
      { new: true },
    ).exec();
    if (!doc) throw new NotFoundError('Portfolio item not found');
    await this.auditHelper.log({ userId, action: 'portfolio.delete', entityType: 'portfolio', entityId: id });
    return { id, deleted: true };
  }

  async reorderImages(id: string, images: unknown[], userId: string) {
    const doc = await PortfolioItemModel.findOneAndUpdate(
      { _id: id, ...softDeleteFilter() },
      { galleryImages: images, updatedBy: userId },
      { new: true },
    ).exec();
    if (!doc) throw new NotFoundError('Portfolio item not found');
    return this.mapDoc(doc);
  }

  async duplicate(id: string, userId: string) {
    const existing = await PortfolioItemModel.findOne({ _id: id, ...softDeleteFilter() }).exec();
    if (!existing) throw new NotFoundError('Portfolio item not found');

    const o = existing.toObject();
    const slug = await uniqueSlug(`${o.title} Copy`, async (s) => {
      const exists = await PortfolioItemModel.findOne({ slug: s, ...softDeleteFilter() }).exec();
      return !!exists;
    });

    const doc = await PortfolioItemModel.create({
      title: `${o.title} (Copy)`,
      slug,
      category: o.category,
      description: o.description,
      featuredImage: o.featuredImage,
      galleryImages: o.galleryImages,
      beforeImage: o.beforeImage,
      afterImage: o.afterImage,
      tags: o.tags,
      serviceReference: o.serviceReference,
      featured: false,
      published: false,
      seo: o.seo,
      displayOrder: o.displayOrder,
      ...newPreviewToken(),
      createdBy: userId,
      updatedBy: userId,
    });

    await this.auditHelper.log({ userId, action: 'portfolio.duplicate', entityType: 'portfolio', entityId: doc._id.toString() });
    return this.mapDoc(doc);
  }

  async regeneratePreviewToken(id: string, userId: string) {
    const tokenData = newPreviewToken();
    const doc = await PortfolioItemModel.findOneAndUpdate(
      { _id: id, ...softDeleteFilter() },
      { ...tokenData, updatedBy: userId },
      { new: true },
    ).exec();
    if (!doc) throw new NotFoundError('Portfolio item not found');
    return { id, previewToken: tokenData.previewToken, slug: doc.slug };
  }

  async getByPreviewToken(token: string) {
    const doc = await PortfolioItemModel.findOne({
      previewToken: token,
      ...softDeleteFilter(),
      $or: [
        { previewTokenExpiresAt: { $exists: false } },
        { previewTokenExpiresAt: { $gt: new Date() } },
      ],
    }).exec();
    if (!doc) throw new NotFoundError('Preview not found or expired');
    return this.mapDoc(doc);
  }
}
