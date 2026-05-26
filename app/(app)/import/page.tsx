import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { ImportCard } from "./import-card";

export default function ImportPage() {
  return (
    <div>
      <PageHeader
        title="Import / Export"
        description="Bring data in via CSV or download a snapshot."
      />

      <div className="grid grid-cols-2 gap-6 mb-8">
        <ImportCard
          title="Import contacts"
          description="Headers: firstName, lastName, email, phone, title, company, notes. Unknown companies are created automatically."
          endpoint="/api/contacts/import"
        />
        <ImportCard
          title="Import companies"
          description="Headers: name, industry, website, phone, notes. Duplicates by name are skipped."
          endpoint="/api/companies/import"
        />
      </div>

      <div className="card p-6">
        <h2 className="font-semibold mb-3">Export</h2>
        <p className="text-sm text-slate-500 mb-4">Download a CSV snapshot of any module.</p>
        <div className="flex flex-wrap gap-3">
          <ExportLink href="/api/contacts/export" label="Contacts" />
          <ExportLink href="/api/companies/export" label="Companies" />
          <ExportLink href="/api/deals/export" label="Deals" />
          <ExportLink href="/api/loans/export" label="Loans" />
        </div>
      </div>
    </div>
  );
}

function ExportLink({ href, label }: { href: string; label: string }) {
  return (
    <a href={href} className="btn-secondary" download>
      ⬇ {label}.csv
    </a>
  );
}
