import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { parseCsv } from "@/lib/csv";

export async function POST(req: Request) {
  const user = await requireUser();
  const text = await req.text();
  if (!text.trim()) return NextResponse.json({ error: "Empty CSV" }, { status: 400 });

  const rows = parseCsv(text);
  if (rows.length === 0) return NextResponse.json({ error: "No rows" }, { status: 400 });

  let created = 0;
  let skipped = 0;
  const errors: { row: number; error: string }[] = [];

  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    const name = (r.name || "").trim();
    if (!name) {
      errors.push({ row: i + 2, error: "name required" });
      continue;
    }
    const dupe = await prisma.company.findFirst({ where: { name } });
    if (dupe) {
      skipped++;
      continue;
    }
    try {
      await prisma.company.create({
        data: {
          name,
          industry: r.industry || null,
          website: r.website || null,
          phone: r.phone || null,
          notes: r.notes || null,
          ownerId: user.id,
        },
      });
      created++;
    } catch (e: unknown) {
      errors.push({ row: i + 2, error: e instanceof Error ? e.message : "Unknown error" });
    }
  }

  return NextResponse.json({ created, skipped, errors });
}
