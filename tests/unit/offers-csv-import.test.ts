import { beforeEach, describe, expect, it } from "vitest";
import { resetMockDb } from "@/tests/helpers";
import { importOffersCsv, listOffers } from "@/server/modules/offers/service";

describe("offers CSV import", () => {
  beforeEach(async () => {
    await resetMockDb();
  });

  it("imports basic CSV rows", async () => {
    const csvText =
      "name,category,aspName,destinationUrl,referenceUrl,targetPersona,angles,prLabelRequired,ngWords,status\n" +
      "回線比較,internet,A8,https://example.com,,在宅,料金|速度,true,絶対|No.1,active";
    const result = await importOffersCsv(csvText);
    expect(result.importedCount).toBe(1);
    expect(result.errors).toHaveLength(0);
    expect((await listOffers())[0].name).toBe("回線比較");
  });
});
