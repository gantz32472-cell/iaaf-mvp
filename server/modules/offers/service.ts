import { z } from "zod";
import { createId } from "@/lib/utils/id";
import { nowIso } from "@/lib/utils/date";
import { saveDb, getDb } from "@/lib/store/repository";
import { Offer } from "@/types/models";
import { offerInputSchema, offerPatchSchema } from "@/lib/validation/offers";
import { parseCsv, CsvParseError } from "@/server/services/csv";

export async function listOffers() {
  const db = await getDb();
  return db.offers;
}

export async function createOffer(input: z.input<typeof offerInputSchema>): Promise<Offer> {
  const parsed = offerInputSchema.parse(input);
  const now = nowIso();
  const offer: Offer = {
    id: createId(),
    status: parsed.status ?? "active",
    createdAt: now,
    updatedAt: now,
    ...parsed
  };
  await saveDb((db) => {
    db.offers.push(offer);
  });
  return offer;
}

export async function patchOffer(id: string, input: z.input<typeof offerPatchSchema>): Promise<Offer> {
  const parsed = offerPatchSchema.parse(input);
  let updated: Offer | undefined;
  await saveDb((db) => {
    const idx = db.offers.findIndex((o) => o.id === id);
    if (idx < 0) throw new Error("Offer not found");
    updated = { ...db.offers[idx], ...parsed, updatedAt: nowIso() };
    db.offers[idx] = updated!;
  });
  return updated!;
}

export async function pauseOffer(id: string): Promise<Offer> {
  return patchOffer(id, { status: "paused" });
}

export async function importOffersCsv(csvText: string) {
  const rows = parseCsv(csvText);
  const errors: CsvParseError[] = [];
  const imported: Offer[] = [];
  for (const [index, row] of rows.entries()) {
    try {
      const offer = await createOffer({
        name: row.name,
        category: (row.category as Offer["category"]) || "other",
        aspName: row.aspName,
        destinationUrl: row.destinationUrl,
        referenceUrl: row.referenceUrl || null,
        targetPersona: row.targetPersona || null,
        angles: row.angles ? row.angles.split("|").map((v) => v.trim()).filter(Boolean) : [],
        prLabelRequired: row.prLabelRequired === "true",
        ngWords: row.ngWords ? row.ngWords.split("|").map((v) => v.trim()).filter(Boolean) : [],
        status: (row.status as Offer["status"]) || "active"
      });
      imported.push(offer);
    } catch (error) {
      errors.push({ row: index + 2, message: error instanceof Error ? error.message : "Invalid row" });
    }
  }
  return { importedCount: imported.length, errors, items: imported };
}
