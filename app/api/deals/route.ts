import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { DEAL_STAGES } from "@/lib/constants";

const schema = z.object({
  title: z.string().min(1),
  amount: z.coerce.number().nonnegative().default(0),
  stage: z.enum(DEAL_STAGES).default("LEAD"),
  closeDate: z.string().optional().or(z.literal("")),
  notes: z.string().optional(),
  contactId: z.string().optional().or(z.literal("")),
  companyId: z.string().optional().or(z.literal("")),
});

export async function GET() {
  await requireUser();
  const deals = await prisma.deal.findMany({
    include: { contact: true, company: true },
    orderBy: { updatedAt: "desc" },
  });
  return NextResponse.json(deals);
}

export async function POST(req: Request) {
  const user = await requireUser();
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const { closeDate, contactId, companyId, ...rest } = parsed.data;
  const deal = await prisma.deal.create({
    data: {
      ...rest,
      closeDate: closeDate ? new Date(closeDate) : null,
      contactId: contactId || null,
      companyId: companyId || null,
      ownerId: user.id,
    },
  });
  return NextResponse.json(deal, { status: 201 });
}
