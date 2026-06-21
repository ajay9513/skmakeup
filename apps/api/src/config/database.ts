import mongoose from 'mongoose';
import { env } from './env';
import { logger } from '../utils/logger';

const connectionOptions: mongoose.ConnectOptions = {
  maxPoolSize: 50,
  minPoolSize: 10,
  serverSelectionTimeoutMS: 10000,
  socketTimeoutMS: 45000,
  retryWrites: true,
};

function describeMongoError(err: unknown): string {
  if (!err || typeof err !== 'object') return String(err);

  const e = err as {
    name?: string;
    message?: string;
    code?: number;
    codeName?: string;
    reason?: { type?: string; servers?: Map<string, { error?: { message?: string } }> };
  };

  if (e.code === 8000 || e.message?.includes('bad auth')) {
    return 'Authentication failed — check username, password, and authSource in MONGODB_URI.';
  }
  if (e.message?.includes('ECONNREFUSED') || e.message?.includes('connect ECONNREFUSED')) {
    return 'Connection refused — MongoDB is not running or host/port is wrong.';
  }
  if (e.message?.includes('ENOTFOUND')) {
    return 'Host not found — verify the hostname in MONGODB_URI.';
  }
  if (e.message?.includes('timed out') || e.name === 'MongoServerSelectionError') {
    return 'Server selection timed out — check network access, firewall, or Atlas IP whitelist.';
  }
  if (e.message?.includes('ReplicaSetNoPrimary')) {
    return 'Replica set has no primary — verify replicaSet name and member hosts in the URI.';
  }
  if (e.code === 18 || e.codeName === 'AuthenticationFailed') {
    return 'Authentication failed — invalid database credentials.';
  }

  return e.message || e.name || 'Unknown MongoDB connection error';
}

export async function connectDatabase(): Promise<void> {
  mongoose.set('strictQuery', true);

  mongoose.connection.on('connected', () => {
    logger.info('MongoDB connected');
  });

  mongoose.connection.on('error', (err) => {
    logger.error({ err }, 'MongoDB connection error');
  });

  mongoose.connection.on('disconnected', () => {
    logger.warn('MongoDB disconnected');
  });

  const uri = env.MONGODB_URI;

  const hostHint = uri.includes('@') ? uri.split('@')[1]?.split('/')[0] : uri;

  logger.info({ host: hostHint }, 'Connecting to MongoDB...');

  try {
    await mongoose.connect(uri, connectionOptions);
    logger.info({ database: mongoose.connection.db?.databaseName }, 'MongoDB connection established');
  } catch (err) {
    const reason = describeMongoError(err);
    logger.error({ reason, host: hostHint }, 'MongoDB connection failed');
    throw new Error(`MongoDB connection failed: ${reason}`);
  }
}

export async function disconnectDatabase(): Promise<void> {
  await mongoose.disconnect();
  logger.info('MongoDB disconnected gracefully');
}

export { mongoose };
