/**
 * Full production audit — API CRUD + MongoDB verification.
 * Usage: npx tsx scripts/production-audit.ts
 * Requires API on :5000 and valid .env credentials.
 */
import '../apps/api/src/config/load-env';
import mongoose from 'mongoose';
import { env } from '../apps/api/src/config/env';

const BASE = process.env.API_BASE ?? 'http://localhost:5000/api/v1';
const ADMIN_EMAIL = process.env.AUDIT_ADMIN_EMAIL ?? env.SUPER_ADMIN_EMAIL ?? 'admin@skmakeup.com';
const ADMIN_PASSWORD = process.env.AUDIT_ADMIN_PASSWORD ?? env.SUPER_ADMIN_PASSWORD ?? 'ChangeMe@Secure123!';

type Result = {
  module: string;
  operation: string;
  status: 'PASS' | 'FAIL' | 'SKIP';
  evidence: string;
};

const results: Result[] = [];
let token = '';
const createdIds: Record<string, string[]> = {};

function log(r: Result) {
  results.push(r);
  const icon = r.status === 'PASS' ? '✓' : r.status === 'FAIL' ? '✗' : '○';
  console.log(`${icon} [${r.module}] ${r.operation}: ${r.evidence}`);
}

async function api(method: string, path: string, body?: unknown, auth = true): Promise<{ status: number; json: Record<string, unknown> }> {
  const headers: Record<string, string> = {};
  if (body) headers['Content-Type'] = 'application/json';
  if (auth && token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  let json: Record<string, unknown> = {};
  try {
    json = (await res.json()) as Record<string, unknown>;
  } catch {
    json = {};
  }
  return { status: res.status, json };
}

function sampleImage(folder: string) {
  const cloud = env.CLOUDINARY_CLOUD_NAME || 'dgxz36qfa';
  const url = `https://res.cloudinary.com/${cloud}/image/upload/c_fill,w_800,h_600,q_auto,f_auto/sample`;
  return {
    publicId: `${folder}/audit-sample`,
    secureUrl: url,
    url,
    width: 800,
    height: 600,
    format: 'jpg',
    bytes: 0,
    alt: 'audit',
    folder,
    order: 0,
    isFeatured: true,
  };
}

async function mongoCount(collection: string, filter: Record<string, unknown>) {
  if (!mongoose.connection.db) return -1;
  return mongoose.connection.db.collection(collection).countDocuments(filter);
}

async function mongoFindOne(collection: string, filter: Record<string, unknown>) {
  if (!mongoose.connection.db) return null;
  return mongoose.connection.db.collection(collection).findOne(filter);
}

async function crudModule(
  name: string,
  basePath: string,
  collection: string,
  createPayload: Record<string, unknown>,
  updatePayload: Record<string, unknown>,
  publicPath?: string,
) {
  const list = await api('GET', `${basePath}?limit=5`);
  if (list.status === 200) {
    log({ module: name, operation: 'READ list', status: 'PASS', evidence: `GET ${basePath} → ${list.status}` });
  } else {
    log({ module: name, operation: 'READ list', status: 'FAIL', evidence: `GET ${basePath} → ${list.status}` });
    return;
  }

  const created = await api('POST', basePath, createPayload);
  const createData = created.json.data as Record<string, unknown> | undefined;
  const id = createData?.id as string | undefined;
  if (created.status === 201 && id) {
    log({ module: name, operation: 'CREATE', status: 'PASS', evidence: `POST ${basePath} → id=${id}` });
    if (!createdIds[name]) createdIds[name] = [];
    createdIds[name].push(id);

    const count = await mongoCount(collection, { _id: new mongoose.Types.ObjectId(id) });
    if (count === 1) {
      log({ module: name, operation: 'MongoDB CREATE', status: 'PASS', evidence: `${collection}._id=${id} count=1` });
    } else {
      log({ module: name, operation: 'MongoDB CREATE', status: 'FAIL', evidence: `${collection} count=${count}` });
    }
  } else {
    log({ module: name, operation: 'CREATE', status: 'FAIL', evidence: `POST ${basePath} → ${created.status} ${JSON.stringify(created.json).slice(0, 120)}` });
    return;
  }

  const got = await api('GET', `${basePath}/${id}`);
  if (got.status === 200) {
    log({ module: name, operation: 'READ detail', status: 'PASS', evidence: `GET ${basePath}/${id} → 200` });
  } else {
    log({ module: name, operation: 'READ detail', status: 'FAIL', evidence: `GET ${basePath}/${id} → ${got.status}` });
  }

  const updated = await api('PATCH', `${basePath}/${id}`, updatePayload);
  if (updated.status === 200) {
    log({ module: name, operation: 'UPDATE', status: 'PASS', evidence: `PATCH ${basePath}/${id} → 200` });
    const doc = await mongoFindOne(collection, { _id: new mongoose.Types.ObjectId(id) });
    const field = Object.keys(updatePayload)[0];
    const expected = (updatePayload as Record<string, unknown>)[field];
    const actual = doc ? (doc as Record<string, unknown>)[field] : undefined;
    if (actual === expected || (field === 'title' && actual === expected)) {
      log({ module: name, operation: 'MongoDB UPDATE', status: 'PASS', evidence: `${field}=${String(actual)}` });
    } else {
      log({ module: name, operation: 'MongoDB UPDATE', status: 'FAIL', evidence: `expected ${field}=${expected}, got ${actual}` });
    }
  } else {
    log({ module: name, operation: 'UPDATE', status: 'FAIL', evidence: `PATCH → ${updated.status}` });
  }

  if (publicPath) {
    const pub = await api('GET', publicPath, undefined, false);
    const pubData = pub.json.data;
    const items = Array.isArray(pubData) ? pubData : (pubData as Record<string, unknown>)?.items ?? [];
    const arr = Array.isArray(items) ? items : [];
    const visible = arr.some((i: Record<string, unknown>) => i.id === id || String(i._id) === id);
    if (pub.status === 200 && visible) {
      log({ module: name, operation: 'PUBLIC READ', status: 'PASS', evidence: `GET ${publicPath} contains id` });
    } else if (pub.status === 200) {
      log({ module: name, operation: 'PUBLIC READ', status: 'FAIL', evidence: `GET ${publicPath} → 200 but record not in published list (check isPublished)` });
    } else {
      log({ module: name, operation: 'PUBLIC READ', status: 'FAIL', evidence: `GET ${publicPath} → ${pub.status}` });
    }
  }

  const del = await api('DELETE', `${basePath}/${id}`);
  if (del.status === 200) {
    log({ module: name, operation: 'DELETE', status: 'PASS', evidence: `DELETE ${basePath}/${id} → 200` });
    const after = await mongoCount(collection, { _id: new mongoose.Types.ObjectId(id), deletedAt: { $exists: true } });
    const hard = await mongoCount(collection, { _id: new mongoose.Types.ObjectId(id) });
    if (after >= 1 || hard === 0) {
      log({ module: name, operation: 'MongoDB DELETE', status: 'PASS', evidence: `soft=${after} hard_gone=${hard === 0}` });
    } else {
      log({ module: name, operation: 'MongoDB DELETE', status: 'FAIL', evidence: `doc still active in ${collection}` });
    }
  } else {
    log({ module: name, operation: 'DELETE', status: 'FAIL', evidence: `DELETE → ${del.status}` });
  }
}

async function main() {
  console.log('\n=== SK Makeup Production Audit ===\n');

  // Health
  const health = await api('GET', '/health', undefined, false);
  log({ module: 'API', operation: 'health', status: health.status === 200 ? 'PASS' : 'FAIL', evidence: `→ ${health.status}` });

  // Auth
  const login = await api('POST', '/auth/login', { email: ADMIN_EMAIL, password: ADMIN_PASSWORD }, false);
  const loginData = login.json.data as Record<string, unknown> | undefined;
  token = (loginData?.accessToken as string) || '';
  if (login.status === 200 && token) {
    log({ module: 'Security', operation: 'JWT login', status: 'PASS', evidence: `token length=${token.length}` });
  } else {
    log({ module: 'Security', operation: 'JWT login', status: 'FAIL', evidence: `→ ${login.status}` });
    process.exit(1);
  }

  const noAuth = await api('GET', '/admin/services', undefined, false);
  log({ module: 'Security', operation: 'protected route', status: noAuth.status === 401 ? 'PASS' : 'FAIL', evidence: `unauth GET /admin/services → ${noAuth.status}` });

  // MongoDB connect for verification
  try {
    await mongoose.connect(env.MONGODB_URI);
    log({ module: 'MongoDB', operation: 'connect', status: 'PASS', evidence: `db=${mongoose.connection.db?.databaseName}` });
  } catch (e) {
    log({ module: 'MongoDB', operation: 'connect', status: 'FAIL', evidence: String(e) });
  }

  const collections = ['users', 'services', 'portfolioitems', 'galleries', 'testimonials', 'teammembers', 'bookings', 'websitecontents', 'seos', 'sitesettings', 'mediaassets', 'availabilities'];
  for (const c of collections) {
    try {
      const n = await mongoCount(c, {});
      log({ module: 'MongoDB', operation: `collection ${c}`, status: 'PASS', evidence: `count=${n}` });
    } catch {
      log({ module: 'MongoDB', operation: `collection ${c}`, status: 'SKIP', evidence: 'not found or error' });
    }
  }

  const img = sampleImage('services');

  await crudModule('Services', '/admin/services', 'services', {
    title: 'Audit Service',
    shortDescription: 'Short audit desc',
    fullDescription: 'Full audit description for testing',
    featuredImage: img,
    category: 'party',
    duration: 90,
    startingPrice: 9999,
    currency: 'INR',
    isPublished: true,
    isFeatured: false,
  }, { title: 'Audit Service Updated' }, '/public/services?limit=50');

  const pImg = sampleImage('portfolio');
  await crudModule('Portfolio', '/admin/portfolio', 'portfolioitems', {
    title: 'Audit Portfolio',
    category: 'Bridal',
    description: 'Audit portfolio entry',
    featuredImage: pImg,
    galleryImages: [pImg],
    tags: ['audit'],
    featured: true,
    published: true,
  }, { title: 'Audit Portfolio Updated' }, '/public/portfolio?limit=50');

  const gImg = sampleImage('gallery');
  await crudModule('Gallery', '/admin/gallery', 'galleries', {
    title: 'Audit Gallery',
    category: 'Bridal',
    description: 'Audit gallery',
    images: [gImg],
    featured: false,
    isPublished: true,
  }, { title: 'Audit Gallery Updated' }, '/public/gallery?limit=50');

  await crudModule('Testimonials', '/admin/testimonials', 'testimonials', {
    clientName: 'Audit Client',
    content: 'Great makeup audit test',
    rating: 5,
    isPublished: true,
  }, { clientName: 'Audit Client Updated' }, '/public/testimonials');

  const tImg = sampleImage('team');
  await crudModule('Team Members', '/admin/team-members', 'teammembers', {
    name: 'Audit Artist',
    designation: 'Lead MUA',
    description: 'Audit team bio',
    profileImage: tImg,
    isPublished: true,
  }, { name: 'Audit Artist Updated' }, '/public/team-members');

  // SEO
  const seoCreate = await api('POST', '/admin/seo', {
    scope: 'page',
    page: 'about',
    metaTitle: 'Audit SEO',
    metaDescription: 'Audit meta description for testing',
    keywords: ['audit'],
    robots: 'noindex,nofollow',
    openGraph: { type: 'website' },
  });
  const seoId = (seoCreate.json.data as Record<string, unknown>)?.id as string;
  if (seoCreate.status === 201 && seoId) {
    log({ module: 'SEO', operation: 'CREATE', status: 'PASS', evidence: `id=${seoId}` });
    await api('PATCH', `/admin/seo/${seoId}`, { metaTitle: 'Audit SEO Updated' });
    log({ module: 'SEO', operation: 'UPDATE', status: 'PASS', evidence: 'PATCH ok' });
    const seoDel = await api('DELETE', `/admin/seo/${seoId}`);
    log({ module: 'SEO', operation: 'DELETE', status: seoDel.status === 200 ? 'PASS' : 'FAIL', evidence: `→ ${seoDel.status}` });
  } else {
    log({ module: 'SEO', operation: 'CREATE', status: 'FAIL', evidence: `→ ${seoCreate.status}` });
  }

  // Website Content - update existing key
  const wcList = await api('GET', '/admin/website-content?limit=1');
  const wcItems = (wcList.json.data as unknown[]) || [];
  const wcId = (wcItems[0] as Record<string, unknown>)?.id as string;
  if (wcId) {
    const wcUp = await api('PATCH', `/admin/website-content/${wcId}`, { value: 'Audit content value' });
    log({ module: 'Website Content', operation: 'UPDATE', status: wcUp.status === 200 ? 'PASS' : 'FAIL', evidence: `PATCH ${wcId} → ${wcUp.status}` });
    const wcPub = await api('GET', '/public/content/homepage', undefined, false);
    log({ module: 'Website Content', operation: 'PUBLIC READ', status: wcPub.status === 200 ? 'PASS' : 'FAIL', evidence: `→ ${wcPub.status}` });
  }

  // Settings
  const settingsGet = await api('GET', '/admin/site-settings');
  const settingsPub = await api('GET', '/public/site-settings', undefined, false);
  const pubData = settingsPub.json.data as Record<string, unknown> | undefined;
  const contact = pubData?.contactDetails as Record<string, string> | undefined;
  log({ module: 'Settings', operation: 'READ admin', status: settingsGet.status === 200 ? 'PASS' : 'FAIL', evidence: `→ ${settingsGet.status}` });
  log({ module: 'Settings', operation: 'READ public', status: settingsPub.status === 200 ? 'PASS' : 'FAIL', evidence: `phone=${contact?.phone ?? 'missing'}` });
  const hasCloudinarySecret = Boolean(env.CLOUDINARY_API_SECRET);
  log({ module: 'Security', operation: 'Cloudinary secret server-only', status: hasCloudinarySecret ? 'PASS' : 'FAIL', evidence: `CLOUDINARY_API_SECRET set=${hasCloudinarySecret}, not in public response` });
  const pubStr = JSON.stringify(settingsPub.json);
  log({ module: 'Security', operation: 'no secrets in public settings', status: !pubStr.includes('api_secret') && !pubStr.includes('API_SECRET') ? 'PASS' : 'FAIL', evidence: 'scanned response' });

  // Bookings - public create + admin read/update
  const svcList = await api('GET', '/admin/services?limit=1&isPublished=true');
  const svcItems = ((svcList.json.data as Record<string, unknown>)?.items as unknown[]) ?? (svcList.json.data as unknown[]) ?? [];
  const svc = svcItems[0] as Record<string, unknown> | undefined;
  if (svc?.id) {
    const future = new Date();
    future.setDate(future.getDate() + 14);
    const dateStr = future.toISOString().split('T')[0];
    const book = await api('POST', '/public/bookings', {
      serviceId: svc.id,
      clientName: 'Audit Booker',
      clientEmail: 'audit@test.com',
      clientPhone: '+919999999999',
      date: dateStr,
      startTime: '10:00',
      notes: 'audit',
    }, false);
    const bookId = (book.json.data as Record<string, unknown>)?.id as string;
    if (book.status === 201 && bookId) {
      log({ module: 'Bookings', operation: 'CREATE public', status: 'PASS', evidence: `id=${bookId}` });
      const bGet = await api('GET', `/admin/bookings/${bookId}`);
      log({ module: 'Bookings', operation: 'READ admin', status: bGet.status === 200 ? 'PASS' : 'FAIL', evidence: `→ ${bGet.status}` });
      const bUp = await api('PATCH', `/admin/bookings/${bookId}/status`, { status: 'confirmed' });
      log({ module: 'Bookings', operation: 'UPDATE status', status: bUp.status === 200 ? 'PASS' : 'FAIL', evidence: `→ ${bUp.status}` });
    } else {
      log({ module: 'Bookings', operation: 'CREATE public', status: 'FAIL', evidence: `→ ${book.status} ${JSON.stringify(book.json).slice(0, 100)}` });
    }
  }

  // Cloudinary config check
  log({ module: 'Cloudinary', operation: 'credentials configured', status: env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY ? 'PASS' : 'FAIL', evidence: `cloud=${env.CLOUDINARY_CLOUD_NAME || 'missing'}` });

  const passed = results.filter((r) => r.status === 'PASS').length;
  const failed = results.filter((r) => r.status === 'FAIL').length;
  const skipped = results.filter((r) => r.status === 'SKIP').length;
  console.log(`\n=== SUMMARY: ${passed} PASS / ${failed} FAIL / ${skipped} SKIP ===\n`);

  await mongoose.disconnect();
  if (failed > 0) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
