import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdminApi, requireUser } from "@/lib/session";
import { LOAN_STATUSES } from "@/lib/constants";

const schema = z.object({
  principal: z.coerce.number().positive().optional(),
  interestRate: z.coerce.number().nonnegative().optional(),
  termMonths: z.coerce.number().int().positive().optional(),
  startDate: z.string().optional().or(z.literal("")),
  status: z.enum(LOAN_STATUSES).optional(),
  purpose: z.string().optional(),
  notes: z.string().optional(),
  borrowerId: z.string().optional(),
  companyId: z.string().optional().or(z.literal("")),
});

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  await requireUser();
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const { startDate, companyId, status, ...rest } = parsed.data;

  // If status is changing, write a LoanActivity row
  const existing = await prisma.loan.findUnique({ where: { id: params.id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const data: Record<string, unknown> = { ...rest };
  if (startDate !== undefined) data.startDate = startDate ? new Date(startDate) : null;
  if (companyId !== undefined) data.companyId = companyId || null;
  if (status && status !== existing.status) {
    data.status = status;
    await prisma.loanActivity.create({
      data: {
        loanId: params.id,
        type: "STATUS_CHANGE",
        fromStatus: existing.status,
        toStatus: status,
        note: `Status changed from ${existing.status} to ${status}`,
      },
    });
  }

  const loan = await prisma.loan.update({ where: { id: params.id }, data });
  return NextResponse.json(loan);
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const denied = await requireAdminApi();
  if (denied) return denied;
  await prisma.loan.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
