export const ROLES = ["ADMIN", "SALES_REP", "LOAN_OFFICER"] as const;
export type Role = (typeof ROLES)[number];

export const DEAL_STAGES = [
  "LEAD",
  "QUALIFIED",
  "PROPOSAL",
  "NEGOTIATION",
  "WON",
  "LOST",
] as const;
export type DealStage = (typeof DEAL_STAGES)[number];

export const DEAL_STAGE_LABELS: Record<DealStage, string> = {
  LEAD: "Lead",
  QUALIFIED: "Qualified",
  PROPOSAL: "Proposal",
  NEGOTIATION: "Negotiation",
  WON: "Won",
  LOST: "Lost",
};

export const LOAN_STATUSES = [
  "APPLICATION",
  "UNDERWRITING",
  "APPROVED",
  "DISBURSED",
  "REPAYING",
  "CLOSED",
  "DEFAULTED",
  "REJECTED",
] as const;
export type LoanStatus = (typeof LOAN_STATUSES)[number];

export const LOAN_STATUS_LABELS: Record<LoanStatus, string> = {
  APPLICATION: "Application",
  UNDERWRITING: "Underwriting",
  APPROVED: "Approved",
  DISBURSED: "Disbursed",
  REPAYING: "Repaying",
  CLOSED: "Closed",
  DEFAULTED: "Defaulted",
  REJECTED: "Rejected",
};

export const LOAN_ACTIVITY_TYPES = [
  "DISBURSEMENT",
  "PAYMENT",
  "FEE",
  "INTEREST_ACCRUAL",
  "STATUS_CHANGE",
  "NOTE",
] as const;
export type LoanActivityType = (typeof LOAN_ACTIVITY_TYPES)[number];

export const ACTIVITY_TYPES = ["CALL", "EMAIL", "MEETING", "NOTE", "TASK"] as const;
export type ActivityType = (typeof ACTIVITY_TYPES)[number];
