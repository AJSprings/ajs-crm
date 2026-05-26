import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

export async function DELETE(_req: Request, { params }: { params: { id: string; activityId: string } }) {
  await requireUser();
  await prisma.loanActivity.delete({ where: { id: params.activityId } });
  return NextResponse.json({ ok: true });
}
