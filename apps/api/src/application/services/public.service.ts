import { ServiceModel } from '../../infrastructure/database/models/service.model';
import { PackageModel } from '../../infrastructure/database/models/package.model';
import { PortfolioItemModel } from '../../infrastructure/database/models/portfolio-item.model';
import { GalleryModel } from '../../infrastructure/database/models/gallery.model';
import { TestimonialModel } from '../../infrastructure/database/models/testimonial.model';
import { TeamMemberModel } from '../../infrastructure/database/models/team-member.model';
import { WebsiteContentModel } from '../../infrastructure/database/models/website-content.model';
import { SiteSettingsModel } from '../../infrastructure/database/models/site-settings.model';
import { SeoModel } from '../../infrastructure/database/models/seo.model';
import { BookingModel } from '../../infrastructure/database/models/booking.model';
import { ContactMessageModel } from '../../infrastructure/database/models/contact-message.model';
import { LeadModel } from '../../infrastructure/database/models/lead.model';
import { AvailabilityService } from './content.services';
import { PortfolioService } from './portfolio.service';
import { CounterRepository } from '../../infrastructure/database/repositories/counter.repository';
import { ListQueryInput } from '@sk-makeup/shared';
import { parseListQuery, buildSearchFilter, softDeleteFilter } from '../../utils/query-builder';
import { NotFoundError, BadRequestError } from '../../domain/errors';
import { toPublicSiteSettings } from '../../utils/public-settings';

export class PublicService {
  constructor(
    private readonly availabilityService: AvailabilityService,
    private readonly counterRepository: CounterRepository,
    private readonly portfolioService: PortfolioService,
  ) {}

  async getSiteSettings() {
    const doc = await SiteSettingsModel.findOne({ isActive: true }).lean().exec();
    if (!doc) throw new NotFoundError('Site settings not found');
    return toPublicSiteSettings(doc as Record<string, unknown>);
  }

  async getPageContent(page: string) {
    const items = await WebsiteContentModel.find({ page, isVisible: true, locale: 'en' })
      .sort({ displayOrder: 1 })
      .lean()
      .exec();
    const map: Record<string, unknown> = {};
    items.forEach((item) => { map[item.key] = item.value; });
    return { page, content: map, sections: items };
  }

  async getSeo(page: string) {
    const seo = await SeoModel.findOne({ scope: 'page', page, isActive: true }).lean().exec();
    const settings = await SiteSettingsModel.findOne({ isActive: true }).select('siteName seoDefaults').lean().exec();
    return { seo, defaults: settings?.seoDefaults, siteName: settings?.siteName };
  }

  async getServices(query: ListQueryInput) {
    const { page, limit, skip, sort, search } = parseListQuery(query);
    const filter: Record<string, unknown> = { isPublished: true, ...softDeleteFilter(), ...buildSearchFilter(search, ['title', 'shortDescription']) };
    if (query.category) filter.category = query.category;
    if (query.featured !== undefined) filter.isFeatured = query.featured;

    const [items, total] = await Promise.all([
      ServiceModel.find(filter).select('-createdBy -updatedBy').sort(sort).skip(skip).limit(limit).lean().exec(),
      ServiceModel.countDocuments(filter).exec(),
    ]);
    return { items, total, page, limit };
  }

  async getServiceBySlug(slug: string) {
    const doc = await ServiceModel.findOne({ slug, isPublished: true, ...softDeleteFilter() }).lean().exec();
    if (!doc) throw new NotFoundError('Service not found');
    return doc;
  }

  async getPackages() {
    const items = await PackageModel.find({ isPublished: true, ...softDeleteFilter() })
      .select('-createdBy -updatedBy')
      .sort({ displayOrder: 1 })
      .populate('includedServices', 'title slug startingPrice')
      .lean()
      .exec();
    return items;
  }

  async getPortfolio(query: ListQueryInput) {
    await this.portfolioService.processScheduledPublishes();
    const { page, limit, skip, sort, search } = parseListQuery(query);
    const filter: Record<string, unknown> = { published: true, ...softDeleteFilter() };
    if (query.category) filter.category = query.category;
    if (query.featured !== undefined) filter.featured = query.featured;
    Object.assign(filter, buildSearchFilter(search, ['title', 'description', 'tags']));

    const [items, total] = await Promise.all([
      PortfolioItemModel.find(filter).sort(sort).skip(skip).limit(limit).lean().exec(),
      PortfolioItemModel.countDocuments(filter).exec(),
    ]);
    return { items, total, page, limit };
  }

  async getPortfolioBySlug(slug: string) {
    await this.portfolioService.processScheduledPublishes();
    const doc = await PortfolioItemModel.findOneAndUpdate(
      { slug, published: true, ...softDeleteFilter() },
      { $inc: { viewCount: 1 } },
      { new: true },
    ).lean().exec();
    if (!doc) throw new NotFoundError('Portfolio item not found');

    const related = await PortfolioItemModel.find({
      published: true,
      ...softDeleteFilter(),
      category: doc.category,
      _id: { $ne: doc._id },
    }).limit(4).lean().exec();

    return { item: doc, related };
  }

  async getPortfolioPreview(token: string) {
    const item = await this.portfolioService.getByPreviewToken(token);
    return { item, preview: true };
  }

  async getGallery(query: ListQueryInput) {
    const { page, limit, skip, sort, search } = parseListQuery(query);
    const filter: Record<string, unknown> = { isPublished: true, ...softDeleteFilter() };
    if (query.category) filter.category = query.category;
    Object.assign(filter, buildSearchFilter(search, ['title', 'description']));

    const [items, total] = await Promise.all([
      GalleryModel.find(filter).sort(sort).skip(skip).limit(limit).lean().exec(),
      GalleryModel.countDocuments(filter).exec(),
    ]);
    return { items, total, page, limit };
  }

  async getTestimonials() {
    return TestimonialModel.find({ isPublished: true, ...softDeleteFilter() })
      .sort({ displayOrder: 1 })
      .limit(50)
      .lean()
      .exec();
  }

  async getTeamMembers() {
    return TeamMemberModel.find({ isPublished: true, ...softDeleteFilter() })
      .sort({ displayOrder: 1 })
      .lean()
      .exec();
  }

  async getAvailableSlots(date: string) {
    return this.availabilityService.getAvailableSlots(date);
  }

  async createBooking(data: Record<string, unknown>, req: { ipAddress?: string; userAgent?: string }) {
    if (data.website) throw new BadRequestError('Invalid submission');

    const slots = await this.availabilityService.getAvailableSlots(data.bookingDate as string);
    const slot = slots.slots.find((s) => s.startTime === data.bookingTime);
    if (!slot?.available) throw new BadRequestError('Selected time slot is not available');

    const bookingDate = new Date(data.bookingDate as string);
    const existing = await BookingModel.findOne({
      bookingDate,
      bookingTime: data.bookingTime,
      status: { $in: ['pending', 'confirmed'] },
    }).exec();

    if (existing) throw new BadRequestError('Selected time slot is not available');

    const seq = await this.counterRepository.getNextSequence('booking');
    const year = new Date().getFullYear();
    const bookingNumber = `SK-B-${year}-${String(seq).padStart(5, '0')}`;

    try {
      const booking = await BookingModel.create({
        bookingNumber,
        customerName: data.customerName,
        customerEmail: data.customerEmail,
        customerPhone: data.customerPhone,
        selectedService: data.selectedService,
        selectedPackage: data.selectedPackage,
        bookingDate,
        bookingTime: data.bookingTime,
        notes: data.notes,
        status: 'pending',
        source: 'website',
        ipAddress: req.ipAddress,
        userAgent: req.userAgent,
      });

      const leadSeq = await this.counterRepository.getNextSequence('lead');
      const lead = await LeadModel.create({
        leadNumber: `SK-L-${year}-${String(leadSeq).padStart(5, '0')}`,
        leadName: data.customerName,
        email: data.customerEmail as string,
        phone: data.customerPhone as string,
        source: 'booking_form',
        stage: 'New',
        convertedBookingId: booking._id,
        eventDate: bookingDate,
      });

      await BookingModel.findByIdAndUpdate(booking._id, { leadId: lead._id }).exec();

      return { bookingNumber, id: booking._id.toString() };
    } catch (err) {
      if (err && typeof err === 'object' && 'code' in err && (err as { code: number }).code === 11000) {
        throw new BadRequestError('Selected time slot is not available');
      }
      throw err;
    }
  }

  async createContact(data: Record<string, unknown>, req: { ipAddress?: string; userAgent?: string }) {
    if (data.website) throw new BadRequestError('Invalid submission');

    const message = await ContactMessageModel.create({
      name: data.name,
      email: data.email,
      phone: data.phone,
      subject: data.subject,
      message: data.message,
      status: 'new',
      ipAddress: req.ipAddress,
      userAgent: req.userAgent,
    });

    const leadSeq = await this.counterRepository.getNextSequence('lead');
    const year = new Date().getFullYear();
    const lead = await LeadModel.create({
      leadNumber: `SK-L-${year}-${String(leadSeq).padStart(5, '0')}`,
      leadName: data.name,
      email: data.email as string,
      phone: (data.phone as string) || '',
      source: 'contact_form',
      stage: 'New',
      contactMessageId: message._id,
      notes: data.message as string,
    });

    await ContactMessageModel.findByIdAndUpdate(message._id, { leadId: lead._id }).exec();

    return { id: message._id.toString() };
  }
}
