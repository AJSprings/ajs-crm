"use client";

import { useRouter } from "next/navigation";
import type { LoanActivity } from "@prisma/client";
import { formatCurrency, formatDate } from "@/lib/format";
import clsx from "clsx";

const TYPE_COLORS: Record<string, string> = {
  DISBURSEMENT: "bg-violet-100 text-violet-700",
  PAYMENT: "bg-emerald-100 text-emerald-700",
  FEE: "bg-amber-100 text-amber-700",
  INTEREST_ACCRUAL: "bg-blue-100 text-blue-700",
  STATUS_CHANGE: "bg-slate-100 text-slate-700",
  NOTE: "bg-slate-100 text-slate-700",
};

export function LoanActivityList({ loanId, activities }: { loanId: string; activities: LoanActivity[] }) {
  const router = useRouter();

  if (activities.length === 0) {
    return <p className="text-sm text-slate-500">No transactions yet.</p>;
  }

  async function remove(id: string) {
    if (!confirm("Delete this transaction?")) return;
    await fetch(`/api/loans/${loanId}/activities/${id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <table className="w-full text-sm">
      <thead className="text-left text-xs uppercase tracking-wide text-slate-500">
        <tr>
          <th className="py-2">Date</th>
          <th className="py-2">Type</th>
          <th className="py-2 text-right">Amount</th>
          <th className="py-2">Note</th>
          <th className="py-2"></th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100">
        {activities.map((a) => (
          <tr key={a.id}>
            <td className="py-2 text-slate-600">{formatDate(a.occurredAt)}</td>
            <td className="py-2">
              <span className={clsx("badge", TYPE_COLORS[a.type] ?? "bg-slate-100 text-slate-700")}>
                {a.type === "STATUS_CHANGE" ? `${a.fromStatus} → ${a.toStatus}` : a.type}
              </span>
            </td>
            <td className="py-2 text-right font-medium">
              {a.type === "STATUS_CHANGE" || a.type === "NOTE" ? "—" : formatCurrency(a.amount)}
            </td>
            <td className="py-2 text-slate-600">{a.note ?? "—"}</td>
            <td className="py-2 text-right">
              <button onClick={() => remove(a.id)} className="text-xs text-slate-400 hover:text-red-600">Delete</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
