import { ServiceModel } from '../../infrastructure/database/models/service.model';
import { PortfolioItemModel } from '../../infrastructure/database/models/portfolio-item.model';
import mongoose from 'mongoose';
import { GalleryModel } from '../../infrastructure/database/models/gallery.model';
import { TestimonialModel } from '../../infrastructure/database/models/testimonial.model';
import { TeamMemberModel } from '../../infrastructure/database/models/team-member.model';
import { WebsiteContentModel } from '../../infrastructure/database/models/website-content.model';
import { SeoModel } from '../../infrastructure/database/models/seo.model';
import { SiteSettingsModel } from '../../infrastructure/database/models/site-settings.model';
import { BookingModel } from '../../infrastructure/database/models/booking.model';
import { AvailabilityModel } from '../../infrastructure/database/models/availability.model';
import { MediaAssetModel } from '../../infrastructure/database/models/media-asset.model';
import { AuditHelper } from '../helpers/audit.helper';
import { ListQueryInput } from '@sk-makeup/shared';
import { parseListQuery, buildSearchFilter, softDeleteFilter } from '../../utils/query-builder';
import { uniqueSlug } from '../../utils/slugify';
import { releaseSlug } from '../../utils/slug-release';
import { NotFoundError } from '../../domain/errors';
import { LeadModel } from '../../infrastructure/database/models/lead.model';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ModelType = mongoose.Model<any>;

function createContentService(
  model: ModelType,
  entityType: string,
  searchFields: string[],
  auditHelper: AuditHelper,
  options?: { slugField?: string; titleField?: string; softDelete?: boolean },
) {
  const slugField = options?.slugField ?? 'slug';
  const titleField = options?.titleField ?? 'title';
  const useSoftDelete = options?.softDelete ?? true;

  const baseFilter = () => (useSoftDelete ? softDeleteFilter() : {});

  const mapDoc = (doc: mongoose.Document) => {
    const o = doc.toObject() as Record<string, unknown>;
    return {
      id: doc._id.toString(),
      ...o,
      _id: undefined,
      createdAt: (o.createdAt as Date)?.toISOString?.(),
      updatedAt: (o.updatedAt as Date)?.toISOString?.(),
    };
  };

  return {
    async list(query: ListQueryInput & Record<string, unknown>) {
      const { page, limit, skip, sort, search } = parseListQuery(query);
      const filter: Record<string, unknown> = { ...baseFilter() };
      if (query.category) filter.category = query.category;
      if (query.featured !== undefined) filter.featured = query.featured;
      if (query.published !== undefined) filter.published = query.published;
      if (query.isPublished !== undefined) filter.isPublished = query.isPublished;
      if (query.page_filter) filter.page = query.page_filter;
      Object.assign(filter, buildSearchFilter(search, searchFields));

      const [docs, total] = await Promise.all([
        model.find(filter).sort(sort).skip(skip).limit(limit).exec(),
        model.countDocuments(filter).exec(),
      ]);

      return { items: docs.map(mapDoc), total, page, limit };
    },

    async getById(id: string) {
      const doc = await model.findOne({ _id: id, ...baseFilter() }).exec();
      if (!doc) throw new NotFoundError(`${entityType} not found`);
      return mapDoc(doc);
    },

    async create(data: Record<string, unknown>, userId: string) {
      const payload = { ...data, createdBy: userId, updatedBy: userId };

      if (titleField in data && typeof data[titleField] === 'string') {
        (payload as Record<string, string>)[slugField] = await uniqueSlug(data[titleField] as string, async (s) => {
          const exists = await model.findOne({ [slugField]: s }).exec();
          return !!exists;
        });
      }

      if (entityType === 'team_member' && 'name' in data) {
        (payload as Record<string, string>).slug = await uniqueSlug(data.name as string, async (s) => {
          const exists = await model.findOne({ slug: s }).exec();
          return !!exists;
        });
      }

      const doc = await model.create(payload);
      await auditHelper.log({ userId, action: `${entityType}.create`, entityType, entityId: doc._id.toString() });
      return mapDoc(doc);
    },

    async update(id: string, data: Record<string, unknown>, userId: string) {
      const existing = await model.findOne({ _id: id, ...baseFilter() }).exec();
      if (!existing) throw new NotFoundError(`${entityType} not found`);

      const payload = { ...data, updatedBy: userId };

      if (titleField in data && data[titleField] !== (existing.toObject() as Record<string, unknown>)[titleField]) {
        (payload as Record<string, string>)[slugField] = await uniqueSlug(data[titleField] as string, async (s) => {
          const exists = await model.findOne({ [slugField]: s, _id: { $ne: id } }).exec();
          return !!exists;
        }, (existing.toObject() as Record<string, string>)[slugField]);
      }

      const doc = await model.findByIdAndUpdate(id, payload, { new: true }).exec();
      if (!doc) throw new NotFoundError(`${entityType} not found`);
      await auditHelper.log({ userId, action: `${entityType}.update`, entityType, entityId: id });
      return mapDoc(doc);
    },

    async delete(id: string, userId: string) {
      if (useSoftDelete) {
        const existing = await model.findOne({ _id: id, ...baseFilter() }).exec();
        if (!existing) throw new NotFoundError(`${entityType} not found`);
        const currentSlug = (existing.toObject() as Record<string, string>)[slugField];
        const doc = await model.findOneAndUpdate(
          { _id: id, ...baseFilter() },
          {
            deletedAt: new Date(),
            updatedBy: userId,
            ...(currentSlug ? { [slugField]: releaseSlug(currentSlug, id) } : {}),
          },
          { new: true },
        ).exec();
        if (!doc) throw new NotFoundError(`${entityType} not found`);
      } else {
        const result = await model.findByIdAndDelete(id).exec();
        if (!result) throw new NotFoundError(`${entityType} not found`);
      }
      await auditHelper.log({ userId, action: `${entityType}.delete`, entityType, entityId: id });
      return { id, deleted: true };
    },
  };
}

export class ServiceCatalogService {
  private crud: ReturnType<typeof createContentService>;

  constructor(auditHelper: AuditHelper) {
    this.crud = createContentService(ServiceModel, 'service', ['title', 'shortDescription'], auditHelper);
  }

  list = (q: ListQueryInput) => this.crud.list(q);
  getById = (id: string) => this.crud.getById(id);
  create = (d: Record<string, unknown>, u: string) => this.crud.create(d, u);
  update = (id: string, d: Record<string, unknown>, u: string) => this.crud.update(id, d, u);
  delete = (id: string, u: string) => this.crud.delete(id, u);
}

export class GalleryService {
  private crud: ReturnType<typeof createContentService>;

  constructor(auditHelper: AuditHelper) {
    this.crud = createContentService(GalleryModel, 'gallery', ['title', 'description'], auditHelper);
  }

  list = (q: ListQueryInput) => this.crud.list(q);
  getById = (id: string) => this.crud.getById(id);
  create = (d: Record<string, unknown>, u: string) => this.crud.create(d, u);
  update = (id: string, d: Record<string, unknown>, u: string) => this.crud.update(id, d, u);
  delete = (id: string, u: string) => this.crud.delete(id, u);

  async reorderImages(id: string, images: unknown[], userId: string) {
    const doc = await GalleryModel.findOneAndUpdate(
      { _id: id, ...softDeleteFilter() },
      { images, updatedBy: userId },
      { new: true },
    ).exec();
    if (!doc) throw new NotFoundError('Gallery not found');
    return { id, images: doc.images };
  }
}

export class TestimonialService {
  private crud: ReturnType<typeof createContentService>;

  constructor(auditHelper: AuditHelper) {
    this.crud = createContentService(TestimonialModel, 'testimonial', ['clientName', 'content'], auditHelper);
  }

  list = (q: ListQueryInput) => this.crud.list(q);
  getById = (id: string) => this.crud.getById(id);
  create = (d: Record<string, unknown>, u: string) => this.crud.create(d, u);
  update = (id: string, d: Record<string, unknown>, u: string) => this.crud.update(id, d, u);
  delete = (id: string, u: string) => this.crud.delete(id, u);
}

export class TeamMemberService {
  private crud: ReturnType<typeof createContentService>;

  constructor(auditHelper: AuditHelper) {
    this.crud = createContentService(TeamMemberModel, 'team_member', ['name', 'designation'], auditHelper, { titleField: 'name' });
  }

  list = (q: ListQueryInput) => this.crud.list(q);
  getById = (id: string) => this.crud.getById(id);
  create = (d: Record<string, unknown>, u: string) => this.crud.create(d, u);
  update = (id: string, d: Record<string, unknown>, u: string) => this.crud.update(id, d, u);
  delete = (id: string, u: string) => this.crud.delete(id, u);
}

export class WebsiteContentService {
  private crud: ReturnType<typeof createContentService>;

  constructor(auditHelper: AuditHelper) {
    this.crud = createContentService(WebsiteContentModel, 'website_content', ['key', 'label'], auditHelper, { softDelete: false, titleField: 'key', slugField: 'key' });
  }

  list = (q: ListQueryInput & { page_filter?: string }) => this.crud.list(q);
  getById = (id: string) => this.crud.getById(id);
  create = (d: Record<string, unknown>, u: string) => this.crud.create(d, u);
  update = (id: string, d: Record<string, unknown>, u: string) => this.crud.update(id, d, u);
  delete = (id: string, u: string) => this.crud.delete(id, u);

  async getByPage(page: string, includeHidden = false) {
    const filter: Record<string, unknown> = { page };
    if (!includeHidden) filter.isVisible = true;
    const docs = await WebsiteContentModel.find(filter).sort({ displayOrder: 1 }).exec();
    return docs.map((d) => ({
      id: d._id.toString(),
      key: d.key,
      page: d.page,
      section: d.section,
      contentType: d.contentType,
      label: d.label,
      value: d.value,
      image: d.image,
      locale: d.locale,
      displayOrder: d.displayOrder,
      metadata: d.metadata,
    }));
  }
}

export class SeoService {
  private crud: ReturnType<typeof createContentService>;

  constructor(auditHelper: AuditHelper) {
    this.crud = createContentService(SeoModel, 'seo', ['metaTitle', 'metaDescription'], auditHelper, { softDelete: false, titleField: 'metaTitle', slugField: 'slug' });
  }

  list = (q: ListQueryInput) => this.crud.list(q);
  getById = (id: string) => this.crud.getById(id);
  create = (d: Record<string, unknown>, u: string) => this.crud.create({ ...d, updatedBy: u }, u);
  update = (id: string, d: Record<string, unknown>, u: string) => this.crud.update(id, { ...d, updatedBy: u }, u);
  delete = (id: string, u: string) => this.crud.delete(id, u);
}

export class SiteSettingsService {
  constructor(private readonly auditHelper: AuditHelper) {}

  async get() {
    const doc = await SiteSettingsModel.findOne({ isActive: true }).exec();
    if (!doc) throw new NotFoundError('Site settings not found');
    return { id: doc._id.toString(), ...doc.toObject(), _id: undefined };
  }

  async update(data: Record<string, unknown>, userId: string) {
    const doc = await SiteSettingsModel.findOneAndUpdate(
      { isActive: true },
      { ...data, updatedBy: userId },
      { new: true },
    ).exec();
    if (!doc) throw new NotFoundError('Site settings not found');
    await this.auditHelper.log({ userId, action: 'site_settings.update', entityType: 'site_settings', entityId: doc._id.toString() });
    return { id: doc._id.toString(), ...doc.toObject(), _id: undefined };
  }
}

export class BookingService {
  constructor(private readonly auditHelper: AuditHelper) {}

  async list(query: ListQueryInput & { status?: string }) {
    const { page, limit, skip, sort, search } = parseListQuery(query);
    const filter: Record<string, unknown> = {};
    if (query.status) filter.status = query.status;
    Object.assign(filter, buildSearchFilter(search, ['customerName', 'customerEmail', 'bookingNumber']));

    const [docs, total] = await Promise.all([
      BookingModel.find(filter).sort(sort).skip(skip).limit(limit).exec(),
      BookingModel.countDocuments(filter).exec(),
    ]);

    return {
      items: docs.map((d) => ({ id: d._id.toString(), ...d.toObject(), _id: undefined })),
      total,
      page,
      limit,
    };
  }

  async getById(id: string) {
    const doc = await BookingModel.findById(id).exec();
    if (!doc) throw new NotFoundError('Booking not found');
    return { id: doc._id.toString(), ...doc.toObject(), _id: undefined };
  }

  async updateStatus(id: string, data: Record<string, unknown>, userId: string) {
    const doc = await BookingModel.findByIdAndUpdate(id, data, { new: true }).exec();
    if (!doc) throw new NotFoundError('Booking not found');
    await this.auditHelper.log({ userId, action: 'booking.status_update', entityType: 'booking', entityId: id, metadata: data });
    return { id: doc._id.toString(), ...doc.toObject(), _id: undefined };
  }
}

export class AvailabilityService {
  constructor(private readonly auditHelper: AuditHelper) {}

  async getWeekly() {
    return AvailabilityModel.find({ type: 'weekly', isActive: true }).sort({ dayOfWeek: 1 }).exec();
  }

  async setWeekly(dayOfWeek: number, slots: unknown[], userId: string) {
    const doc = await AvailabilityModel.findOneAndUpdate(
      { type: 'weekly', dayOfWeek, isActive: true },
      { type: 'weekly', dayOfWeek, slots, isActive: true, allDay: false, createdBy: userId, updatedBy: userId },
      { upsert: true, new: true },
    ).exec();
    await this.auditHelper.log({ userId, action: 'availability.weekly_update', entityType: 'availability', entityId: doc!._id.toString() });
    return doc;
  }

  async getBlockedDates() {
    return AvailabilityModel.find({ type: 'blocked_date', isActive: true }).sort({ date: 1 }).exec();
  }

  async addBlockedDate(data: Record<string, unknown>, userId: string) {
    const date = new Date(data.date as string);
    date.setHours(0, 0, 0, 0);
    const doc = await AvailabilityModel.findOneAndUpdate(
      { type: 'blocked_date', date, isActive: true },
      { ...data, type: 'blocked_date', date, isActive: true, createdBy: userId, updatedBy: userId },
      { upsert: true, new: true },
    ).exec();
    await this.auditHelper.log({ userId, action: 'availability.block_date', entityType: 'availability', entityId: doc!._id.toString() });
    return doc;
  }

  async removeBlockedDate(id: string, userId: string) {
    await AvailabilityModel.findByIdAndUpdate(id, { isActive: false, updatedBy: userId }).exec();
    await this.auditHelper.log({ userId, action: 'availability.unblock_date', entityType: 'availability', entityId: id });
    return { id, removed: true };
  }

  async getAvailableSlots(dateStr: string) {
    const date = new Date(dateStr);
    date.setHours(0, 0, 0, 0);
    const dayOfWeek = date.getDay();

    const blocked = await AvailabilityModel.findOne({
      type: 'blocked_date',
      date,
      isActive: true,
    }).exec();

    if (blocked?.allDay) return { date: dateStr, slots: [], available: false, reason: blocked.reason || 'Blocked' };

    const weekly = await AvailabilityModel.findOne({ type: 'weekly', dayOfWeek, isActive: true }).exec();
    if (!weekly?.slots?.length) return { date: dateStr, slots: [], available: false, reason: 'No availability configured' };

    const bookings = await BookingModel.find({
      bookingDate: date,
      status: { $in: ['pending', 'confirmed', 'rescheduled'] },
    }).exec();

    const bookingCounts: Record<string, number> = {};
    bookings.forEach((b) => {
      bookingCounts[b.bookingTime] = (bookingCounts[b.bookingTime] || 0) + 1;
    });

    const slots = weekly.slots.map((slot) => {
      const booked = bookingCounts[slot.startTime] || 0;
      const remaining = Math.max(0, slot.maxBookings - booked);
      return {
        startTime: slot.startTime,
        endTime: slot.endTime,
        maxBookings: slot.maxBookings,
        booked,
        remaining,
        available: remaining > 0,
      };
    });

    return { date: dateStr, slots, available: slots.some((s) => s.available) };
  }
}

export class DashboardService {
  async getStats() {
    const [services, portfolio, gallery, bookings, media, leads] = await Promise.all([
      ServiceModel.countDocuments({ deletedAt: { $exists: false } }).exec(),
      PortfolioItemModel.countDocuments({ deletedAt: { $exists: false } }).exec(),
      GalleryModel.countDocuments({ deletedAt: { $exists: false } }).exec(),
      BookingModel.countDocuments({ status: 'pending' }).exec(),
      MediaAssetModel.countDocuments({ status: 'active' }).exec(),
      LeadModel.countDocuments({ stage: 'New' }).exec(),
    ]);

    const recentBookings = await BookingModel.find().sort({ createdAt: -1 }).limit(5).lean().exec();

    return {
      counts: { services, portfolio, gallery, pendingBookings: bookings, media, newLeads: leads },
      recentBookings,
    };
  }
}
