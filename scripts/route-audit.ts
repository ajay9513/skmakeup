/**
 * Route + feature audit — HTTP status checks for SPA and API.
 * Usage: cd apps/api && npx tsx ../../scripts/route-audit.ts
 */
const API = process.env.API_BASE ?? 'http://localhost:5000/api/v1';
const WEB = process.env.WEB_BASE ?? 'http://localhost:5173';
const ADMIN = process.env.ADMIN_BASE ?? 'http://localhost:5174';

type Row = { route: string; status: number; ok: boolean; note?: string };
const rows: Row[] = [];

async function check(base: string, path: string, label: string) {
  try {
    const res = await fetch(`${base}${path}`);
    const ok = res.status === 200;
    const ct = res.headers.get('content-type') || '';
    rows.push({ route: label, status: res.status, ok, note: ct.includes('html') ? 'html' : ct.slice(0, 30) });
  } catch (e) {
    rows.push({ route: label, status: 0, ok: false, note: String(e) });
  }
}

async function main() {
  console.log('\n=== Route Audit ===\n');

  const publicWeb = ['/', '/about', '/services', '/portfolio', '/gallery', '/testimonials', '/contact', '/book'];
  for (const p of publicWeb) await check(WEB, p, `WEB ${p}`);

  const adminRoutes = ['/', '/services', '/portfolio', '/gallery', '/bookings', '/testimonials', '/team', '/content', '/seo', '/settings', '/media', '/login'];
  for (const p of adminRoutes) await check(ADMIN, p, `ADMIN ${p}`);

  const publicApi = [
    '/health',
    '/public/site-settings',
    '/public/content/homepage',
    '/public/seo/homepage',
    '/public/services?page=1&limit=10',
    '/public/portfolio?page=1&limit=10',
    '/public/gallery?page=1&limit=10',
    '/public/testimonials',
    '/public/team-members',
  ];
  for (const p of publicApi) await check(API, p, `API ${p}`);

  rows.forEach((r) => console.log(`${r.ok ? 'PASS' : 'FAIL'} ${r.route} → ${r.status} ${r.note || ''}`));
  const fail = rows.filter((r) => !r.ok).length;
  console.log(`\n${rows.length - fail}/${rows.length} routes OK\n`);
  if (fail) process.exit(1);
}

main();
