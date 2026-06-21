/**
 * Temporary MongoDB URI diagnostics — no connection logic.
 * Safe to remove after Atlas troubleshooting is complete.
 */

export interface MongoUriDiagnostics {
  scheme: 'mongodb://' | 'mongodb+srv://' | 'unknown';
  isStandardScheme: boolean;
  isSrvScheme: boolean;
  username: string | null;
  databaseName: string | null;
  authSource: string | null;
  replicaSet: string | null;
  ssl: string | null;
  hosts: string;
  sanitizedUri: string;
  parseWarning: string | null;
}

export function sanitizeMongoUri(uri: string): string {
  return uri.replace(/(mongodb(?:\+srv)?:\/\/)([^:@/]+):([^@]+)@/i, '$1$2:***@');
}

export function parseMongoUri(uri: string): MongoUriDiagnostics {
  const isStandardScheme = uri.startsWith('mongodb://');
  const isSrvScheme = uri.startsWith('mongodb+srv://');
  const scheme: MongoUriDiagnostics['scheme'] = isSrvScheme
    ? 'mongodb+srv://'
    : isStandardScheme
      ? 'mongodb://'
      : 'unknown';

  const result: MongoUriDiagnostics = {
    scheme,
    isStandardScheme,
    isSrvScheme,
    username: null,
    databaseName: null,
    authSource: null,
    replicaSet: null,
    ssl: null,
    hosts: '',
    sanitizedUri: sanitizeMongoUri(uri),
    parseWarning: null,
  };

  if (!isStandardScheme && !isSrvScheme) {
    result.parseWarning = 'URI does not start with mongodb:// or mongodb+srv://';
    return result;
  }

  try {
    const withoutScheme = uri.replace(/^mongodb(?:\+srv)?:\/\//i, '');
    const atIndex = withoutScheme.indexOf('@');

    let hostsAndRest = withoutScheme;
    if (atIndex !== -1) {
      const creds = withoutScheme.slice(0, atIndex);
      const colon = creds.indexOf(':');
      result.username = decodeURIComponent(colon === -1 ? creds : creds.slice(0, colon));
      hostsAndRest = withoutScheme.slice(atIndex + 1);
    }

    const slashIndex = hostsAndRest.indexOf('/');
    const queryIndex = hostsAndRest.indexOf('?');

    if (slashIndex === -1) {
      result.hosts = queryIndex === -1 ? hostsAndRest : hostsAndRest.slice(0, queryIndex);
    } else {
      result.hosts = hostsAndRest.slice(0, slashIndex);
      const afterSlash = hostsAndRest.slice(slashIndex + 1);
      const dbPart = queryIndex === -1 ? afterSlash : afterSlash.slice(0, afterSlash.indexOf('?'));
      result.databaseName = dbPart.length > 0 ? dbPart : null;
    }

    if (queryIndex !== -1) {
      const query = hostsAndRest.slice(queryIndex + 1);
      const params = new URLSearchParams(query);
      result.authSource = params.get('authSource');
      result.replicaSet = params.get('replicaSet');
      result.ssl = params.get('ssl') ?? params.get('tls');
    }
  } catch (err) {
    result.parseWarning = err instanceof Error ? err.message : 'Failed to parse URI';
  }

  return result;
}

export function printMongoUriDiagnostics(uri: string, label = '[mongodb] URI diagnostics'): void {
  const d = parseMongoUri(uri);
  // eslint-disable-next-line no-console
  console.log(label);
  // eslint-disable-next-line no-console
  console.log(`  scheme: ${d.scheme}`);
  // eslint-disable-next-line no-console
  console.log(`  is mongodb://: ${d.isStandardScheme}`);
  // eslint-disable-next-line no-console
  console.log(`  is mongodb+srv://: ${d.isSrvScheme}`);
  // eslint-disable-next-line no-console
  console.log(`  username: ${d.username ?? '(none)'}`);
  // eslint-disable-next-line no-console
  console.log(`  database name: ${d.databaseName ?? '(not specified in path)'}`);
  // eslint-disable-next-line no-console
  console.log(`  authSource: ${d.authSource ?? '(not in query — driver may default to admin)'}`);
  // eslint-disable-next-line no-console
  console.log(`  replicaSet: ${d.replicaSet ?? '(not in query)'}`);
  // eslint-disable-next-line no-console
  console.log(`  ssl/tls: ${d.ssl ?? '(not in query)'}`);
  // eslint-disable-next-line no-console
  console.log(`  hosts: ${d.hosts || '(none)'}`);
  // eslint-disable-next-line no-console
  console.log(`  sanitized URI: ${d.sanitizedUri}`);
  if (d.parseWarning) {
    // eslint-disable-next-line no-console
    console.log(`  parse warning: ${d.parseWarning}`);
  }
}
