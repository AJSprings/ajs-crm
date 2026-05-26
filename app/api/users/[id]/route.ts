import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdminApi, getUser } from "@/lib/session";
import { ROLES } from "@/lib/constants";

const schema = z.object({
  name: z.string().min(1).optional(),
  role: z.enum(ROLES).optional(),
});

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const denied = await requireAdminApi();
  if (denied) return denied;
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  // Prevent the only admin from demoting themselves
  if (parsed.data.role && parsed.data.role !== "ADMIN") {
    const adminCount = await prisma.user.count({ where: { role: "ADMIN" } });
    const target = await prisma.user.findUnique({ where: { id: params.id } });
    if (target?.role === "ADMIN" && adminCount <= 1) {
      return NextResponse.json({ error: "Cannot demote the last admin" }, { status: 400 });
    }
  }

  const user = await prisma.user.update({
    where: { id: params.id },
    data: parsed.data,
    select: { id: true, email: true, name: true, role: true },
  });
  return NextResponse.json(user);
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const denied = await requireAdminApi();
  if (denied) return denied;
  const me = await getUser();
  if (me?.id === params.id) {
    return NextResponse.json({ error: "Cannot delete your own account" }, { status: 400 });
  }
  // Don't allow deleting the last admin
  const target = await prisma.user.findUnique({ where: { id: params.id } });
  if (target?.role === "ADMIN") {
    const adminCount = await prisma.user.count({ where: { role: "ADMIN" } });
    if (adminCount <= 1) {
      return NextResponse.json({ error: "Cannot delete the last admin" }, { status: 400 });
    }
  }
  await prisma.user.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
