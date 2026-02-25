"use client";

import { useState, startTransition } from "react";

export function JsonFormAction(props: {
  title: string;
  endpoint: string;
  method?: "POST" | "PATCH";
  initialJson: string;
  buttonLabel?: string;
}) {
  const [payload, setPayload] = useState(props.initialJson);
  const [result, setResult] = useState<string>("");
  const [loading, setLoading] = useState(false);

  async function submit() {
    setLoading(true);
    try {
      const res = await fetch(props.endpoint, {
        method: props.method ?? "POST",
        headers: { "Content-Type": "application/json" },
        body: payload
      });
      const json = await res.json();
      startTransition(() => setResult(JSON.stringify(json, null, 2)));
    } catch (e) {
      setResult(String(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-2 rounded-xl border border-slate-200 p-3">
      <div className="text-sm font-medium">{props.title}</div>
      <textarea
        rows={6}
        value={payload}
        onChange={(e) => setPayload(e.target.value)}
        className="font-mono text-xs"
      />
      <button onClick={submit} disabled={loading} className="bg-brand-700 text-white hover:bg-brand-900 disabled:opacity-60">
        {loading ? "Sending..." : props.buttonLabel ?? "Send"}
      </button>
      {result && <pre className="max-h-64 overflow-auto rounded-lg bg-slate-950 p-3 text-xs text-green-200">{result}</pre>}
    </div>
  );
}

export function PostActionButton({ endpoint, label }: { endpoint: string; label: string }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  async function run() {
    setLoading(true);
    const res = await fetch(endpoint, { method: "POST" });
    const json = await res.json();
    setMessage(json.success ? "OK" : json.error?.message ?? "Error");
    setLoading(false);
  }
  return (
    <div className="flex items-center gap-2">
      <button onClick={run} disabled={loading} className="bg-slate-100 hover:bg-slate-200">
        {loading ? "..." : label}
      </button>
      {message && <span className="text-xs text-slate-500">{message}</span>}
    </div>
  );
}
