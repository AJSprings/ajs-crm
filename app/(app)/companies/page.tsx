import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";

export const dynamic = "force-dynamic";

export default async function CompaniesPage() {
  const companies = await prisma.company.findMany({
    include: { _count: { select: { contacts: true, deals: true, loans: true } } },
    orderBy: { name: "asc" },
  });
  return (
    <div>
      <PageHeader
        title="Companies"
        description={`${companies.length} total`}
        action={
          <div className="flex gap-2">
            <a href="/api/companies/export" download className="btn-secondary">⬇ Export</a>
            <Link href="/companies/new" className="btn-primary">+ New company</Link>
          </div>
        }
      />
      {companies.length === 0 ? (
        <EmptyState
          title="No companies yet"
          action={<Link href="/companies/new" className="btn-primary">Add company</Link>}
        />
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Industry</th>
                <th className="px-4 py-3 text-right">Contacts</th>
                <th className="px-4 py-3 text-right">Deals</th>
                <th className="px-4 py-3 text-right">Loans</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {companies.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <Link href={`/companies/${c.id}`} className="font-medium text-slate-900 hover:text-brand-600">{c.name}</Link>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{c.industry ?? "—"}</td>
                  <td className="px-4 py-3 text-right text-slate-600">{c._count.contacts}</td>
                  <td className="px-4 py-3 text-right text-slate-600">{c._count.deals}</td>
                  <td className="px-4 py-3 text-right text-slate-600">{c._count.loans}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
