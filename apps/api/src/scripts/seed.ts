import '../config/load-env';

import bcrypt from 'bcryptjs';
import { connectDatabase, disconnectDatabase } from '../config/database';
import { env } from '../config/env';
import { UserModel } from '../infrastructure/database/models/user.model';
import { SiteSettingsModel } from '../infrastructure/database/models/site-settings.model';
import { WebsiteContentModel } from '../infrastructure/database/models/website-content.model';
import { SeoModel } from '../infrastructure/database/models/seo.model';
import { CounterModel } from '../infrastructure/database/models/counter.model';
import { ServiceModel } from '../infrastructure/database/models/service.model';
import { AvailabilityModel } from '../infrastructure/database/models/availability.model';
import { TestimonialModel } from '../infrastructure/database/models/testimonial.model';
import { logger } from '../utils/logger';

const WEBSITE_CONTENT_SEEDS = [
  { key: 'homepage.hero.headline', page: 'homepage', section: 'hero', contentType: 'text', label: 'Hero Headline', value: 'Artistry That Transforms' },
  { key: 'homepage.hero.subheadline', page: 'homepage', section: 'hero', contentType: 'text', label: 'Hero Subheadline', value: 'Luxury makeup artistry for your most unforgettable moments' },
  { key: 'homepage.hero.ctaLabel', page: 'homepage', section: 'hero', contentType: 'text', label: 'Hero CTA Label', value: 'Book Your Session' },
  { key: 'homepage.hero.ctaHref', page: 'homepage', section: 'hero', contentType: 'text', label: 'Hero CTA Link', value: '/book' },
  { key: 'homepage.intro.title', page: 'homepage', section: 'intro', contentType: 'text', label: 'Intro Title', value: 'The SK Experience' },
  { key: 'homepage.intro.body', page: 'homepage', section: 'intro', contentType: 'richtext', label: 'Intro Body', value: 'Every face tells a story. We craft looks that honor yours with precision, passion, and an eye for timeless elegance.' },
  { key: 'homepage.cta.title', page: 'homepage', section: 'cta', contentType: 'text', label: 'CTA Title', value: 'Ready to Look Your Absolute Best?' },
  { key: 'homepage.cta.buttonLabel', page: 'homepage', section: 'cta', contentType: 'text', label: 'CTA Button', value: 'Schedule a Consultation' },
  { key: 'homepage.stats.experience', page: 'homepage', section: 'stats', contentType: 'text', label: 'Years Experience', value: '10+' },
  { key: 'homepage.stats.clients', page: 'homepage', section: 'stats', contentType: 'text', label: 'Happy Clients', value: '500+' },
  { key: 'homepage.stats.events', page: 'homepage', section: 'stats', contentType: 'text', label: 'Events', value: '1000+' },
  { key: 'homepage.stats.awards', page: 'homepage', section: 'stats', contentType: 'text', label: 'Awards', value: '15+' },
  { key: 'about.intro.headline', page: 'about', section: 'intro', contentType: 'text', label: 'About Headline', value: 'Meet SK' },
  { key: 'about.intro.story', page: 'about', section: 'intro', contentType: 'richtext', label: 'About Story', value: 'With years of experience in bridal, editorial, and celebrity makeup, SK brings award-winning artistry to every client.' },
  { key: 'about.experience.body', page: 'about', section: 'intro', contentType: 'richtext', label: 'Experience', value: 'A decade of mastering the art of luxury makeup across bridal, editorial, and red carpet events.' },
  { key: 'about.mission.body', page: 'about', section: 'intro', contentType: 'richtext', label: 'Mission', value: 'To make every client feel confident, radiant, and authentically beautiful on their most important day.' },
  { key: 'about.awards.body', page: 'about', section: 'intro', contentType: 'richtext', label: 'Awards', value: 'Recognized by leading beauty publications and bridal industry awards for excellence in artistry.' },
  { key: 'contact.intro.headline', page: 'contact', section: 'intro', contentType: 'text', label: 'Contact Headline', value: 'Get In Touch' },
  { key: 'contact.intro.description', page: 'contact', section: 'intro', contentType: 'text', label: 'Contact Description', value: 'We would love to hear about your upcoming event.' },
  { key: 'global.footer.tagline', page: 'global', section: 'footer', contentType: 'text', label: 'Footer Tagline', value: 'Luxury makeup artistry for life\'s most beautiful moments.' },
  { key: 'global.footer.copyright', page: 'global', section: 'footer', contentType: 'text', label: 'Copyright', value: '© SK Makeup Artist. All rights reserved.' },
  { key: 'global.business.address', page: 'global', section: 'business_info', contentType: 'text', label: 'Business Address', value: 'Bangalore, Karnataka, India' },
  { key: 'global.business.email', page: 'global', section: 'business_info', contentType: 'text', label: 'Business Email', value: 'admin@skmakeup.com' },
  { key: 'global.business.phone', page: 'global', section: 'business_info', contentType: 'text', label: 'Business Phone', value: '+91 9110883442' },
  { key: 'global.footer.link1.label', page: 'global', section: 'footer', contentType: 'text', label: 'Footer Link 1 Label', value: 'About' },
  { key: 'global.footer.link1.href', page: 'global', section: 'footer', contentType: 'text', label: 'Footer Link 1 URL', value: '/about' },
  { key: 'global.footer.link2.label', page: 'global', section: 'footer', contentType: 'text', label: 'Footer Link 2 Label', value: 'Services' },
  { key: 'global.footer.link2.href', page: 'global', section: 'footer', contentType: 'text', label: 'Footer Link 2 URL', value: '/services' },
  { key: 'global.footer.link3.label', page: 'global', section: 'footer', contentType: 'text', label: 'Footer Link 3 Label', value: 'Portfolio' },
  { key: 'global.footer.link3.href', page: 'global', section: 'footer', contentType: 'text', label: 'Footer Link 3 URL', value: '/portfolio' },
  { key: 'global.footer.link4.label', page: 'global', section: 'footer', contentType: 'text', label: 'Footer Link 4 Label', value: 'Book' },
  { key: 'global.footer.link4.href', page: 'global', section: 'footer', contentType: 'text', label: 'Footer Link 4 URL', value: '/book' },
  { key: 'global.nav.link1.label', page: 'global', section: 'navigation', contentType: 'text', label: 'Nav Link 1 Label', value: 'Home' },
  { key: 'global.nav.link1.href', page: 'global', section: 'navigation', contentType: 'text', label: 'Nav Link 1 URL', value: '/' },
  { key: 'global.nav.link2.label', page: 'global', section: 'navigation', contentType: 'text', label: 'Nav Link 2 Label', value: 'About' },
  { key: 'global.nav.link2.href', page: 'global', section: 'navigation', contentType: 'text', label: 'Nav Link 2 URL', value: '/about' },
  { key: 'global.nav.link3.label', page: 'global', section: 'navigation', contentType: 'text', label: 'Nav Link 3 Label', value: 'Services' },
  { key: 'global.nav.link3.href', page: 'global', section: 'navigation', contentType: 'text', label: 'Nav Link 3 URL', value: '/services' },
  { key: 'global.nav.link4.label', page: 'global', section: 'navigation', contentType: 'text', label: 'Nav Link 4 Label', value: 'Portfolio' },
  { key: 'global.nav.link4.href', page: 'global', section: 'navigation', contentType: 'text', label: 'Nav Link 4 URL', value: '/portfolio' },
  { key: 'global.nav.link5.label', page: 'global', section: 'navigation', contentType: 'text', label: 'Nav Link 5 Label', value: 'Gallery' },
  { key: 'global.nav.link5.href', page: 'global', section: 'navigation', contentType: 'text', label: 'Nav Link 5 URL', value: '/gallery' },
  { key: 'global.nav.link6.label', page: 'global', section: 'navigation', contentType: 'text', label: 'Nav Link 6 Label', value: 'Testimonials' },
  { key: 'global.nav.link6.href', page: 'global', section: 'navigation', contentType: 'text', label: 'Nav Link 6 URL', value: '/testimonials' },
  { key: 'global.nav.link7.label', page: 'global', section: 'navigation', contentType: 'text', label: 'Nav Link 7 Label', value: 'Contact' },
  { key: 'global.nav.link7.href', page: 'global', section: 'navigation', contentType: 'text', label: 'Nav Link 7 URL', value: '/contact' },
] as const;

const SEO_SEEDS = [
  { scope: 'page', page: 'homepage', metaTitle: 'SK Makeup Artist | Luxury Bridal & Editorial Makeup', metaDescription: 'Award-winning luxury makeup artistry specializing in bridal, editorial, and celebrity makeup.' },
  { scope: 'page', page: 'about', metaTitle: 'About SK Makeup Artist', metaDescription: 'Discover the story behind SK Makeup Artist and our passion for luxury beauty.' },
  { scope: 'page', page: 'contact', metaTitle: 'Contact SK Makeup Artist', metaDescription: 'Get in touch to book your luxury makeup session.' },
  { scope: 'page', page: 'services', metaTitle: 'Makeup Services | SK Makeup Artist', metaDescription: 'Explore our luxury makeup services including bridal, editorial, and special events.' },
  { scope: 'page', page: 'portfolio', metaTitle: 'Portfolio | SK Makeup Artist', metaDescription: 'Browse our portfolio of bridal, editorial, and celebrity makeup artistry.' },
  { scope: 'page', page: 'gallery', metaTitle: 'Gallery | SK Makeup Artist', metaDescription: 'Explore our gallery of bridal and editorial makeup artistry.' },
  { scope: 'page', page: 'packages', metaTitle: 'Packages | SK Makeup Artist', metaDescription: 'Luxury makeup packages tailored for your special day.' },
] as const;

async function seed(): Promise<void> {
  await connectDatabase();
  logger.info('Starting database seed...');

  let superAdmin = await UserModel.findOne({ role: 'super_admin' }).exec();

  if (!superAdmin && env.SUPER_ADMIN_EMAIL && env.SUPER_ADMIN_PASSWORD) {
    const passwordHash = await bcrypt.hash(env.SUPER_ADMIN_PASSWORD, env.BCRYPT_ROUNDS);
    superAdmin = await UserModel.create({
      firstName: env.SUPER_ADMIN_FIRST_NAME,
      lastName: env.SUPER_ADMIN_LAST_NAME,
      email: env.SUPER_ADMIN_EMAIL.toLowerCase(),
      passwordHash,
      role: 'super_admin',
      status: 'active',
      failedLoginAttempts: 0,
    });
    logger.info(`Super admin created: ${env.SUPER_ADMIN_EMAIL}`);
  } else if (superAdmin) {
    logger.info('Super admin already exists — skipping');
  } else {
    logger.warn('SUPER_ADMIN_EMAIL and SUPER_ADMIN_PASSWORD not set — skipping super admin creation');
  }

  const adminId = superAdmin?._id;

  if (adminId) {
    const existingSettings = await SiteSettingsModel.findOne({ isActive: true }).exec();
    if (!existingSettings) {
      await SiteSettingsModel.create({
        isActive: true,
        siteName: 'SK Makeup Artist',
        tagline: 'Luxury Makeup Artistry',
        faviconNote: 'Favicon files managed in public folder',
        contactDetails: {
          email: env.SUPER_ADMIN_EMAIL || 'admin@skmakeup.com',
          phone: '+91 9110883442',
          whatsappNumber: '+91 9110883442',
          address: 'Bangalore, Karnataka, India',
        },
        socialLinks: {},
        businessHours: {},
        analyticsIds: {},
        seoDefaults: {
          metaTitle: 'SK Makeup Artist | Luxury Bridal & Editorial Makeup',
          metaDescription: 'Award-winning luxury makeup artistry for bridal, editorial, and special events.',
        },
        conversionSettings: {
          stickyCtaEnabled: true,
          stickyCtaLabel: 'Book Now',
          stickyCtaHref: '/book',
          floatingWhatsappEnabled: true,
          floatingCallEnabled: true,
          portfolioCtaEnabled: true,
          portfolioCtaLabel: 'Book This Look',
        },
        maintenanceMode: false,
        updatedBy: adminId,
      });
      logger.info('Site settings seeded');
    }

    for (const content of WEBSITE_CONTENT_SEEDS) {
      await WebsiteContentModel.updateOne(
        { key: content.key, locale: 'en' },
        {
          $setOnInsert: {
            ...content,
            locale: 'en',
            isVisible: true,
            displayOrder: 0,
            updatedBy: adminId,
          },
        },
        { upsert: true },
      );
    }
    logger.info(`Website content seeded (${WEBSITE_CONTENT_SEEDS.length} keys)`);

    for (const seo of SEO_SEEDS) {
      await SeoModel.updateOne(
        { scope: seo.scope, page: seo.page, isActive: true },
        {
          $setOnInsert: {
            ...seo,
            keywords: ['makeup artist', 'bridal makeup', 'luxury makeup'],
            robots: 'index,follow',
            openGraph: { type: 'website' },
            structuredData: {},
            isActive: true,
            updatedBy: adminId,
          },
        },
        { upsert: true },
      );
    }
    logger.info(`SEO records seeded (${SEO_SEEDS.length} pages)`);

    const existingService = await ServiceModel.findOne({ slug: 'bridal-makeup', deletedAt: null }).exec();
    if (!existingService) {
      logger.info('Skipping sample service seed — upload a service with image via Admin after first media upload');
    }

    for (let dayOfWeek = 0; dayOfWeek <= 6; dayOfWeek += 1) {
      await AvailabilityModel.updateOne(
        { type: 'weekly', dayOfWeek, isActive: true },
        {
          $setOnInsert: {
            type: 'weekly',
            dayOfWeek,
            slots: [{ startTime: '09:00', endTime: '18:00', maxBookings: 2 }],
            isActive: true,
            allDay: false,
            createdBy: adminId,
            updatedBy: adminId,
          },
        },
        { upsert: true },
      );
    }
    logger.info('Weekly availability seeded (Mon–Sun)');

    const testimonials = [
      { clientName: 'Priya Sharma', clientRole: 'Bridal Client · Bangalore', content: 'SK made me feel like royalty on my wedding day. Flawless, long-lasting, and so elegant.', rating: 5 },
      { clientName: 'Ananya Reddy', clientRole: 'Reception Bride · Hyderabad', content: 'Every detail was perfect — from skin prep to the final glow. Highly recommend for bridal events.', rating: 5 },
      { clientName: 'Meera Kapoor', clientRole: 'Engagement · Mumbai', content: 'Professional, punctual, and incredibly talented. My makeup looked stunning in photos and in person.', rating: 5 },
      { clientName: 'Divya Nair', clientRole: 'Bridal Client · Kochi', content: 'The team understood my vision instantly. Soft glam that lasted through tears and dancing!', rating: 5 },
      { clientName: 'Kavya Iyer', clientRole: 'Sangeet · Chennai', content: 'Luxury experience from start to finish. I have never felt more confident and beautiful.', rating: 5 },
      { clientName: 'Riya Patel', clientRole: 'Bridal Client · Ahmedabad', content: 'My bridal look was timeless and radiant. Every photograph captured the glow perfectly.', rating: 5 },
      { clientName: 'Sneha Desai', clientRole: 'Reception · Pune', content: 'SK and the team were calm, professional, and magical on a hectic wedding morning.', rating: 5 },
      { clientName: 'Aishwarya Menon', clientRole: 'Bridal Client · Delhi', content: 'The HD finish looked incredible on camera and felt lightweight all day. Pure artistry.', rating: 5 },
      { clientName: 'Nandini Rao', clientRole: 'Engagement · Bengaluru', content: 'Rose-gold glam that matched my lehenga beautifully. Guests could not stop complimenting me.', rating: 5 },
      { clientName: 'Shruti Verma', clientRole: 'Bridal Client · Jaipur', content: 'From trial to wedding day, the experience was premium. Worth every rupee for my special day.', rating: 5 },
    ];
    for (const [i, t] of testimonials.entries()) {
      await TestimonialModel.updateOne(
        { clientName: t.clientName, deletedAt: { $exists: false } },
        {
          $setOnInsert: {
            ...t,
            isPublished: true,
            isFeatured: i < 3,
            displayOrder: i,
            createdBy: adminId,
            updatedBy: adminId,
          },
        },
        { upsert: true },
      );
    }
    logger.info(`Testimonials seeded (${testimonials.length})`);
    // Image-based samples are not seeded — upload real assets via Admin → Media Library to avoid broken Cloudinary URLs.
  }

  for (const counter of ['booking', 'lead']) {
    await CounterModel.updateOne(
      { _id: counter },
      { $setOnInsert: { sequence: 0 } },
      { upsert: true },
    );
  }
  logger.info('Counters initialized');

  await disconnectDatabase();
  logger.info('Seed completed successfully');
}

seed().catch((err) => {
  logger.error({ err }, 'Seed failed');
  process.exit(1);
});
