import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/page-header";
import { DeleteButton } from "@/components/delete-button";
import { DealStageBadge } from "@/components/stage-badge";
import { formatCurrency, formatDate } from "@/lib/format";
import { ActivityList } from "@/components/activity-list";
import { ActivityForm } from "@/components/activity-form";

export const dynamic = "force-dynamic";

export default async function DealDetail({ params }: { params: { id: string } }) {
  const deal = await prisma.deal.findUnique({
    where: { id: params.id },
    include: {
      contact: true,
      company: true,
      owner: true,
      activities: { orderBy: { createdAt: "desc" }, include: { author: true } },
    },
  });
  if (!deal) notFound();

  return (
    <div>
      <PageHeader
        title={deal.title}
        description={`${formatCurrency(deal.amount)} · close ${formatDate(deal.closeDate)}`}
        action={
          <div className="flex gap-2 items-center">
            <DealStageBadge stage={deal.stage} />
            <Link href={`/deals/${deal.id}/edit`} className="btn-secondary">Edit</Link>
            <DeleteButton url={`/api/deals/${deal.id}`} redirectTo="/deals" />
          </div>
        }
      />

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-1 space-y-6">
          <div className="card p-6 space-y-2 text-sm">
            <Field label="Amount" value={formatCurrency(deal.amount)} />
            <Field label="Stage" value={<DealStageBadge stage={deal.stage} />} />
            <Field label="Close date" value={formatDate(deal.closeDate)} />
            <Field label="Contact" value={deal.contact ? <Link href={`/contacts/${deal.contact.id}`} className="text-brand-600 hover:underline">{deal.contact.firstName} {deal.contact.lastName}</Link> : "—"} />
            <Field label="Company" value={deal.company ? <Link href={`/companies/${deal.company.id}`} className="text-brand-600 hover:underline">{deal.company.name}</Link> : "—"} />
            <Field label="Owner" value={deal.owner?.name ?? "—"} />
            <Field label="Notes" value={deal.notes ?? "—"} />
          </div>
        </div>
        <div className="col-span-2 space-y-6">
          <div className="card p-6">
            <h3 className="font-semibold mb-3">Log activity</h3>
            <ActivityForm dealId={deal.id} />
          </div>
          <div className="card p-6">
            <h3 className="font-semibold mb-3">Activity timeline</h3>
            <ActivityList activities={deal.activities} />
          </div>
        </div>
      </div>
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
