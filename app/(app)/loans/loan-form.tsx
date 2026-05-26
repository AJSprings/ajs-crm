"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Loan, Contact, Company } from "@prisma/client";
import { LOAN_STATUSES, LOAN_STATUS_LABELS, type LoanStatus } from "@/lib/constants";
import { monthlyPayment } from "@/lib/loan";
import { formatCurrency } from "@/lib/format";

type Props = {
  loan?: Loan;
  contacts: (Contact & { company: Company | null })[];
  companies: Company[];
  defaultBorrowerId?: string;
};

export function LoanForm({ loan, contacts, companies, defaultBorrowerId }: Props) {
  const router = useRouter();
  const [form, setForm] = useState({
    principal: loan?.principal?.toString() ?? "",
    interestRate: loan?.interestRate?.toString() ?? "7.5",
    termMonths: loan?.termMonths?.toString() ?? "36",
    startDate: loan?.startDate ? new Date(loan.startDate).toISOString().slice(0, 10) : "",
    status: (loan?.status ?? "APPLICATION") as LoanStatus,
    purpose: loan?.purpose ?? "",
    notes: loan?.notes ?? "",
    borrowerId: loan?.borrowerId ?? defaultBorrowerId ?? "",
    companyId: loan?.companyId ?? "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function setField<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => {
      const next = { ...f, [key]: value };
      if (key === "borrowerId" && value) {
        const c = contacts.find((x) => x.id === value);
        if (c?.companyId) next.companyId = c.companyId;
      }
      return next;
    });
  }

  const principal = Number(form.principal) || 0;
  const rate = Number(form.interestRate) || 0;
  const term = Number(form.termMonths) || 0;
  const estPayment = monthlyPayment(principal, rate, term);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const url = loan ? `/api/loans/${loan.id}` : "/api/loans";
    const method = loan ? "PATCH" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "content-type": "application/json" },
      body: JSON.stringify(form),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(typeof data.error === "string" ? data.error : "Failed to save loan");
      return;
    }
    const saved = await res.json();
    router.push(`/loans/${saved.id}`);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="card p-6 space-y-4">
      <div>
        <label className="label">Borrower (Contact)</label>
        <select className="input" value={form.borrowerId} onChange={(e) => setField("borrowerId", e.target.value)} required>
          <option value="">Select borrower…</option>
          {contacts.map((c) => (
            <option key={c.id} value={c.id}>{c.firstName} {c.lastName}{c.company ? ` (${c.company.name})` : ""}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="label">Company (optional)</label>
        <select className="input" value={form.companyId} onChange={(e) => setField("companyId", e.target.value)}>
          <option value="">—</option>
          {companies.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="label">Principal ($)</label>
          <input type="number" min={0} step="0.01" className="input" value={form.principal} onChange={(e) => setField("principal", e.target.value)} required />
        </div>
        <div>
          <label className="label">Annual rate (%)</label>
          <input type="number" min={0} step="0.01" className="input" value={form.interestRate} onChange={(e) => setField("interestRate", e.target.value)} required />
        </div>
        <div>
          <label className="label">Term (months)</label>
          <input type="number" min={1} step="1" className="input" value={form.termMonths} onChange={(e) => setField("termMonths", e.target.value)} required />
        </div>
      </div>

      {principal > 0 && term > 0 && (
        <div className="bg-brand-50 border border-brand-100 rounded-md p-3 text-sm text-brand-700">
          Estimated monthly payment: <span className="font-semibold">{formatCurrency(estPayment)}</span>
          {" · "}Total to repay: <span className="font-semibold">{formatCurrency(estPayment * term)}</span>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Start date</label>
          <input type="date" className="input" value={form.startDate} onChange={(e) => setField("startDate", e.target.value)} />
        </div>
        <div>
          <label className="label">Status</label>
          <select className="input" value={form.status} onChange={(e) => setField("status", e.target.value)}>
            {LOAN_STATUSES.map((s) => (
              <option key={s} value={s}>{LOAN_STATUS_LABELS[s]}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="label">Purpose</label>
        <input className="input" value={form.purpose} onChange={(e) => setField("purpose", e.target.value)} placeholder="e.g. Working capital" />
      </div>
      <div>
        <label className="label">Notes</label>
        <textarea className="input min-h-[100px]" value={form.notes} onChange={(e) => setField("notes", e.target.value)} />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex justify-end gap-3">
        <button type="button" className="btn-secondary" onClick={() => router.back()}>Cancel</button>
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? "Saving…" : loan ? "Save changes" : "Create loan"}
        </button>
      </div>
    </form>
  );
}
