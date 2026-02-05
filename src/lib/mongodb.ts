import { MongoClient, Db } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const MONGODB_DB = process.env.MONGODB_DB || 'lets_have_a_word';

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

export async function connectToDatabase(): Promise<{ client: MongoClient; db: Db }> {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  const db = client.db(MONGODB_DB);

  cachedClient = client;
  cachedDb = db;

  console.log('[MongoDB] Connected to database:', MONGODB_DB);

  return { client, db };
}

// Collection names
export const COLLECTIONS = {
  AGENTS: 'agents',
  ROUNDS: 'rounds',
  GUESSES: 'guesses',
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

  console.log('[MongoDB] Database indexes created');
}
