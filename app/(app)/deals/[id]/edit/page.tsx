import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/page-header";
import { DealForm } from "../../deal-form";

export default async function EditDealPage({ params }: { params: { id: string } }) {
  const [deal, contacts, companies] = await Promise.all([
    prisma.deal.findUnique({ where: { id: params.id } }),
    prisma.contact.findMany({ include: { company: true }, orderBy: [{ lastName: "asc" }, { firstName: "asc" }] }),
    prisma.company.findMany({ orderBy: { name: "asc" } }),
  ]);
  if (!deal) notFound();
  return (
    <div>
      <PageHeader title={`Edit ${deal.title}`} />
      <div className="max-w-2xl">
        <DealForm deal={deal} contacts={contacts} companies={companies} />
      </div>
    </div>
  );
}
