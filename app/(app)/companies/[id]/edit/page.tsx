import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/page-header";
import { CompanyForm } from "../../company-form";

export default async function EditCompanyPage({ params }: { params: { id: string } }) {
  const company = await prisma.company.findUnique({ where: { id: params.id } });
  if (!company) notFound();
  return (
    <div>
      <PageHeader title={`Edit ${company.name}`} />
      <div className="max-w-2xl">
        <CompanyForm company={company} />
      </div>
    </div>
  );
}
