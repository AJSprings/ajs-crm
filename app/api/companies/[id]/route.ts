import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdminApi, requireUser } from "@/lib/session";

const schema = z.object({
  name: z.string().min(1).optional(),
  industry: z.string().optional(),
  website: z.string().optional(),
  phone: z.string().optional(),
  notes: z.string().optional(),
});

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  await requireUser();
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const company = await prisma.company.update({ where: { id: params.id }, data: parsed.data });
  return NextResponse.json(company);
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const denied = await requireAdminApi();
  if (denied) return denied;
  await prisma.company.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
