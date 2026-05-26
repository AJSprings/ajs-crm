import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { LOAN_STATUSES } from "@/lib/constants";

const schema = z.object({
  principal: z.coerce.number().positive(),
  interestRate: z.coerce.number().nonnegative(),
  termMonths: z.coerce.number().int().positive(),
  startDate: z.string().optional().or(z.literal("")),
  status: z.enum(LOAN_STATUSES).default("APPLICATION"),
  purpose: z.string().optional(),
  notes: z.string().optional(),
  borrowerId: z.string().min(1, "Borrower required"),
  companyId: z.string().optional().or(z.literal("")),
});

async function nextReference() {
  const year = new Date().getFullYear();
  const count = await prisma.loan.count({ where: { reference: { startsWith: `LN-${year}-` } } });
  return `LN-${year}-${String(count + 1).padStart(4, "0")}`;
}

export async function GET() {
  await requireUser();
  const loans = await prisma.loan.findMany({
    include: { borrower: true, company: true, officer: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(loans);
}

export async function POST(req: Request) {
  const user = await requireUser();
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const { startDate, companyId, ...rest } = parsed.data;
  const reference = await nextReference();
  const loan = await prisma.loan.create({
    data: {
      ...rest,
      reference,
      startDate: startDate ? new Date(startDate) : null,
      companyId: companyId || null,
      officerId: user.id,
    },
  });
  return NextResponse.json(loan, { status: 201 });
}
