import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { toCsv, csvResponse } from "@/lib/csv";

export async function GET() {
  await requireUser();
  const deals = await prisma.deal.findMany({
    include: { contact: true, company: true, owner: true },
    orderBy: { updatedAt: "desc" },
  });
  const csv = toCsv(
    ["title", "amount", "stage", "contact", "company", "owner", "closeDate", "notes", "createdAt"],
    deals.map((d) => [
      d.title,
      d.amount,
      d.stage,
      d.contact ? `${d.contact.firstName} ${d.contact.lastName}` : "",
      d.company?.name ?? "",
      d.owner?.name ?? "",
      d.closeDate ?? "",
      d.notes ?? "",
      d.createdAt,
    ])
  );
  return csvResponse("deals.csv", csv);
}
