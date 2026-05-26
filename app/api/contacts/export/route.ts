import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { toCsv, csvResponse } from "@/lib/csv";

export async function GET() {
  await requireUser();
  const contacts = await prisma.contact.findMany({
    include: { company: true },
    orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
  });
  const csv = toCsv(
    ["firstName", "lastName", "email", "phone", "title", "company", "notes", "createdAt"],
    contacts.map((c) => [
      c.firstName,
      c.lastName,
      c.email ?? "",
      c.phone ?? "",
      c.title ?? "",
      c.company?.name ?? "",
      c.notes ?? "",
      c.createdAt,
    ])
  );
  return csvResponse("contacts.csv", csv);
}
