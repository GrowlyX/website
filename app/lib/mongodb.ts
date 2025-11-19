import { MongoClient, Db } from 'mongodb'

// Cached connection across hot reloads in development.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let cached: any = (global as any)._mongoCached || { client: null as MongoClient | null, db: null as Db | null }
;(global as any)._mongoCached = cached

export async function getDb(): Promise<Db> {
  if (cached.db) return cached.db

  const uri = process.env.MONGODB_URI
  const dbName = process.env.MONGODB_DB

  if (!uri) throw new Error('Missing MONGODB_URI in environment')
  if (!dbName) throw new Error('Missing MONGODB_DB in environment')

  const client = new MongoClient(uri)
  await client.connect()
  const db = client.db(dbName)

  cached.client = client
  cached.db = db
  return db
}
