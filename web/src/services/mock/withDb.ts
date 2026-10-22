import { delay, getMockConfig } from "./config";
import { loadDb, saveDb, type DbState } from "./db";
import { sweepExpired } from "./derive";

/**
 * Jalankan operasi atas DB mock: simulasi latensi → load → sweep expired →
 * operasi → persist. Menjadi satu-satunya pintu akses store (DRY).
 */
export async function withDb<T>(op: (db: DbState) => T | Promise<T>): Promise<T> {
  await delay(getMockConfig().latencyMs);
  const db = loadDb();
  sweepExpired(db);
  try {
    return await op(db);
  } finally {
    saveDb(db);
  }
}
