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

  // Resolve companies by name (case-insensitive); auto-create if missing
  const companyNames = Array.from(
    new Set(rows.map((r) => (r.company || "").trim()).filter(Boolean))
  );
  const existing = await prisma.company.findMany({
    where: { name: { in: companyNames } },
  });
  const companyMap = new Map(existing.map((c) => [c.name.toLowerCase(), c.id]));
  for (const n of companyNames) {
    if (!companyMap.has(n.toLowerCase())) {
      const c = await prisma.company.create({ data: { name: n, ownerId: user.id } });
      companyMap.set(n.toLowerCase(), c.id);
    }
  }

  let created = 0;
  const errors: { row: number; error: string }[] = [];
  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    const firstName = (r.firstName || r["first name"] || "").trim();
    const lastName = (r.lastName || r["last name"] || "").trim();
    if (!firstName || !lastName) {
      errors.push({ row: i + 2, error: "firstName and lastName required" });
      continue;
    }
    try {
      await prisma.contact.create({
        data: {
          firstName,
          lastName,
          email: r.email || null,
          phone: r.phone || null,
          title: r.title || null,
          notes: r.notes || null,
          companyId: r.company ? companyMap.get(r.company.toLowerCase()) ?? null : null,
          ownerId: user.id,
        },
      });
      created++;
    } catch (e: unknown) {
      errors.push({ row: i + 2, error: e instanceof Error ? e.message : "Unknown error" });
    }
  }

  return NextResponse.json({ created, errors });
}
