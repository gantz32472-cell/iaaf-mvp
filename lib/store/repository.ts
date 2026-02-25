import { MockDatabase } from "@/types/models";
import { readMockDb, updateMockDb } from "@/lib/store/mock-db";
import { ENABLE_MOCK_MODE } from "@/lib/constants";
import { readPrismaState, writePrismaState } from "@/lib/store/prisma-state";

export async function getDb(): Promise<MockDatabase> {
  if (ENABLE_MOCK_MODE) return readMockDb();
  return readPrismaState();
}

export async function saveDb(mutator: (db: MockDatabase) => void | MockDatabase): Promise<MockDatabase> {
  if (ENABLE_MOCK_MODE) return updateMockDb(mutator);
  const db = await readPrismaState();
  const result = mutator(db);
  const next = result && typeof result === "object" && !Array.isArray(result) ? result : db;
  await writePrismaState(next);
  return next;
}
