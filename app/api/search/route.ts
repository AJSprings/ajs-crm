import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

export async function GET(req: Request) {
  await requireUser();
  const url = new URL(req.url);
  const q = (url.searchParams.get("q") ?? "").trim();
  if (q.length < 1) {
    return NextResponse.json({ contacts: [], companies: [], deals: [], loans: [] });
  }

  const [contacts, companies, deals, loans] = await Promise.all([
    prisma.contact.findMany({
      where: {
        OR: [
          { firstName: { contains: q } },
          { lastName: { contains: q } },
          { email: { contains: q } },
        ],
      },
      take: 6,
      orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
      select: { id: true, firstName: true, lastName: true, email: true },
    }),
    prisma.company.findMany({
      where: { name: { contains: q } },
      take: 6,
      orderBy: { name: "asc" },
      select: { id: true, name: true, industry: true },
    }),
    prisma.deal.findMany({
      where: { title: { contains: q } },
      take: 6,
      orderBy: { updatedAt: "desc" },
      select: { id: true, title: true, stage: true, amount: true },
    }),
    prisma.loan.findMany({
      where: {
        OR: [
          { reference: { contains: q } },
          { borrower: { firstName: { contains: q } } },
          { borrower: { lastName: { contains: q } } },
        ],
      },
      take: 6,
      orderBy: { createdAt: "desc" },
      include: { borrower: { select: { firstName: true, lastName: true } } },
    }),
  ]);

  return NextResponse.json({
    contacts,
    companies,
    deals,
    loans: loans.map((l) => ({
      id: l.id,
      reference: l.reference,
      status: l.status,
      borrower: `${l.borrower.firstName} ${l.borrower.lastName}`,
    })),
  });
}
