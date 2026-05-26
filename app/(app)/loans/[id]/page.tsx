import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/page-header";
import { DeleteButton } from "@/components/delete-button";
import { LoanStatusBadge } from "@/components/stage-badge";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/format";
import { amortizationSchedule, computeLoanBalance, monthlyPayment } from "@/lib/loan";
import { ActivityList } from "@/components/activity-list";
import { ActivityForm } from "@/components/activity-form";
import { LoanActivityForm } from "./loan-activity-form";
import { LoanActivityList } from "./loan-activity-list";
import { Amortization } from "./amortization";

export const dynamic = "force-dynamic";

export default async function LoanDetail({ params }: { params: { id: string } }) {
  const loan = await prisma.loan.findUnique({
    where: { id: params.id },
    include: {
      borrower: true,
      company: true,
      officer: true,
      loanActivities: { orderBy: { occurredAt: "desc" } },
      activities: { orderBy: { createdAt: "desc" }, include: { author: true } },
    },
  });
  if (!loan) notFound();

  const balance = computeLoanBalance(loan.loanActivities);
  const estPayment = monthlyPayment(loan.principal, loan.interestRate, loan.termMonths);
  const schedule = amortizationSchedule(loan.principal, loan.interestRate, loan.termMonths, loan.startDate);

  return (
    <div>
      <PageHeader
        title={loan.reference}
        description={
          <>
            <Link href={`/contacts/${loan.borrower.id}`} className="hover:text-brand-600">
              {loan.borrower.firstName} {loan.borrower.lastName}
            </Link>
            {loan.company && (
              <> · <Link href={`/companies/${loan.company.id}`} className="hover:text-brand-600">{loan.company.name}</Link></>
            )}
            {loan.purpose && <> · {loan.purpose}</>}
          </>
        }
        action={
          <div className="flex gap-2 items-center">
            <LoanStatusBadge status={loan.status} />
            <Link href={`/loans/${loan.id}/edit`} className="btn-secondary">Edit</Link>
            <DeleteButton url={`/api/loans/${loan.id}`} redirectTo="/loans" />
          </div>
        }
      />

      <div className="grid grid-cols-4 gap-4 mb-6">
        <Stat label="Principal" value={formatCurrency(loan.principal)} />
        <Stat label="Disbursed" value={formatCurrency(balance.disbursed)} tone="info" />
        <Stat label="Paid" value={formatCurrency(balance.paid)} tone="success" />
        <Stat label="Outstanding" value={formatCurrency(balance.outstanding)} tone={balance.outstanding > 0 ? "warn" : "muted"} />
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-1 space-y-6">
          <div className="card p-6 space-y-2 text-sm">
            <Field label="Reference" value={<span className="font-mono">{loan.reference}</span>} />
            <Field label="Borrower" value={<Link href={`/contacts/${loan.borrower.id}`} className="text-brand-600 hover:underline">{loan.borrower.firstName} {loan.borrower.lastName}</Link>} />
            <Field label="Status" value={<LoanStatusBadge status={loan.status} />} />
            <Field label="Interest rate" value={`${loan.interestRate.toFixed(2)}% p.a.`} />
            <Field label="Term" value={`${loan.termMonths} months`} />
            <Field label="Est. payment / mo" value={formatCurrency(estPayment)} />
            <Field label="Start date" value={formatDate(loan.startDate)} />
            <Field label="Loan officer" value={loan.officer?.name ?? "—"} />
            <Field label="Fees / interest accrued" value={`${formatCurrency(balance.fees)} / ${formatCurrency(balance.interestAccrued)}`} />
            <Field label="Notes" value={loan.notes ?? "—"} />
          </div>
        </div>
        <div className="col-span-2 space-y-6">
          <div className="card p-6">
            <h3 className="font-semibold mb-3">Record loan transaction</h3>
            <p className="text-xs text-slate-500 mb-3">
              Disbursements pay out to the borrower. Payments are received from the borrower.
              First disbursement auto-advances status to <em>Disbursed</em>; first payment to <em>Repaying</em>.
            </p>
            <LoanActivityForm loanId={loan.id} />
          </div>
          <div className="card p-6">
            <h3 className="font-semibold mb-3">Loan ledger</h3>
            <LoanActivityList loanId={loan.id} activities={loan.loanActivities} />
          </div>
          <Amortization rows={schedule} />
          <div className="card p-6">
            <h3 className="font-semibold mb-3">Notes & activity</h3>
            <ActivityForm loanId={loan.id} />
            <div className="mt-4">
              <ActivityList activities={loan.activities} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, tone = "default" }: { label: string; value: string; tone?: "default" | "info" | "success" | "warn" | "muted" }) {
  const toneClass = {
    default: "bg-white",
    info: "bg-blue-50",
    success: "bg-emerald-50",
    warn: "bg-amber-50",
    muted: "bg-slate-50",
  }[tone];
  return (
    <div className={`card p-4 ${toneClass}`}>
      <div className="text-xs uppercase tracking-wide text-slate-500">{label}</div>
      <div className="mt-1 text-xl font-semibold text-slate-900">{value}</div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-slate-500">{label}</dt>
      <dd className="mt-0.5 text-slate-900">{value}</dd>
    </div>
  );
}
