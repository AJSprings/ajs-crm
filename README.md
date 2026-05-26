# AJS Lending CRM

A multi-user CRM with a lending focus: contacts, companies, deal pipeline, activities, **plus** loan origination, status workflow, and a transaction ledger.

## Stack

- **Next.js 14** (App Router, TypeScript)
- **Prisma + SQLite** (swap to Postgres by changing the `datasource` in `prisma/schema.prisma`)
- **NextAuth v4** (credentials + JWT sessions, role-aware)
- **Tailwind CSS**
- **bcryptjs** for password hashing
- **Zod** for input validation

## First run

```powershell
npm install
npm run db:push          # creates prisma/dev.db from schema
npm run db:seed          # demo users + sample data
npm run dev              # http://localhost:3000
```

### Seed accounts

| Email | Password | Role |
| --- | --- | --- |
| `admin@ajs.local` | `password123` | ADMIN |
| `rep@ajs.local` | `password123` | SALES_REP |
| `officer@ajs.local` | `password123` | LOAN_OFFICER |

Or click **Create one** on the login page — the **first registered user is auto-promoted to ADMIN**.

## Modules

| Module | Highlights |
| --- | --- |
| **Contacts** | CRUD, optional company, owner, activity timeline |
| **Companies** | CRUD, contact roster, related deals + loans |
| **Deals / Pipeline** | Drag-and-drop kanban across 6 stages (Lead → Won/Lost), totals per column |
| **Loans** | Originate with principal/rate/term, auto-generated `LN-YYYY-NNNN` reference, status workflow (Application → Underwriting → Approved → Disbursed → Repaying → Closed), estimated monthly payment |
| **Loan Activity (ledger)** | Disbursements, payments, fees, interest accruals, status-change history; running balance (disbursed + fees + interest − paid) shown on detail page |
| **Activities** | Calls, emails, meetings, notes, tasks — attachable to any entity. Tasks with due dates, mark-done |
| **Dashboard** | Counts, open deal value, outstanding principal, recent loans, my open tasks |
| **Amortization schedule** | Month-by-month payment / interest / principal / balance, collapsible on loan detail page |
| **Search** | Global topbar search across contacts / companies / deals / loans, debounced, grouped results |
| **Import / Export** | CSV export for all four modules; CSV import for contacts and companies (auto-creates missing companies) |
| **Users admin** | `/users` page (admin-only) — list users, change roles, delete; protections against demoting/deleting the last admin |

### Role model

- **ADMIN** — full access; can manage users; only role allowed to delete records.
- **SALES_REP** / **LOAN_OFFICER** — full create + edit; cannot delete records or access `/users`. Delete buttons are hidden in the UI.
- API DELETE handlers re-check via `requireAdminApi` so non-admin clients can't bypass with direct HTTP calls.

## Schema notes

- `User.role` is a string enum-style field (`ADMIN | SALES_REP | LOAN_OFFICER`). SQLite has no native enums, so we keep the runtime check in `lib/constants.ts`.
- `Loan` belongs to one `Contact` (the borrower) and optionally a `Company`. Deletion is `Restrict` on borrower to prevent losing loan records.
- `LoanActivity` rows are the source of truth for loan balances — there is no denormalized `outstanding` field, it's computed in `lib/loan.ts#computeLoanBalance`.
- The unified `Activity` table can attach to any of Contact / Company / Deal / Loan via nullable FKs.

## Project structure

```
app/
  (app)/                  # authenticated shell — sidebar + topbar
    page.tsx              # dashboard
    contacts/             # list, new, [id], [id]/edit
    companies/
    deals/                # includes kanban.tsx
    loans/                # includes loan-activity-form/list
    activities/
  api/
    auth/[...nextauth]/
    register/
    contacts/, companies/, deals/, loans/, activities/
  login/, register/
components/                # sidebar, topbar, activity-list, etc.
lib/                       # prisma, auth, constants, format, loan math, session
prisma/
  schema.prisma
  seed.ts
```

## Switching to Postgres

1. Set `DATABASE_URL` to a Postgres connection string.
2. Change `provider = "sqlite"` to `provider = "postgresql"` in `prisma/schema.prisma`.
3. `npx prisma migrate dev --name init`.

## Production checklist

- Set a real `NEXTAUTH_SECRET` (32+ random bytes).
- Set `NEXTAUTH_URL` to the deployed URL.
- Switch the DB provider to Postgres for multi-instance deploys.
- Add backup/retention for the loan ledger.
