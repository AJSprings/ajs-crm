import clsx from "clsx";
import { DEAL_STAGE_LABELS, LOAN_STATUS_LABELS, type DealStage, type LoanStatus } from "@/lib/constants";

const dealColor: Record<DealStage, string> = {
  LEAD: "bg-slate-100 text-slate-700",
  QUALIFIED: "bg-blue-100 text-blue-700",
  PROPOSAL: "bg-indigo-100 text-indigo-700",
  NEGOTIATION: "bg-amber-100 text-amber-700",
  WON: "bg-emerald-100 text-emerald-700",
  LOST: "bg-rose-100 text-rose-700",
};

const loanColor: Record<LoanStatus, string> = {
  APPLICATION: "bg-slate-100 text-slate-700",
  UNDERWRITING: "bg-blue-100 text-blue-700",
  APPROVED: "bg-indigo-100 text-indigo-700",
  DISBURSED: "bg-violet-100 text-violet-700",
  REPAYING: "bg-emerald-100 text-emerald-700",
  CLOSED: "bg-slate-200 text-slate-700",
  DEFAULTED: "bg-rose-100 text-rose-700",
  REJECTED: "bg-rose-100 text-rose-700",
};

export function DealStageBadge({ stage }: { stage: string }) {
  const s = stage as DealStage;
  return <span className={clsx("badge", dealColor[s] ?? "bg-slate-100 text-slate-700")}>{DEAL_STAGE_LABELS[s] ?? stage}</span>;
}

export function LoanStatusBadge({ status }: { status: string }) {
  const s = status as LoanStatus;
  return <span className={clsx("badge", loanColor[s] ?? "bg-slate-100 text-slate-700")}>{LOAN_STATUS_LABELS[s] ?? status}</span>;
}
