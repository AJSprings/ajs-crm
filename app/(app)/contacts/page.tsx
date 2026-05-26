import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { initials } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function ContactsPage() {
  const contacts = await prisma.contact.findMany({
    include: { company: true },
    orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
  });

  return (
    <div>
      <PageHeader
        title="Contacts"
        description={`${contacts.length} total`}
        action={
          <div className="flex gap-2">
            <a href="/api/contacts/export" download className="btn-secondary">⬇ Export</a>
            <Link href="/contacts/new" className="btn-primary">+ New contact</Link>
          </div>
        }
      />
      {contacts.length === 0 ? (
        <EmptyState
          title="No contacts yet"
          description="Add your first contact to get started."
          action={<Link href="/contacts/new" className="btn-primary">Add contact</Link>}
        />
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Company</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Phone</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {contacts.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <Link href={`/contacts/${c.id}`} className="flex items-center gap-3 group">
                      <span className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-xs font-semibold">
                        {initials(c.firstName, c.lastName)}
                      </span>
                      <span className="font-medium text-slate-900 group-hover:text-brand-600">
                        {c.firstName} {c.lastName}
                      </span>
                      {c.title && <span className="text-slate-500">· {c.title}</span>}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {c.company ? (
                      <Link href={`/companies/${c.company.id}`} className="hover:text-brand-600">
                        {c.company.name}
                      </Link>
                    ) : "—"}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{c.email ?? "—"}</td>
                  <td className="px-4 py-3 text-slate-600">{c.phone ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
