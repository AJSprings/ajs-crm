"use client";

import { useState } from "react";
import { formatCurrency, formatDate } from "@/lib/format";
import type { AmortizationRow } from "@/lib/loan";

export function Amortization({ rows }: { rows: AmortizationRow[] }) {
  const [open, setOpen] = useState(false);
  if (rows.length === 0) return null;

  const totalInterest = rows.reduce((s, r) => s + r.interest, 0);
  const totalPayments = rows.reduce((s, r) => s + r.payment, 0);

  return (
    <div className="card p-6">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between"
      >
        <div>
          <h3 className="font-semibold text-left">Amortization schedule</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            {rows.length} payments · {formatCurrency(totalInterest)} total interest · {formatCurrency(totalPayments)} total repaid
          </p>
        </div>
        <span className="text-slate-400 text-xl">{open ? "−" : "+"}</span>
      </button>
      {open && (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="py-2">#</th>
                <th className="py-2">Due</th>
                <th className="py-2 text-right">Payment</th>
                <th className="py-2 text-right">Interest</th>
                <th className="py-2 text-right">Principal</th>
                <th className="py-2 text-right">Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((r) => (
                <tr key={r.monthNumber}>
                  <td className="py-1.5 text-slate-500">{r.monthNumber}</td>
                  <td className="py-1.5 text-slate-600">{formatDate(r.dueDate)}</td>
                  <td className="py-1.5 text-right">{formatCurrency(r.payment)}</td>
                  <td className="py-1.5 text-right text-slate-600">{formatCurrency(r.interest)}</td>
                  <td className="py-1.5 text-right text-slate-600">{formatCurrency(r.principal)}</td>
                  <td className="py-1.5 text-right font-medium">{formatCurrency(r.balance)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
