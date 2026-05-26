import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

const schema = z.object({
  name: z.string().min(1),
  industry: z.string().optional(),
  website: z.string().optional(),
  phone: z.string().optional(),
  notes: z.string().optional(),
});

export async function GET() {
  await requireUser();
  const companies = await prisma.company.findMany({
    include: { _count: { select: { contacts: true, deals: true, loans: true } } },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(companies);
}

export async function POST(req: Request) {
  const user = await requireUser();
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const company = await prisma.company.create({
    data: { ...parsed.data, ownerId: user.id },
  });
  return NextResponse.json(company, { status: 201 });
}
