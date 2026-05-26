import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { toCsv, csvResponse } from "@/lib/csv";
import { computeLoanBalance } from "@/lib/loan";

export async function GET() {
  await requireUser();
  const loans = await prisma.loan.findMany({
    include: { borrower: true, company: true, officer: true, loanActivities: true },
    orderBy: { createdAt: "desc" },
  });
  const csv = toCsv(
    [
      "reference",
      "borrower",
      "company",
      "principal",
      "interestRate",
      "termMonths",
      "status",
      "outstanding",
      "disbursed",
      "paid",
      "startDate",
      "officer",
      "purpose",
      "createdAt",
    ],
    loans.map((l) => {
      const b = computeLoanBalance(l.loanActivities);
      return [
        l.reference,
        `${l.borrower.firstName} ${l.borrower.lastName}`,
        l.company?.name ?? "",
        l.principal,
        l.interestRate,
        l.termMonths,
        l.status,
        b.outstanding,
        b.disbursed,
        b.paid,
        l.startDate ?? "",
        l.officer?.name ?? "",
        l.purpose ?? "",
        l.createdAt,
      ];
    })
  );
  return csvResponse("loans.csv", csv);
}
