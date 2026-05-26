import { prisma } from "@/lib/prisma";
import { requireAdminPage } from "@/lib/session";
import { PageHeader } from "@/components/page-header";
import { UsersTable } from "./users-table";

export const dynamic = "force-dynamic";

export default async function UsersPage() {
  const me = await requireAdminPage();
  const users = await prisma.user.findMany({
    select: { id: true, email: true, name: true, role: true, createdAt: true },
    orderBy: { createdAt: "asc" },
  });
  return (
    <div>
      <PageHeader title="Users" description="Manage team members and roles. Admin only." />
      <UsersTable users={users} currentUserId={me.id} />
    </div>
  );
}
