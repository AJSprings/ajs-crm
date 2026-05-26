import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/page-header";
import { DeleteButton } from "@/components/delete-button";
import { DealStageBadge, LoanStatusBadge } from "@/components/stage-badge";
import { formatCurrency } from "@/lib/format";
import { ActivityList } from "@/components/activity-list";
import { ActivityForm } from "@/components/activity-form";

export const dynamic = "force-dynamic";

export default async function CompanyDetail({ params }: { params: { id: string } }) {
  const company = await prisma.company.findUnique({
    where: { id: params.id },
    include: {
      contacts: { orderBy: [{ lastName: "asc" }, { firstName: "asc" }] },
      deals: { orderBy: { updatedAt: "desc" } },
      loans: { orderBy: { updatedAt: "desc" } },
      activities: { orderBy: { createdAt: "desc" }, include: { author: true } },
    },
  });
  if (!company) notFound();

  return (
    <div>
      <PageHeader
        title={company.name}
        description={company.industry ?? undefined}
        action={
          <div className="flex gap-2">
            <Link href={`/companies/${company.id}/edit`} className="btn-secondary">Edit</Link>
            <DeleteButton url={`/api/companies/${company.id}`} redirectTo="/companies" />
          </div>
        }
      />

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-1 space-y-6">
          <div className="card p-6 space-y-2 text-sm">
            <Field label="Industry" value={company.industry ?? "—"} />
            <Field label="Phone" value={company.phone ?? "—"} />
            <Field label="Website" value={company.website ? <a href={company.website} target="_blank" rel="noreferrer" className="text-brand-600 hover:underline">{company.website}</a> : "—"} />
            <Field label="Notes" value={company.notes ?? "—"} />
          </div>

          <div className="card p-6">
            <h3 className="font-semibold mb-3">Contacts ({company.contacts.length})</h3>
            {company.contacts.length === 0 ? (
              <p className="text-sm text-slate-500">No contacts.</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {company.contacts.map((c) => (
                  <li key={c.id}>
                    <Link href={`/contacts/${c.id}`} className="hover:text-brand-600">
                      {c.firstName} {c.lastName}
                    </Link>
                    {c.title && <span className="text-slate-500"> · {c.title}</span>}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="card p-6">
            <h3 className="font-semibold mb-3">Deals & Loans</h3>
            <ul className="space-y-2 text-sm">
              {company.deals.map((d) => (
                <li key={d.id} className="flex items-center justify-between">
                  <Link href={`/deals/${d.id}`} className="hover:text-brand-600">{d.title}</Link>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500">{formatCurrency(d.amount)}</span>
                    <DealStageBadge stage={d.stage} />
                  </div>
                </li>
              ))}
              {company.loans.map((l) => (
                <li key={l.id} className="flex items-center justify-between">
                  <Link href={`/loans/${l.id}`} className="hover:text-brand-600">{l.reference}</Link>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500">{formatCurrency(l.principal)}</span>
                    <LoanStatusBadge status={l.status} />
                  </div>
                </li>
              ))}
              {company.deals.length === 0 && company.loans.length === 0 && (
                <li className="text-slate-500">None.</li>
              )}
            </ul>
          </div>
        </div>

        <div className="col-span-2 space-y-6">
          <div className="card p-6">
            <h3 className="font-semibold mb-3">Log activity</h3>
            <ActivityForm companyId={company.id} />
          </div>
          <div className="card p-6">
            <h3 className="font-semibold mb-3">Activity timeline</h3>
            <ActivityList activities={company.activities} />
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
