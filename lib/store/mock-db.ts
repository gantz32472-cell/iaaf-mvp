import fs from "node:fs/promises";
import path from "node:path";
import { MockDatabase } from "@/types/models";

function resolveDbFilePath() {
  const explicitPath = process.env.MOCK_DB_FILE?.trim();
  if (explicitPath) {
    return path.isAbsolute(explicitPath) ? explicitPath : path.join(process.cwd(), explicitPath);
  }

  if (process.env.VITEST) {
    const workerId = process.env.VITEST_POOL_ID ?? process.env.TEST_WORKER_ID ?? process.env.JEST_WORKER_ID ?? String(process.pid);
    return path.join(process.cwd(), "data", `mock-db.test-${workerId}.json`);
  }

  return path.join(process.cwd(), "data", "mock-db.json");
}

const dbFilePath = resolveDbFilePath();
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
  if (process.env.VITEST) {
    await fs.writeFile(dbFilePath, JSON.stringify(db, null, 2), "utf8");
    return;
  }
  const tempPath = `${dbFilePath}.tmp.${process.pid}`;
  await fs.writeFile(tempPath, JSON.stringify(db, null, 2), "utf8");
  try {
    await fs.rename(tempPath, dbFilePath);
  } catch (error) {
    const err = error as NodeJS.ErrnoException;
    if (err.code !== "EPERM" && err.code !== "EACCES") throw error;
    await fs.copyFile(tempPath, dbFilePath);
    await fs.unlink(tempPath).catch(() => undefined);
  }
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
