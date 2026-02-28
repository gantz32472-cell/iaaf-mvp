type PublishScheduledSummary = {
  scanned: number;
  due: number;
  published: number;
  failed: number;
  invalidScheduledAtCount: number;
};

function shouldNotify(summary: PublishScheduledSummary) {
  return summary.failed > 0 || summary.invalidScheduledAtCount > 0;
}

function buildMessage(summary: PublishScheduledSummary) {
  return [
    "[publish-scheduled] anomalies detected",
    `scanned=${summary.scanned}`,
    `due=${summary.due}`,
    `published=${summary.published}`,
    `failed=${summary.failed}`,
    `invalidScheduledAt=${summary.invalidScheduledAtCount}`
  ].join(" | ");
}

export async function notifyPublishScheduledAnomalies(summary: PublishScheduledSummary) {
  const webhookUrl = process.env.OPS_ALERT_WEBHOOK_URL?.trim();
  if (!webhookUrl) return { sent: false as const, reason: "webhook_not_configured" as const };
  if (!shouldNotify(summary)) return { sent: false as const, reason: "no_anomaly" as const };

  try {
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: buildMessage(summary),
        summary
      })
    });
    if (!res.ok) {
      return { sent: false as const, reason: "request_failed" as const, status: res.status };
    }
    return { sent: true as const };
  } catch {
    return { sent: false as const, reason: "request_failed" as const };
  }
}

