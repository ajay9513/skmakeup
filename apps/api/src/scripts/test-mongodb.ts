/**
 * Standalone MongoDB connection test — diagnostics only.
 * Usage: npx tsx src/scripts/test-mongodb.ts
 */
import '../config/load-env';
import mongoose from 'mongoose';
import { env } from '../config/env';
import { parseMongoUri, printMongoUriDiagnostics } from '../utils/mongodb-uri-diagnostics';

const connectionOptions: mongoose.ConnectOptions = {
  maxPoolSize: 50,
  minPoolSize: 10,
  serverSelectionTimeoutMS: 10000,
  socketTimeoutMS: 45000,
  retryWrites: true,
};

function printDriverError(err: unknown): void {
  // eslint-disable-next-line no-console
  console.error('\n[mongodb] Driver error details');

  if (!err || typeof err !== 'object') {
    // eslint-disable-next-line no-console
    console.error('  raw:', err);
    return;
  }

  const e = err as {
    name?: string;
    message?: string;
    code?: number;
    codeName?: string;
    errorLabels?: string[];
    errorResponse?: Record<string, unknown>;
    reason?: {
      type?: string;
      setName?: string;
      servers?: Map<string, { error?: { message?: string; code?: number } }>;
    };
  };

  // eslint-disable-next-line no-console
  console.error(`  name: ${e.name ?? '(unknown)'}`);
  // eslint-disable-next-line no-console
  console.error(`  message: ${e.message ?? '(unknown)'}`);
  // eslint-disable-next-line no-console
  console.error(`  code: ${e.code ?? '(none)'}`);
  // eslint-disable-next-line no-console
  console.error(`  codeName: ${e.codeName ?? '(none)'}`);

  if (e.errorLabels?.length) {
    // eslint-disable-next-line no-console
    console.error(`  errorLabels: ${e.errorLabels.join(', ')}`);
  }

  if (e.errorResponse) {
    // eslint-disable-next-line no-console
    console.error('  errorResponse:', JSON.stringify(e.errorResponse, null, 2));
  }

  if (e.reason) {
    // eslint-disable-next-line no-console
    console.error(`  reason.type: ${e.reason.type ?? '(none)'}`);
    // eslint-disable-next-line no-console
    console.error(`  reason.setName: ${e.reason.setName ?? '(none)'}`);
    if (e.reason.servers) {
      for (const [host, desc] of e.reason.servers) {
        // eslint-disable-next-line no-console
        console.error(`  server[${host}]: ${desc.error?.message ?? 'ok'}`);
      }
    }
  }
}

function classifyFailure(err: unknown, parsed: ReturnType<typeof parseMongoUri>): void {
  // eslint-disable-next-line no-console
  console.log('\n[mongodb] Failure classification');

  const e = err as { message?: string; code?: number; codeName?: string; name?: string };

  const isAuth =
    e.code === 8000 ||
    e.code === 18 ||
    e.codeName === 'AuthenticationFailed' ||
    e.message?.toLowerCase().includes('bad auth') ||
    e.message?.toLowerCase().includes('authentication failed');

  const isUriFormat = parsed.scheme === 'unknown' || Boolean(parsed.parseWarning);
  const isNetwork =
    e.message?.includes('ECONNREFUSED') ||
    e.message?.includes('ENOTFOUND') ||
    e.message?.includes('timed out') ||
    e.name === 'MongoServerSelectionError';

  const isReplicaSet = e.message?.includes('ReplicaSet') || e.message?.includes('replica set');

  // eslint-disable-next-line no-console
  console.log(`  URI format issue: ${isUriFormat ? 'POSSIBLE' : 'unlikely'}`);
  // eslint-disable-next-line no-console
  console.log(`  Authentication issue: ${isAuth ? 'LIKELY' : 'unlikely'}`);
  // eslint-disable-next-line no-console
  console.log(`  User permissions issue: ${isAuth ? 'possible (after auth succeeds, test readWrite)' : 'cannot assess until auth succeeds'}`);
  // eslint-disable-next-line no-console
  console.log(`  authSource mismatch: ${isAuth && parsed.authSource ? `possible — verify user exists in "${parsed.authSource}"` : isAuth ? 'possible — authSource not set in URI' : 'unlikely'}`);
  // eslint-disable-next-line no-console
  console.log(`  Network / Atlas IP whitelist: ${isNetwork && !isAuth ? 'LIKELY' : isNetwork ? 'possible' : 'unlikely'}`);
  // eslint-disable-next-line no-console
  console.log(`  Replica set issue: ${isReplicaSet ? 'POSSIBLE' : 'unlikely'}`);
}

async function main(): Promise<number> {
  const uri = env.MONGODB_URI;
  const parsed = parseMongoUri(uri);

  // eslint-disable-next-line no-console
  console.log('[mongodb] Connection test starting');
  // eslint-disable-next-line no-console
  console.log(`  cwd: ${process.cwd()}`);
  // eslint-disable-next-line no-console
  console.log(`  MONGODB_URI present: ${Boolean(uri)}`);

  printMongoUriDiagnostics(uri);

  // eslint-disable-next-line no-console
  console.log('\n[mongodb] mongoose.connect() options (from database.ts)');
  // eslint-disable-next-line no-console
  console.log(JSON.stringify(connectionOptions, null, 2));
  // eslint-disable-next-line no-console
  console.log('  note: authSource/replicaSet/ssl are taken from URI query string, not ConnectOptions');

  try {
    await mongoose.connect(uri, connectionOptions);
    const dbName = mongoose.connection.db?.databaseName;
    // eslint-disable-next-line no-console
    console.log('\n[mongodb] SUCCESS');
    // eslint-disable-next-line no-console
    console.log(`  connected database: ${dbName ?? '(unknown)'}`);
    // eslint-disable-next-line no-console
    console.log(`  readyState: ${mongoose.connection.readyState}`);
    await mongoose.disconnect();
    return 0;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('\n[mongodb] CONNECTION FAILED');
    printDriverError(err);
    classifyFailure(err, parsed);
    return 1;
  }
}

main()
  .then((code) => process.exit(code))
  .catch((err) => {
    // eslint-disable-next-line no-console
    console.error('[mongodb] Unexpected error:', err);
    process.exit(2);
  });
