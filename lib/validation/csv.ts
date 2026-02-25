import { z } from "zod";

export const offersCsvImportSchema = z.object({
  csvText: z.string().min(1)
});

export const conversionsCsvImportSchema = z.object({
  csvText: z.string().min(1)
});
