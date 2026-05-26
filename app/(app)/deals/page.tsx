import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/page-header";
import { Kanban } from "./kanban";

export const dynamic = "force-dynamic";

export default async function DealsPage() {
  const deals = await prisma.deal.findMany({
    include: { contact: true, company: true },
    orderBy: { updatedAt: "desc" },
  });
  return (
    <div className="h-full flex flex-col">
      <PageHeader
        title="Pipeline"
        description="Drag deals between stages."
        action={
          <div className="flex gap-2">
            <a href="/api/deals/export" download className="btn-secondary">⬇ Export</a>
            <Link href="/deals/new" className="btn-primary">+ New deal</Link>
          </div>
        }
      />
      <Kanban deals={deals} />
    </div>
  );
}
