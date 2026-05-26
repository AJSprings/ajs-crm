import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { LoanStatusBadge } from "@/components/stage-badge";
import { formatCurrency, formatDate } from "@/lib/format";
import { computeLoanBalance } from "@/lib/loan";

export const dynamic = "force-dynamic";

export default async function LoansPage() {
  const loans = await prisma.loan.findMany({
    include: {
      borrower: true,
      company: true,
      loanActivities: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const totalOutstanding = loans.reduce((sum, l) => sum + computeLoanBalance(l.loanActivities).outstanding, 0);

  return (
    <div>
      <PageHeader
        title="Loans"
        description={`${loans.length} loans · ${formatCurrency(totalOutstanding)} outstanding`}
        action={
          <div className="flex gap-2">
            <a href="/api/loans/export" download className="btn-secondary">⬇ Export</a>
            <Link href="/loans/new" className="btn-primary">+ New loan</Link>
          </div>
        }
      />
      {loans.length === 0 ? (
        <EmptyState
          title="No loans yet"
          description="Originate your first loan to get started."
          action={<Link href="/loans/new" className="btn-primary">Add loan</Link>}
        />
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Reference</th>
                <th className="px-4 py-3">Borrower</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Principal</th>
                <th className="px-4 py-3 text-right">Outstanding</th>
                <th className="px-4 py-3 text-right">Rate</th>
                <th className="px-4 py-3 text-right">Term</th>
                <th className="px-4 py-3">Start</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {loans.map((l) => {
                const bal = computeLoanBalance(l.loanActivities);
                return (
                  <tr key={l.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-mono text-xs">
                      <Link href={`/loans/${l.id}`} className="font-medium text-brand-600 hover:underline">{l.reference}</Link>
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/contacts/${l.borrower.id}`} className="hover:text-brand-600">
                        {l.borrower.firstName} {l.borrower.lastName}
                      </Link>
                      {l.company && <span className="text-slate-500"> · {l.company.name}</span>}
                    </td>
                    <td className="px-4 py-3"><LoanStatusBadge status={l.status} /></td>
                    <td className="px-4 py-3 text-right">{formatCurrency(l.principal)}</td>
                    <td className="px-4 py-3 text-right font-medium">{formatCurrency(bal.outstanding)}</td>
                    <td className="px-4 py-3 text-right text-slate-600">{l.interestRate.toFixed(2)}%</td>
                    <td className="px-4 py-3 text-right text-slate-600">{l.termMonths}mo</td>
                    <td className="px-4 py-3 text-slate-600">{formatDate(l.startDate)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
