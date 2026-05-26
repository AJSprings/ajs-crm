import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { LOAN_ACTIVITY_TYPES } from "@/lib/constants";

const schema = z.object({
  type: z.enum(LOAN_ACTIVITY_TYPES),
  amount: z.coerce.number().default(0),
  occurredAt: z.string().optional().or(z.literal("")),
  note: z.string().optional(),
});

export async function POST(req: Request, { params }: { params: { id: string } }) {
  await requireUser();
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const { occurredAt, ...rest } = parsed.data;
  const activity = await prisma.loanActivity.create({
    data: {
      ...rest,
      loanId: params.id,
      occurredAt: occurredAt ? new Date(occurredAt) : new Date(),
    },
  });
  // Auto-advance status on first disbursement
  if (parsed.data.type === "DISBURSEMENT") {
    const loan = await prisma.loan.findUnique({ where: { id: params.id } });
    if (loan && (loan.status === "APPROVED" || loan.status === "APPLICATION" || loan.status === "UNDERWRITING")) {
      await prisma.loan.update({ where: { id: params.id }, data: { status: "DISBURSED" } });
      await prisma.loanActivity.create({
        data: {
          loanId: params.id,
          type: "STATUS_CHANGE",
          fromStatus: loan.status,
          toStatus: "DISBURSED",
          note: "Auto-advanced after disbursement",
        },
      });
    }
  }
  if (parsed.data.type === "PAYMENT") {
    const loan = await prisma.loan.findUnique({ where: { id: params.id } });
    if (loan && loan.status === "DISBURSED") {
      await prisma.loan.update({ where: { id: params.id }, data: { status: "REPAYING" } });
      await prisma.loanActivity.create({
        data: {
          loanId: params.id,
          type: "STATUS_CHANGE",
          fromStatus: loan.status,
          toStatus: "REPAYING",
          note: "Auto-advanced after first payment",
        },
      });
    }
  }
  return NextResponse.json(activity, { status: 201 });
}
