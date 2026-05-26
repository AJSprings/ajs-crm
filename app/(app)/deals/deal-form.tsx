"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Deal, Contact, Company } from "@prisma/client";
import { DEAL_STAGES, DEAL_STAGE_LABELS, type DealStage } from "@/lib/constants";

type Props = {
  deal?: Deal;
  contacts: (Contact & { company: Company | null })[];
  companies: Company[];
  defaultContactId?: string;
};

export function DealForm({ deal, contacts, companies, defaultContactId }: Props) {
  const router = useRouter();
  const [form, setForm] = useState({
    title: deal?.title ?? "",
    amount: deal?.amount?.toString() ?? "0",
    stage: (deal?.stage ?? "LEAD") as DealStage,
    closeDate: deal?.closeDate ? new Date(deal.closeDate).toISOString().slice(0, 10) : "",
    notes: deal?.notes ?? "",
    contactId: deal?.contactId ?? defaultContactId ?? "",
    companyId: deal?.companyId ?? "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function setField<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => {
      const next = { ...f, [key]: value };
      // Auto-fill company from contact
      if (key === "contactId" && value) {
        const c = contacts.find((x) => x.id === value);
        if (c?.companyId) next.companyId = c.companyId;
      }
      return next;
    });
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const url = deal ? `/api/deals/${deal.id}` : "/api/deals";
    const method = deal ? "PATCH" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "content-type": "application/json" },
      body: JSON.stringify(form),
    });
    setLoading(false);
    if (!res.ok) {
      setError("Failed to save deal");
      return;
    }
    const saved = await res.json();
    router.push(`/deals/${saved.id}`);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="card p-6 space-y-4">
      <div>
        <label className="label">Title</label>
        <input className="input" value={form.title} onChange={(e) => setField("title", e.target.value)} required />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Amount</label>
          <input type="number" min={0} step="0.01" className="input" value={form.amount} onChange={(e) => setField("amount", e.target.value)} />
        </div>
        <div>
          <label className="label">Stage</label>
          <select className="input" value={form.stage} onChange={(e) => setField("stage", e.target.value)}>
            {DEAL_STAGES.map((s) => (
              <option key={s} value={s}>{DEAL_STAGE_LABELS[s]}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Contact</label>
          <select className="input" value={form.contactId} onChange={(e) => setField("contactId", e.target.value)}>
            <option value="">—</option>
            {contacts.map((c) => (
              <option key={c.id} value={c.id}>{c.firstName} {c.lastName}{c.company ? ` (${c.company.name})` : ""}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Company</label>
          <select className="input" value={form.companyId} onChange={(e) => setField("companyId", e.target.value)}>
            <option value="">—</option>
            {companies.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label className="label">Expected close date</label>
        <input type="date" className="input" value={form.closeDate} onChange={(e) => setField("closeDate", e.target.value)} />
      </div>
      <div>
        <label className="label">Notes</label>
        <textarea className="input min-h-[100px]" value={form.notes} onChange={(e) => setField("notes", e.target.value)} />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex justify-end gap-3">
        <button type="button" className="btn-secondary" onClick={() => router.back()}>Cancel</button>
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? "Saving…" : deal ? "Save changes" : "Create deal"}
        </button>
      </div>
    </form>
  );
}
