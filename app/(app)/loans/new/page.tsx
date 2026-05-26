import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/page-header";
import { LoanForm } from "../loan-form";

export default async function NewLoanPage({ searchParams }: { searchParams: { borrowerId?: string } }) {
  const [contacts, companies] = await Promise.all([
    prisma.contact.findMany({ include: { company: true }, orderBy: [{ lastName: "asc" }, { firstName: "asc" }] }),
    prisma.company.findMany({ orderBy: { name: "asc" } }),
  ]);
  return (
    <div>
      <PageHeader title="New loan" description="Originate a new loan and track repayments." />
      <div className="max-w-2xl">
        <LoanForm contacts={contacts} companies={companies} defaultBorrowerId={searchParams.borrowerId} />
      </div>
    </div>
  );
}
