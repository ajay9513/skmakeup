import { config } from 'dotenv';
import fs from 'fs';
import path from 'path';

export interface EnvLoadDiagnostics {
  cwd: string;
  apiRoot: string;
  candidates: string[];
  loadedFiles: string[];
  presence: {
    MONGODB_URI: boolean;
    JWT_SECRET: boolean;
    JWT_REFRESH_SECRET: boolean;
    WEB_URL: boolean;
    ADMIN_URL: boolean;
    CORS_ORIGINS: boolean;
  };
}

/** apps/api directory — works from src/config (tsx) and dist/config (node). */
const apiRoot = path.resolve(__dirname, '..', '..');

/** Lowest → highest priority; later files override earlier with override: true. */
const envCandidates = [
  path.resolve(process.cwd(), '.env'),
  path.resolve(process.cwd(), 'apps/api/.env'),
  path.resolve(apiRoot, '.env'),
];

function fileExists(filePath: string): boolean {
  try {
    return fs.existsSync(filePath) && fs.statSync(filePath).isFile();
  } catch {
    return false;
  }
}

function loadEnvFiles(): EnvLoadDiagnostics {
  const preExisting = { ...process.env };

  const diagnostics: EnvLoadDiagnostics = {
    cwd: process.cwd(),
    apiRoot,
    candidates: [...new Set(envCandidates)],
    loadedFiles: [],
    presence: {
      MONGODB_URI: false,
      JWT_SECRET: false,
      JWT_REFRESH_SECRET: false,
      WEB_URL: false,
      ADMIN_URL: false,
      CORS_ORIGINS: false,
    },
  };

  const existing = [...new Set(envCandidates.filter(fileExists))];

  for (const filePath of existing) {
    const result = config({ path: filePath, override: true });
    if (!result.error) {
      diagnostics.loadedFiles.push(filePath);
    }
  }

  // Shell / Docker / CI variables take precedence over .env files.
  for (const [key, value] of Object.entries(preExisting)) {
    if (value !== undefined) {
      process.env[key] = value;
    }
  }

  diagnostics.presence = {
    MONGODB_URI: Boolean(process.env.MONGODB_URI?.trim()),
    JWT_SECRET: Boolean(process.env.JWT_SECRET?.trim()),
    JWT_REFRESH_SECRET: Boolean(process.env.JWT_REFRESH_SECRET?.trim()),
    WEB_URL: Boolean(process.env.WEB_URL?.trim()),
    ADMIN_URL: Boolean(process.env.ADMIN_URL?.trim()),
    CORS_ORIGINS: Boolean(process.env.CORS_ORIGINS?.trim()),
  };

  return diagnostics;
}

export const envLoadDiagnostics = loadEnvFiles();

export function printEnvDiagnostics(): void {
  const d = envLoadDiagnostics;
  // eslint-disable-next-line no-console
  console.log('[env] Startup diagnostics');
  // eslint-disable-next-line no-console
  console.log(`  cwd: ${d.cwd}`);
  // eslint-disable-next-line no-console
  console.log(`  apiRoot: ${d.apiRoot}`);
  // eslint-disable-next-line no-console
  console.log(`  candidates: ${d.candidates.join(' | ')}`);
  // eslint-disable-next-line no-console
  console.log(`  loaded: ${d.loadedFiles.length ? d.loadedFiles.join(' | ') : '(none)'}`);
  // eslint-disable-next-line no-console
  console.log(`  MONGODB_URI: ${d.presence.MONGODB_URI}`);
  // eslint-disable-next-line no-console
  console.log(`  JWT_SECRET: ${d.presence.JWT_SECRET}`);
  // eslint-disable-next-line no-console
  console.log(`  JWT_REFRESH_SECRET: ${d.presence.JWT_REFRESH_SECRET}`);
  // eslint-disable-next-line no-console
  console.log(`  WEB_URL: ${d.presence.WEB_URL}`);
  // eslint-disable-next-line no-console
  console.log(`  ADMIN_URL: ${d.presence.ADMIN_URL}`);
  // eslint-disable-next-line no-console
  console.log(`  CORS_ORIGINS: ${d.presence.CORS_ORIGINS}`);
}

printEnvDiagnostics();
