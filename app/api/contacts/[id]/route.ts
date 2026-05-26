import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdminApi, requireUser } from "@/lib/session";

const schema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  title: z.string().optional(),
  notes: z.string().optional(),
  companyId: z.string().optional().or(z.literal("")),
});

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  await requireUser();
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const { companyId, email, ...rest } = parsed.data;
  const updated = await prisma.contact.update({
    where: { id: params.id },
    data: {
      ...rest,
      ...(email !== undefined ? { email: email || null } : {}),
      ...(companyId !== undefined ? { companyId: companyId || null } : {}),
    },
  });
  return NextResponse.json(updated);
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const denied = await requireAdminApi();
  if (denied) return denied;
  await prisma.contact.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
