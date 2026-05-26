import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/page-header";
import { DealStageBadge, LoanStatusBadge } from "@/components/stage-badge";
import { formatCurrency, formatDate } from "@/lib/format";
import { computeLoanBalance } from "@/lib/loan";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const [contactCount, companyCount, openDeals, loansWithActivity, openTasks] = await Promise.all([
    prisma.contact.count(),
    prisma.company.count(),
    prisma.deal.findMany({
      where: { stage: { notIn: ["WON", "LOST"] } },
      include: { contact: true },
      orderBy: { updatedAt: "desc" },
      take: 6,
    }),
    prisma.loan.findMany({
      where: { status: { notIn: ["CLOSED", "REJECTED"] } },
      include: { borrower: true, loanActivities: true },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.activity.findMany({
      where: { type: "TASK", doneAt: null },
      orderBy: [{ dueAt: "asc" }, { createdAt: "desc" }],
      include: { contact: true, deal: true, loan: true },
      take: 5,
    }),
  ]);

  const outstandingTotal = loansWithActivity.reduce(
    (sum, l) => sum + computeLoanBalance(l.loanActivities).outstanding,
    0
  );
  const dealValueOpen = openDeals.reduce((sum, d) => sum + d.amount, 0);

  return (
    <div>
      <PageHeader title="Dashboard" description="Overview of your CRM." />

      <div className="grid grid-cols-4 gap-4 mb-6">
        <StatCard label="Contacts" value={contactCount.toString()} href="/contacts" />
        <StatCard label="Companies" value={companyCount.toString()} href="/companies" />
        <StatCard label="Open deals" value={`${openDeals.length} · ${formatCurrency(dealValueOpen)}`} href="/deals" />
        <StatCard label="Outstanding loans" value={formatCurrency(outstandingTotal)} href="/loans" />
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="card p-6 col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold">Active loans ({loansWithActivity.length})</h2>
            <Link href="/loans" className="text-sm text-brand-600 hover:underline">View all →</Link>
          </div>
          {loansWithActivity.length === 0 ? (
            <p className="text-sm text-slate-500">No active loans.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="py-2">Ref</th>
                  <th className="py-2">Borrower</th>
                  <th className="py-2">Status</th>
                  <th className="py-2 text-right">Outstanding</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loansWithActivity.slice(0, 8).map((l) => {
                  const bal = computeLoanBalance(l.loanActivities);
                  return (
                    <tr key={l.id} className="hover:bg-slate-50">
                      <td className="py-2 font-mono text-xs">
                        <Link href={`/loans/${l.id}`} className="text-brand-600 hover:underline">{l.reference}</Link>
                      </td>
                      <td className="py-2">{l.borrower.firstName} {l.borrower.lastName}</td>
                      <td className="py-2"><LoanStatusBadge status={l.status} /></td>
                      <td className="py-2 text-right font-medium">{formatCurrency(bal.outstanding)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        <div className="space-y-6">
          <div className="card p-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold">Open deals</h2>
              <Link href="/deals" className="text-sm text-brand-600 hover:underline">Pipeline →</Link>
            </div>
            {openDeals.length === 0 ? (
              <p className="text-sm text-slate-500">No open deals.</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {openDeals.map((d) => (
                  <li key={d.id} className="flex items-center justify-between gap-2">
                    <Link href={`/deals/${d.id}`} className="truncate hover:text-brand-600">{d.title}</Link>
                    <DealStageBadge stage={d.stage} />
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold">My tasks</h2>
              <Link href="/activities" className="text-sm text-brand-600 hover:underline">All →</Link>
            </div>
            {openTasks.length === 0 ? (
              <p className="text-sm text-slate-500">No open tasks.</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {openTasks.map((t) => (
                  <li key={t.id} className="flex items-start justify-between gap-2">
                    <span className="truncate">{t.subject}</span>
                    {t.dueAt && <span className="text-xs text-amber-700 shrink-0">{formatDate(t.dueAt)}</span>}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, href }: { label: string; value: string; href: string }) {
  return (
    <Link href={href} className="card p-4 hover:border-brand-300 transition-colors">
      <div className="text-xs uppercase tracking-wide text-slate-500">{label}</div>
      <div className="mt-1 text-xl font-semibold text-slate-900">{value}</div>
    </Link>
  );
}
