"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

export function ScanForm() {
  const router = useRouter();
  const [domain, setDomain] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!domain.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        setError(body?.error ?? "Something went wrong.");
        setLoading(false);
        return;
      }

      const scan = await response.json();
      router.push(`/scan/${scan.id}`);
    } catch {
      setError("Couldn't reach the scanner. Try again.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="flex items-center gap-3 rounded-full border border-border bg-surface px-5 py-4 transition-colors focus-within:border-accent">
        <span className={`h-2 w-2 shrink-0 rounded-full bg-accent ${loading ? "animate-scan-pulse" : ""}`} />
        <input
          type="text"
          value={domain}
          onChange={(event) => setDomain(event.target.value)}
          placeholder="allbirds.com"
          disabled={loading}
          autoFocus
          className="flex-1 bg-transparent font-mono text-base text-foreground outline-none placeholder:text-muted disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={loading || !domain.trim()}
          className="shrink-0 rounded-full bg-accent px-5 py-2 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90 disabled:opacity-40"
        >
          {loading ? "Scanning…" : "Scan"}
        </button>
      </div>
      {error && <p className="mt-3 text-sm text-not-yet">{error}</p>}
    </form>
  );
}
