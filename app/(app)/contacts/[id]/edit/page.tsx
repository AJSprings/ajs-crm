import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/page-header";
import { ContactForm } from "../../contact-form";

export default async function EditContactPage({ params }: { params: { id: string } }) {
  const [contact, companies] = await Promise.all([
    prisma.contact.findUnique({ where: { id: params.id } }),
    prisma.company.findMany({ orderBy: { name: "asc" } }),
  ]);
  if (!contact) notFound();
  return (
    <div>
      <PageHeader title={`Edit ${contact.firstName} ${contact.lastName}`} />
      <div className="max-w-2xl">
        <ContactForm contact={contact} companies={companies} />
      </div>
    </div>
  );
}
