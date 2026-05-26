"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

type Result = { created: number; skipped?: number; errors: { row: number; error: string }[] };

export function ImportCard({
  title,
  description,
  endpoint,
}: {
  title: string;
  description: string;
  endpoint: string;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onFile(file: File) {
    setLoading(true);
    setError(null);
    setResult(null);
    const text = await file.text();
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "content-type": "text/csv" },
      body: text,
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Import failed");
      return;
    }
    const data = (await res.json()) as Result;
    setResult(data);
    router.refresh();
  }

  return (
    <div className="card p-6">
      <h3 className="font-semibold">{title}</h3>
      <p className="text-sm text-slate-500 mt-1">{description}</p>
      <input
        ref={inputRef}
        type="file"
        accept=".csv,text/csv"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onFile(f);
        }}
      />
      <button
        className="btn-primary mt-4"
        onClick={() => inputRef.current?.click()}
        disabled={loading}
      >
        {loading ? "Importing…" : "Choose CSV…"}
      </button>

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      {result && (
        <div className="mt-3 text-sm">
          <p className="text-emerald-700">Created {result.created}{typeof result.skipped === "number" ? `, skipped ${result.skipped} duplicate${result.skipped === 1 ? "" : "s"}` : ""}.</p>
          {result.errors.length > 0 && (
            <details className="mt-2">
              <summary className="cursor-pointer text-amber-700">
                {result.errors.length} row error{result.errors.length === 1 ? "" : "s"}
              </summary>
              <ul className="mt-2 space-y-1 text-xs text-slate-600">
                {result.errors.slice(0, 20).map((e, i) => (
                  <li key={i}>Row {e.row}: {e.error}</li>
                ))}
              </ul>
            </details>
          )}
        </div>
      )}
    </div>
  );
}
