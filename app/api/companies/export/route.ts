import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { toCsv, csvResponse } from "@/lib/csv";

export async function GET() {
  await requireUser();
  const companies = await prisma.company.findMany({
    include: { _count: { select: { contacts: true, deals: true, loans: true } } },
    orderBy: { name: "asc" },
  });
  const csv = toCsv(
    ["name", "industry", "website", "phone", "notes", "contacts", "deals", "loans", "createdAt"],
    companies.map((c) => [
      c.name,
      c.industry ?? "",
      c.website ?? "",
      c.phone ?? "",
      c.notes ?? "",
      c._count.contacts,
      c._count.deals,
      c._count.loans,
      c.createdAt,
    ])
  );
  return csvResponse("companies.csv", csv);
}
