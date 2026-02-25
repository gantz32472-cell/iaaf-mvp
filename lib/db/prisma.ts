import { PrismaClient } from "@prisma/client";
import { ENABLE_MOCK_MODE } from "@/lib/constants";

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

export function getPrismaClient(): PrismaClient | null {
  if (ENABLE_MOCK_MODE) return null;
  if (!global.__prisma) global.__prisma = new PrismaClient();
  return global.__prisma;
}
