import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdminApi, requireUser } from "@/lib/session";
import { DEAL_STAGES } from "@/lib/constants";

const schema = z.object({
  title: z.string().min(1).optional(),
  amount: z.coerce.number().nonnegative().optional(),
  stage: z.enum(DEAL_STAGES).optional(),
  closeDate: z.string().optional().or(z.literal("")),
  notes: z.string().optional(),
  contactId: z.string().optional().or(z.literal("")),
  companyId: z.string().optional().or(z.literal("")),
});

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  await requireUser();
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const { closeDate, contactId, companyId, ...rest } = parsed.data;
  const data: Record<string, unknown> = { ...rest };
  if (closeDate !== undefined) data.closeDate = closeDate ? new Date(closeDate) : null;
  if (contactId !== undefined) data.contactId = contactId || null;
  if (companyId !== undefined) data.companyId = companyId || null;
  const deal = await prisma.deal.update({ where: { id: params.id }, data });
  return NextResponse.json(deal);
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const denied = await requireAdminApi();
  if (denied) return denied;
  await prisma.deal.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
