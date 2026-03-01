import { beforeEach, describe, expect, it } from "vitest";
import { GET } from "@/app/api/jobs/auto-generate-schedule/route";

describe("auto-generate-schedule route auth", () => {
  beforeEach(() => {
    delete process.env.CRON_PUBLISH_SECRET;
    process.env.AUTO_POST_FORCE_SCHEDULED_AT = "2026-03-01T10:00:00.000Z";
  });

  it("returns 401 when cron key is configured and invalid", async () => {
    process.env.CRON_PUBLISH_SECRET = "secret-key";
    const request = new Request("http://localhost:3000/api/jobs/auto-generate-schedule?key=wrong");
    const response = await GET(request);

    expect(response.status).toBe(401);
    const body = await response.json();
    expect(body.success).toBe(false);
    expect(body.error.code).toBe("UNAUTHORIZED");
  });
});

