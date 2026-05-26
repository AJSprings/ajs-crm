import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  const passwordHash = await bcrypt.hash("password123", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@ajs.local" },
    update: {},
    create: {
      email: "admin@ajs.local",
      name: "Admin User",
      passwordHash,
      role: "ADMIN",
    },
  });

  const rep = await prisma.user.upsert({
    where: { email: "rep@ajs.local" },
    update: {},
    create: {
      email: "rep@ajs.local",
      name: "Sam Rep",
      passwordHash,
      role: "SALES_REP",
    },
  });

  const officer = await prisma.user.upsert({
    where: { email: "officer@ajs.local" },
    update: {},
    create: {
      email: "officer@ajs.local",
      name: "Lila Officer",
      passwordHash,
      role: "LOAN_OFFICER",
    },
  });

  // Companies
  const acme = await prisma.company.create({
    data: {
      name: "Acme Logistics",
      industry: "Transportation",
      website: "https://acme.example.com",
      phone: "555-0100",
      ownerId: admin.id,
    },
  });

  const greenbean = await prisma.company.create({
    data: {
      name: "Greenbean Cafe",
      industry: "Food & Beverage",
      website: "https://greenbean.example.com",
      ownerId: rep.id,
    },
  });

  const ironforge = await prisma.company.create({
    data: {
      name: "Ironforge Mfg",
      industry: "Manufacturing",
      ownerId: rep.id,
    },
  });

  // Contacts
  const alice = await prisma.contact.create({
    data: {
      firstName: "Alice",
      lastName: "Nguyen",
      email: "alice@acme.example.com",
      phone: "555-0101",
      title: "CFO",
      companyId: acme.id,
      ownerId: admin.id,
    },
  });

  const bob = await prisma.contact.create({
    data: {
      firstName: "Bob",
      lastName: "Patel",
      email: "bob@greenbean.example.com",
      title: "Owner",
      companyId: greenbean.id,
      ownerId: rep.id,
    },
  });

  const carla = await prisma.contact.create({
    data: {
      firstName: "Carla",
      lastName: "Reyes",
      email: "carla@ironforge.example.com",
      title: "Operations Manager",
      companyId: ironforge.id,
      ownerId: rep.id,
    },
  });

  const dan = await prisma.contact.create({
    data: {
      firstName: "Dan",
      lastName: "Okafor",
      email: "dan@example.com",
      phone: "555-0199",
      title: "Independent",
      ownerId: rep.id,
    },
  });

  // Deals
  await prisma.deal.create({
    data: {
      title: "Acme - Annual contract renewal",
      amount: 48000,
      stage: "NEGOTIATION",
      contactId: alice.id,
      companyId: acme.id,
      ownerId: admin.id,
      closeDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
    },
  });

  await prisma.deal.create({
    data: {
      title: "Greenbean - POS upgrade",
      amount: 12500,
      stage: "PROPOSAL",
      contactId: bob.id,
      companyId: greenbean.id,
      ownerId: rep.id,
    },
  });

  await prisma.deal.create({
    data: {
      title: "Ironforge - SaaS subscription",
      amount: 24000,
      stage: "QUALIFIED",
      contactId: carla.id,
      companyId: ironforge.id,
      ownerId: rep.id,
    },
  });

  await prisma.deal.create({
    data: {
      title: "Dan - Personal consulting",
      amount: 5000,
      stage: "LEAD",
      contactId: dan.id,
      ownerId: rep.id,
    },
  });

  // Loans
  const loan1 = await prisma.loan.create({
    data: {
      reference: "LN-2026-0001",
      principal: 50000,
      interestRate: 7.5,
      termMonths: 36,
      startDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 60),
      status: "REPAYING",
      purpose: "Fleet expansion",
      borrowerId: alice.id,
      companyId: acme.id,
      officerId: officer.id,
    },
  });

  await prisma.loanActivity.createMany({
    data: [
      { loanId: loan1.id, type: "DISBURSEMENT", amount: 50000, note: "Initial disbursement", occurredAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 60) },
      { loanId: loan1.id, type: "FEE", amount: 500, note: "Origination fee", occurredAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 60) },
      { loanId: loan1.id, type: "PAYMENT", amount: 1555.66, note: "Month 1", occurredAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30) },
      { loanId: loan1.id, type: "PAYMENT", amount: 1555.66, note: "Month 2", occurredAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1) },
    ],
  });

  const loan2 = await prisma.loan.create({
    data: {
      reference: "LN-2026-0002",
      principal: 15000,
      interestRate: 9.0,
      termMonths: 24,
      status: "APPROVED",
      purpose: "Equipment purchase",
      borrowerId: bob.id,
      companyId: greenbean.id,
      officerId: officer.id,
    },
  });

  await prisma.loanActivity.create({
    data: {
      loanId: loan2.id,
      type: "STATUS_CHANGE",
      fromStatus: "UNDERWRITING",
      toStatus: "APPROVED",
      note: "Approved by underwriting",
    },
  });

  const loan3 = await prisma.loan.create({
    data: {
      reference: "LN-2026-0003",
      principal: 8000,
      interestRate: 11.5,
      termMonths: 12,
      status: "APPLICATION",
      purpose: "Working capital",
      borrowerId: dan.id,
      officerId: officer.id,
    },
  });

  // Some activities
  await prisma.activity.create({
    data: {
      type: "CALL",
      subject: "Discussed renewal terms",
      body: "Alice asked for 5% volume discount; will follow up Tuesday.",
      contactId: alice.id,
      authorId: admin.id,
    },
  });

  await prisma.activity.create({
    data: {
      type: "TASK",
      subject: "Send POS proposal",
      dueAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3),
      contactId: bob.id,
      authorId: rep.id,
    },
  });

  await prisma.activity.create({
    data: {
      type: "NOTE",
      subject: "Underwriting note",
      body: "Strong DSCR — recommend approval.",
      loanId: loan2.id,
      authorId: officer.id,
    },
  });

  console.log("Done.");
  console.log("Login with: admin@ajs.local / password123");
  console.log("           rep@ajs.local / password123");
  console.log("           officer@ajs.local / password123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
