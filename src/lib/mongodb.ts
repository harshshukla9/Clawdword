import { MongoClient, Db, MongoClientOptions } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const MONGODB_DB = process.env.MONGODB_DB || 'lets_have_a_word';

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

// Use globalThis so the same client is reused across HMR and serverless invocations
// within the same process. Keeps connection count low (critical for Atlas M0).
const globalForMongo = globalThis as unknown as {
  _mongoClient: MongoClient | null;
  _mongoDb: Db | null;
  _mongoPromise: Promise<{ client: MongoClient; db: Db }> | null;
};

/** Single shared connection. Use this everywhere instead of creating new clients. */
export async function connectToDatabase(): Promise<{ client: MongoClient; db: Db }> {
  if (globalForMongo._mongoClient && globalForMongo._mongoDb) {
    return { client: globalForMongo._mongoClient, db: globalForMongo._mongoDb };
  }

  // One promise for all concurrent callers - no connection storm
  if (globalForMongo._mongoPromise) {
    return globalForMongo._mongoPromise;
  }

  const options: MongoClientOptions = {
    maxPoolSize: 1, // M0 has low limit; 1 connection per app instance
    minPoolSize: 0,
    maxIdleTimeMS: 60000,
  };

  const promise = (async () => {
    const client = new MongoClient(MONGODB_URI, options);
    await client.connect();
    const db = client.db(MONGODB_DB);
    globalForMongo._mongoClient = client;
    globalForMongo._mongoDb = db;
    globalForMongo._mongoPromise = promise;
    console.log('[MongoDB] Connected (single client, pool=1):', MONGODB_DB);
    return { client, db };
  })();

  globalForMongo._mongoPromise = promise;
  return promise;
}

/** Sync access to cached db when you know connectToDatabase() was already called (e.g. in same request). */
export function getDb(): Db | null {
  return globalForMongo._mongoDb ?? null;
}

// Collection names
export const COLLECTIONS = {
  AGENTS: 'agents',
  ROUNDS: 'rounds',
  GUESSES: 'guesses',
  GUESS_PACKS: 'guess_packs',
  WORDS: 'words',
} as const;

// Initialize collections with indexes
export async function initializeDatabase(): Promise<void> {
  const { db } = await connectToDatabase();

  // Agents collection indexes
  await db.collection(COLLECTIONS.AGENTS).createIndex({ walletAddress: 1 }, { unique: true });
  await db.collection(COLLECTIONS.AGENTS).createIndex({ apiKey: 1 }, { unique: true });
  await db.collection(COLLECTIONS.AGENTS).createIndex({ id: 1 }, { unique: true });

  // Rounds collection indexes
  await db.collection(COLLECTIONS.ROUNDS).createIndex({ id: 1 }, { unique: true });
  await db.collection(COLLECTIONS.ROUNDS).createIndex({ phase: 1 });

  // Guesses collection indexes
  await db.collection(COLLECTIONS.GUESSES).createIndex({ roundId: 1, agentId: 1 });
  await db.collection(COLLECTIONS.GUESSES).createIndex({ roundId: 1, word: 1 }, { unique: true });
  await db.collection(COLLECTIONS.GUESSES).createIndex({ timestamp: -1 });

  // Guess packs: one active pack per agent per round; cooldown by agent
  await db.collection(COLLECTIONS.GUESS_PACKS).createIndex({ agentId: 1, roundId: 1 });
  await db.collection(COLLECTIONS.GUESS_PACKS).createIndex({ agentId: 1, purchasedAt: -1 });

  console.log('[MongoDB] Database indexes created');
}
