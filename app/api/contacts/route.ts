import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

const schema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  title: z.string().optional(),
  notes: z.string().optional(),
  companyId: z.string().optional().or(z.literal("")),
});

export async function GET() {
  await requireUser();
  const contacts = await prisma.contact.findMany({
    include: { company: true },
    orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
  });
  return NextResponse.json(contacts);
}

export async function POST(req: Request) {
  const user = await requireUser();
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const { companyId, email, ...rest } = parsed.data;
  const contact = await prisma.contact.create({
    data: {
      ...rest,
      email: email || null,
      companyId: companyId || null,
      ownerId: user.id,
    },
  });
  return NextResponse.json(contact, { status: 201 });
}
