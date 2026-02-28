import { afterEach, describe, expect, it, vi } from "vitest";
import { notifyPublishScheduledAnomalies } from "@/server/services/ops-alert";

describe("notifyPublishScheduledAnomalies", () => {
  const originalWebhook = process.env.OPS_ALERT_WEBHOOK_URL;

  afterEach(() => {
    process.env.OPS_ALERT_WEBHOOK_URL = originalWebhook;
    vi.restoreAllMocks();
  });

  it("skips when webhook is not configured", async () => {
    delete process.env.OPS_ALERT_WEBHOOK_URL;
    const res = await notifyPublishScheduledAnomalies({
      scanned: 10,
      due: 2,
      published: 2,
      failed: 0,
      invalidScheduledAtCount: 0
    });
    expect(res.sent).toBe(false);
    expect(res.reason).toBe("webhook_not_configured");
  });

  it("sends alert when anomalies exist", async () => {
    process.env.OPS_ALERT_WEBHOOK_URL = "https://example.com/webhook";
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 200 });
    vi.stubGlobal("fetch", fetchMock);

    const res = await notifyPublishScheduledAnomalies({
      scanned: 5,
      due: 3,
      published: 2,
      failed: 1,
      invalidScheduledAtCount: 0
    });

    expect(res.sent).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});

