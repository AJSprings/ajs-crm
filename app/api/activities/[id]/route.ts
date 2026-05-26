import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  await requireUser();
  await prisma.activity.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  await requireUser();
  const body = await req.json();
  const data: Record<string, unknown> = {};
  if (typeof body.doneAt !== "undefined") data.doneAt = body.doneAt ? new Date(body.doneAt) : null;
  if (typeof body.subject === "string") data.subject = body.subject;
  if (typeof body.body === "string") data.body = body.body;
  const updated = await prisma.activity.update({ where: { id: params.id }, data });
  return NextResponse.json(updated);
}
