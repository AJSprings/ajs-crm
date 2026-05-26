import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/page-header";
import { DealForm } from "../deal-form";

export default async function NewDealPage({ searchParams }: { searchParams: { contactId?: string } }) {
  const [contacts, companies] = await Promise.all([
    prisma.contact.findMany({ include: { company: true }, orderBy: [{ lastName: "asc" }, { firstName: "asc" }] }),
    prisma.company.findMany({ orderBy: { name: "asc" } }),
  ]);
  return (
    <div>
      <PageHeader title="New deal" />
      <div className="max-w-2xl">
        <DealForm contacts={contacts} companies={companies} defaultContactId={searchParams.contactId} />
      </div>
    </div>
  );
}
