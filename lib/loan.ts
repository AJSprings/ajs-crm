import type { LoanActivity } from "@prisma/client";

export type LoanBalance = {
  disbursed: number;
  paid: number;
  fees: number;
  interestAccrued: number;
  outstanding: number;
};

export function computeLoanBalance(activities: LoanActivity[]): LoanBalance {
  let disbursed = 0;
  let paid = 0;
  let fees = 0;
  let interestAccrued = 0;
  for (const a of activities) {
    if (a.type === "DISBURSEMENT") disbursed += a.amount;
    else if (a.type === "PAYMENT") paid += a.amount;
    else if (a.type === "FEE") fees += a.amount;
    else if (a.type === "INTEREST_ACCRUAL") interestAccrued += a.amount;
  }
  const outstanding = disbursed + fees + interestAccrued - paid;
  return { disbursed, paid, fees, interestAccrued, outstanding };
}

// Simple amortized monthly payment formula
export function monthlyPayment(principal: number, annualRatePct: number, termMonths: number) {
  if (termMonths <= 0) return 0;
  const r = annualRatePct / 100 / 12;
  if (r === 0) return principal / termMonths;
  return (principal * r) / (1 - Math.pow(1 + r, -termMonths));
}

export type AmortizationRow = {
  monthNumber: number;
  dueDate: Date | null;
  payment: number;
  interest: number;
  principal: number;
  balance: number;
};

export function amortizationSchedule(
  principal: number,
  annualRatePct: number,
  termMonths: number,
  startDate: Date | null
): AmortizationRow[] {
  if (principal <= 0 || termMonths <= 0) return [];
  const r = annualRatePct / 100 / 12;
  const payment = monthlyPayment(principal, annualRatePct, termMonths);
  const rows: AmortizationRow[] = [];
  let balance = principal;
  for (let i = 1; i <= termMonths; i++) {
    const interest = balance * r;
    let principalPart = payment - interest;
    // last row absorbs any rounding so balance ends at 0
    if (i === termMonths) principalPart = balance;
    balance = Math.max(0, balance - principalPart);
    let dueDate: Date | null = null;
    if (startDate) {
      const d = new Date(startDate);
      d.setMonth(d.getMonth() + i);
      dueDate = d;
    }
    rows.push({
      monthNumber: i,
      dueDate,
      payment: i === termMonths ? principalPart + interest : payment,
      interest,
      principal: principalPart,
      balance,
    });
  }
  return rows;
}
