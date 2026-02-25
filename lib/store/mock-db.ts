import fs from "node:fs/promises";
import path from "node:path";
import { MockDatabase } from "@/types/models";

const dbFilePath = path.join(process.cwd(), "data", "mock-db.json");
let writeQueue: Promise<unknown> = Promise.resolve();

export const emptyDb = (): MockDatabase => ({
  offers: [],
  generatedPosts: [],
  dmRules: [],
  dmConversations: [],
  clickEvents: [],
  conversionReports: [],
  shortLinks: []
});

async function readMockDbFile(): Promise<MockDatabase> {
  const raw = await fs.readFile(dbFilePath, "utf8");
  return JSON.parse(raw) as MockDatabase;
}

export async function readMockDb(): Promise<MockDatabase> {
  await writeQueue.catch(() => undefined);
  try {
    return await readMockDbFile();
  } catch (error) {
    const err = error as NodeJS.ErrnoException;
    if (err.code === "ENOENT") {
      const db = emptyDb();
      await writeMockDb(db);
      return db;
    }
    throw error;
  }
}

export async function writeMockDb(db: MockDatabase): Promise<void> {
  await fs.mkdir(path.dirname(dbFilePath), { recursive: true });
  const tempPath = `${dbFilePath}.tmp`;
  await fs.writeFile(tempPath, JSON.stringify(db, null, 2), "utf8");
  await fs.rename(tempPath, dbFilePath);
}

export async function updateMockDb(mutator: (db: MockDatabase) => MockDatabase | void) {
  const task = writeQueue.then(async () => {
    let db: MockDatabase;
    try {
      db = await readMockDbFile();
    } catch (error) {
      const err = error as NodeJS.ErrnoException;
      if (err.code === "ENOENT") {
        db = emptyDb();
      } else {
        throw error;
      }
    }
    const result = mutator(db);
    const next =
      result && typeof result === "object" && !Array.isArray(result)
        ? (result as MockDatabase)
        : db;
    await writeMockDb(next);
    return next;
  });
  writeQueue = task.catch(() => undefined);
  return task;
}
