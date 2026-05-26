import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/page-header";
import { DeleteButton } from "@/components/delete-button";
import { DealStageBadge, LoanStatusBadge } from "@/components/stage-badge";
import { formatCurrency, formatDate, initials } from "@/lib/format";
import { ActivityList } from "@/components/activity-list";
import { ActivityForm } from "@/components/activity-form";

export const dynamic = "force-dynamic";

export default async function ContactDetail({ params }: { params: { id: string } }) {
  const contact = await prisma.contact.findUnique({
    where: { id: params.id },
    include: {
      company: true,
      deals: { orderBy: { updatedAt: "desc" } },
      loans: { orderBy: { updatedAt: "desc" } },
      activities: { orderBy: { createdAt: "desc" }, include: { author: true } },
    },
  });
  if (!contact) notFound();

  return (
    <div>
      <PageHeader
        title={`${contact.firstName} ${contact.lastName}`}
        description={contact.title ?? undefined}
        action={
          <div className="flex gap-2">
            <Link href={`/contacts/${contact.id}/edit`} className="btn-secondary">Edit</Link>
            <DeleteButton url={`/api/contacts/${contact.id}`} redirectTo="/contacts" />
          </div>
        }
      />

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-1 space-y-6">
          <div className="card p-6">
            <div className="flex items-center gap-3 mb-4">
              <span className="w-12 h-12 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-semibold">
                {initials(contact.firstName, contact.lastName)}
              </span>
              <div>
                <div className="font-semibold">{contact.firstName} {contact.lastName}</div>
                <div className="text-sm text-slate-500">{contact.title ?? "—"}</div>
              </div>
            </div>
            <dl className="space-y-2 text-sm">
              <Field label="Email" value={contact.email} />
              <Field label="Phone" value={contact.phone} />
              <Field label="Company" value={contact.company ? <Link href={`/companies/${contact.company.id}`} className="text-brand-600 hover:underline">{contact.company.name}</Link> : "—"} />
              <Field label="Notes" value={contact.notes ?? "—"} />
            </dl>
          </div>

          <div className="card p-6">
            <h3 className="font-semibold mb-3">Deals ({contact.deals.length})</h3>
            {contact.deals.length === 0 ? (
              <p className="text-sm text-slate-500">No deals.</p>
            ) : (
              <ul className="space-y-2">
                {contact.deals.map((d) => (
                  <li key={d.id} className="flex items-center justify-between text-sm">
                    <Link href={`/deals/${d.id}`} className="hover:text-brand-600">{d.title}</Link>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500">{formatCurrency(d.amount)}</span>
                      <DealStageBadge stage={d.stage} />
                    </div>
                  </li>
                ))}
              </ul>
            )}
            <Link href={`/deals/new?contactId=${contact.id}`} className="btn-secondary mt-4 w-full">+ New deal</Link>
          </div>

          <div className="card p-6">
            <h3 className="font-semibold mb-3">Loans ({contact.loans.length})</h3>
            {contact.loans.length === 0 ? (
              <p className="text-sm text-slate-500">No loans.</p>
            ) : (
              <ul className="space-y-2">
                {contact.loans.map((l) => (
                  <li key={l.id} className="flex items-center justify-between text-sm">
                    <Link href={`/loans/${l.id}`} className="hover:text-brand-600">{l.reference}</Link>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500">{formatCurrency(l.principal)}</span>
                      <LoanStatusBadge status={l.status} />
                    </div>
                  </li>
                ))}
              </ul>
            )}
            <Link href={`/loans/new?borrowerId=${contact.id}`} className="btn-secondary mt-4 w-full">+ New loan</Link>
          </div>
        </div>

        <div className="col-span-2 space-y-6">
          <div className="card p-6">
            <h3 className="font-semibold mb-3">Log activity</h3>
            <ActivityForm contactId={contact.id} />
          </div>
          <div className="card p-6">
            <h3 className="font-semibold mb-3">Activity timeline</h3>
            <ActivityList activities={contact.activities} />
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
      <dd className="mt-0.5 text-slate-900">{value || "—"}</dd>
    </div>
  );
}
