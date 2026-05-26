import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { ACTIVITY_TYPES } from "@/lib/constants";

const schema = z.object({
  type: z.enum(ACTIVITY_TYPES),
  subject: z.string().min(1),
  body: z.string().optional(),
  dueAt: z.string().optional().or(z.literal("")),
  doneAt: z.string().optional().or(z.literal("")),
  contactId: z.string().optional().or(z.literal("")),
  companyId: z.string().optional().or(z.literal("")),
  dealId: z.string().optional().or(z.literal("")),
  loanId: z.string().optional().or(z.literal("")),
});

export async function GET(req: Request) {
  await requireUser();
  const url = new URL(req.url);
  const where: Record<string, string> = {};
  for (const key of ["contactId", "companyId", "dealId", "loanId"]) {
    const v = url.searchParams.get(key);
    if (v) where[key] = v;
  }
  const activities = await prisma.activity.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: { author: true, contact: true, company: true, deal: true, loan: true },
    take: 200,
  });
  return NextResponse.json(activities);
}

export async function POST(req: Request) {
  const user = await requireUser();
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const { dueAt, doneAt, contactId, companyId, dealId, loanId, ...rest } = parsed.data;
  const activity = await prisma.activity.create({
    data: {
      ...rest,
      dueAt: dueAt ? new Date(dueAt) : null,
      doneAt: doneAt ? new Date(doneAt) : null,
      contactId: contactId || null,
      companyId: companyId || null,
      dealId: dealId || null,
      loanId: loanId || null,
      authorId: user.id,
    },
  });
  return NextResponse.json(activity, { status: 201 });
}
