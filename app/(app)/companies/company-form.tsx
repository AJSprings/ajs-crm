"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Company } from "@prisma/client";

export function CompanyForm({ company }: { company?: Company }) {
  const router = useRouter();
  const [form, setForm] = useState({
    name: company?.name ?? "",
    industry: company?.industry ?? "",
    website: company?.website ?? "",
    phone: company?.phone ?? "",
    notes: company?.notes ?? "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const url = company ? `/api/companies/${company.id}` : "/api/companies";
    const method = company ? "PATCH" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "content-type": "application/json" },
      body: JSON.stringify(form),
    });
    setLoading(false);
    if (!res.ok) {
      setError("Failed to save company");
      return;
    }
    const saved = await res.json();
    router.push(`/companies/${saved.id}`);
    router.refresh();
  }

  function setField<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  return (
    <form onSubmit={onSubmit} className="card p-6 space-y-4">
      <div>
        <label className="label">Name</label>
        <input className="input" value={form.name} onChange={(e) => setField("name", e.target.value)} required />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Industry</label>
          <input className="input" value={form.industry} onChange={(e) => setField("industry", e.target.value)} />
        </div>
        <div>
          <label className="label">Phone</label>
          <input className="input" value={form.phone} onChange={(e) => setField("phone", e.target.value)} />
        </div>
      </div>
      <div>
        <label className="label">Website</label>
        <input className="input" value={form.website} onChange={(e) => setField("website", e.target.value)} />
      </div>
      <div>
        <label className="label">Notes</label>
        <textarea className="input min-h-[100px]" value={form.notes} onChange={(e) => setField("notes", e.target.value)} />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex justify-end gap-3">
        <button type="button" className="btn-secondary" onClick={() => router.back()}>Cancel</button>
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? "Saving…" : company ? "Save changes" : "Create company"}
        </button>
      </div>
    </form>
  );
}
