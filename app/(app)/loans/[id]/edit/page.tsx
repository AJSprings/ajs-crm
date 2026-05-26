import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/page-header";
import { LoanForm } from "../../loan-form";

export default async function EditLoanPage({ params }: { params: { id: string } }) {
  const [loan, contacts, companies] = await Promise.all([
    prisma.loan.findUnique({ where: { id: params.id } }),
    prisma.contact.findMany({ include: { company: true }, orderBy: [{ lastName: "asc" }, { firstName: "asc" }] }),
    prisma.company.findMany({ orderBy: { name: "asc" } }),
  ]);
  if (!loan) notFound();
  return (
    <div>
      <PageHeader title={`Edit ${loan.reference}`} />
      <div className="max-w-2xl">
        <LoanForm loan={loan} contacts={contacts} companies={companies} />
      </div>
    </div>
  );
}
