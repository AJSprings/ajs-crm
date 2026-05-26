"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { LOAN_ACTIVITY_TYPES, type LoanActivityType } from "@/lib/constants";

const TYPE_LABELS: Record<LoanActivityType, string> = {
  DISBURSEMENT: "Disbursement (out)",
  PAYMENT: "Payment received",
  FEE: "Fee charged",
  INTEREST_ACCRUAL: "Interest accrued",
  STATUS_CHANGE: "Status change",
  NOTE: "Note",
};

export function LoanActivityForm({ loanId }: { loanId: string }) {
  const router = useRouter();
  const [type, setType] = useState<LoanActivityType>("PAYMENT");
  const [amount, setAmount] = useState("");
  const [occurredAt, setOccurredAt] = useState(() => new Date().toISOString().slice(0, 10));
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch(`/api/loans/${loanId}/activities`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ type, amount, occurredAt, note }),
    });
    setLoading(false);
    if (!res.ok) {
      alert("Failed to record");
      return;
    }
    setAmount("");
    setNote("");
    router.refresh();
  }

  const hideAmount = type === "STATUS_CHANGE" || type === "NOTE";

  return (
    <form onSubmit={onSubmit} className="grid grid-cols-12 gap-3">
      <div className="col-span-4">
        <label className="label">Type</label>
        <select className="input" value={type} onChange={(e) => setType(e.target.value as LoanActivityType)}>
          {LOAN_ACTIVITY_TYPES.filter((t) => t !== "STATUS_CHANGE").map((t) => (
            <option key={t} value={t}>{TYPE_LABELS[t]}</option>
          ))}
        </select>
      </div>
      <div className="col-span-3">
        <label className="label">Amount</label>
        <input
          type="number"
          step="0.01"
          min={0}
          className="input"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          disabled={hideAmount}
          required={!hideAmount}
        />
      </div>
      <div className="col-span-3">
        <label className="label">Date</label>
        <input type="date" className="input" value={occurredAt} onChange={(e) => setOccurredAt(e.target.value)} />
      </div>
      <div className="col-span-2 flex items-end">
        <button type="submit" className="btn-primary w-full" disabled={loading}>
          {loading ? "Saving…" : "Record"}
        </button>
      </div>
      <div className="col-span-12">
        <label className="label">Note (optional)</label>
        <input className="input" value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. ACH transfer ref #123" />
      </div>
    </form>
  );
}
