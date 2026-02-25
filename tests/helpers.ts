import { writeMockDb, emptyDb } from "@/lib/store/mock-db";

export async function resetMockDb() {
  await writeMockDb(emptyDb());
}
