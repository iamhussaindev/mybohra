import * as SQLite from "expo-sqlite"

export type CacheTable = "mazaars" | "miqaat" | "library"

const TABLE_CONFIG: Record<CacheTable, string> = {
  mazaars: `
    CREATE TABLE IF NOT EXISTS mazaars_cache (
      id TEXT PRIMARY KEY,
      name TEXT,
      data TEXT NOT NULL,
      synced_at TEXT NOT NULL
    );
  `,
  miqaat: `
    CREATE TABLE IF NOT EXISTS miqaat_cache (
      id TEXT PRIMARY KEY,
      name TEXT,
      data TEXT NOT NULL,
      synced_at TEXT NOT NULL
    );
  `,
  library: `
    CREATE TABLE IF NOT EXISTS library_cache (
      id TEXT PRIMARY KEY,
      name TEXT,
      data TEXT NOT NULL,
      synced_at TEXT NOT NULL
    );
  `,
}

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null

function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (!dbPromise) {
    dbPromise = SQLite.openDatabaseAsync("mybohra.db")
  }
  return dbPromise
}

export async function initializeOfflineDB(): Promise<void> {
  const db = await getDb()
  for (const ddl of Object.values(TABLE_CONFIG)) {
    await db.execAsync(ddl)
  }
}

function tableName(table: CacheTable): string {
  return `${table}_cache`
}

export async function cacheData<T extends { id: string | number }>(
  table: CacheTable,
  data: T[],
): Promise<void> {
  const db = await getDb()
  const syncedAt = new Date().toISOString()
  const name = tableName(table)

  await db.withTransactionAsync(async () => {
    for (const item of data) {
      const id = String(item.id)
      const label =
        "name" in item && typeof item.name === "string"
          ? item.name
          : "title" in item && typeof item.title === "string"
            ? item.title
            : null

      await db.runAsync(
        `INSERT OR REPLACE INTO ${name} (id, name, data, synced_at) VALUES (?, ?, ?, ?)`,
        [id, label, JSON.stringify(item), syncedAt],
      )
    }
  })
}

export async function getCachedData<T>(table: CacheTable): Promise<T[]> {
  const db = await getDb()
  const name = tableName(table)
  const rows = await db.getAllAsync<{ data: string }>(`SELECT data FROM ${name}`)
  return rows.map((row) => JSON.parse(row.data) as T)
}

export async function getCacheSyncedAt(table: CacheTable): Promise<string | null> {
  const db = await getDb()
  const name = tableName(table)
  const row = await db.getFirstAsync<{ synced_at: string }>(
    `SELECT synced_at FROM ${name} ORDER BY synced_at DESC LIMIT 1`,
  )
  return row?.synced_at ?? null
}
