import { openDB, IDBPDatabase } from 'idb';

const DB_NAME = 'pos-offline-db';
const STORE_NAME = 'sync-queue';

interface SyncItem {
  id?: number;
  type: 'sale' | 'payment' | 'customer' | 'customer_update';
  data: any;
  timestamp: number;
}

let dbPromise: Promise<IDBPDatabase> | null = null;

const getDB = () => {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, 1, {
      upgrade(db) {
        db.createObjectStore(STORE_NAME, {
          keyPath: 'id',
          autoIncrement: true,
        });
      },
    });
  }
  return dbPromise;
};

export const addToSyncQueue = async (type: 'sale' | 'payment' | 'customer' | 'customer_update', data: any) => {
  const db = await getDB();
  await db.add(STORE_NAME, {
    type,
    data,
    timestamp: Date.now(),
  });
};

export const getSyncQueue = async (): Promise<SyncItem[]> => {
  const db = await getDB();
  return db.getAll(STORE_NAME);
};

export const removeFromSyncQueue = async (id: number) => {
  const db = await getDB();
  await db.delete(STORE_NAME, id);
};

export const clearSyncQueue = async () => {
  const db = await getDB();
  await db.clear(STORE_NAME);
};
