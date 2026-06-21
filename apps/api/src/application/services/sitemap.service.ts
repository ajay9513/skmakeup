import { ServiceModel } from '../../infrastructure/database/models/service.model';
import { PortfolioItemModel } from '../../infrastructure/database/models/portfolio-item.model';
import { GalleryModel } from '../../infrastructure/database/models/gallery.model';
import { softDeleteFilter } from '../../utils/query-builder';
import { env } from '../../config/env';

const STATIC_PATHS = ['/', '/about', '/services', '/portfolio', '/gallery', '/testimonials', '/book', '/contact'];

export class SitemapService {
  async generateXml(): Promise<string> {
    const siteUrl = env.WEB_URL.replace(/\/$/, '');
    const now = new Date().toISOString();

    const [services, portfolio, galleries] = await Promise.all([
      ServiceModel.find({ isPublished: true, ...softDeleteFilter() }).select('slug updatedAt').lean().exec(),
      PortfolioItemModel.find({ published: true, ...softDeleteFilter() }).select('slug updatedAt').lean().exec(),
      GalleryModel.find({ isPublished: true, ...softDeleteFilter() }).select('slug updatedAt').lean().exec(),
    ]);

    const urls: { loc: string; lastmod?: string; changefreq?: string; priority?: string }[] = [
      ...STATIC_PATHS.map((path) => ({
        loc: `${siteUrl}${path}`,
        lastmod: now,
        changefreq: path === '/' ? 'weekly' : 'monthly',
        priority: path === '/' ? '1.0' : '0.8',
      })),
      ...services.map((s) => ({
        loc: `${siteUrl}/services/${s.slug}`,
        lastmod: (s.updatedAt as Date)?.toISOString?.() ?? now,
        changefreq: 'monthly',
        priority: '0.7',
      })),
      ...portfolio.map((p) => ({
        loc: `${siteUrl}/portfolio/${p.slug}`,
        lastmod: (p.updatedAt as Date)?.toISOString?.() ?? now,
        changefreq: 'monthly',
        priority: '0.7',
      })),
      ...galleries.map((g) => ({
        loc: `${siteUrl}/gallery#${g.slug}`,
        lastmod: (g.updatedAt as Date)?.toISOString?.() ?? now,
        changefreq: 'monthly',
        priority: '0.6',
      })),
    ];

    const body = urls
      .map(
        (u) => `  <url>
    <loc>${escapeXml(u.loc)}</loc>
    ${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ''}
    ${u.changefreq ? `<changefreq>${u.changefreq}</changefreq>` : ''}
    ${u.priority ? `<priority>${u.priority}</priority>` : ''}
  </url>`,
      )
      .join('\n');

    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</urlset>`;
  }
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
