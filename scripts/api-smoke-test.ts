/**
 * API smoke test — run while API is up on port 5000.
 * Usage: npx tsx scripts/api-smoke-test.ts
 */
const BASE = process.env.API_BASE ?? 'http://localhost:5000/api/v1';

interface Result {
  method: string;
  path: string;
  status: number;
  ok: boolean;
  note?: string;
}

async function req(method: string, path: string, body?: unknown): Promise<Result> {
  const url = `${BASE}${path}`;
  try {
    const res = await fetch(url, {
      method,
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
    return { method, path, status: res.status, ok: res.ok };
  } catch (err) {
    return { method, path, status: 0, ok: false, note: String(err) };
  }
}

async function main() {
  const tests: Result[] = [];

  tests.push(await req('GET', '/health'));
  tests.push(await req('GET', '/public/site-settings'));
  tests.push(await req('GET', '/public/content/homepage'));
  tests.push(await req('GET', '/public/seo/homepage'));
  tests.push(await req('GET', '/public/services?limit=5'));
  tests.push(await req('GET', '/public/packages'));
  tests.push(await req('GET', '/public/portfolio?limit=5'));
  tests.push(await req('GET', '/public/gallery?limit=5'));
  tests.push(await req('GET', '/public/testimonials'));
  tests.push(await req('GET', '/public/team-members'));
  tests.push(await req('GET', '/public/availability/slots?date=2026-12-01'));

  const passed = tests.filter((t) => t.ok).length;
  const failed = tests.filter((t) => !t.ok);

  console.log('\n=== API Smoke Test ===\n');
  tests.forEach((t) => {
    const icon = t.ok ? 'PASS' : 'FAIL';
    console.log(`${icon} ${t.method} ${t.path} → ${t.status}${t.note ? ` (${t.note})` : ''}`);
  });
  console.log(`\n${passed}/${tests.length} passed`);

  if (failed.length) process.exit(1);
}

main();
