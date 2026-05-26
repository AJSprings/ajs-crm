import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/page-header";
import { ContactForm } from "../contact-form";

export default async function NewContactPage() {
  const companies = await prisma.company.findMany({ orderBy: { name: "asc" } });
  return (
    <div>
      <PageHeader title="New contact" />
      <div className="max-w-2xl">
        <ContactForm companies={companies} />
      </div>
    </div>
  );
}
