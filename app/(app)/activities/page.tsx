import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/page-header";
import { ActivityList } from "@/components/activity-list";

export const dynamic = "force-dynamic";

export default async function ActivitiesPage() {
  const [openTasks, recent] = await Promise.all([
    prisma.activity.findMany({
      where: { type: "TASK", doneAt: null },
      orderBy: [{ dueAt: "asc" }, { createdAt: "desc" }],
      include: { author: true, contact: true, deal: true, loan: true, company: true },
      take: 50,
    }),
    prisma.activity.findMany({
      where: { NOT: { type: "TASK", doneAt: null } },
      orderBy: { createdAt: "desc" },
      include: { author: true, contact: true, deal: true, loan: true, company: true },
      take: 100,
    }),
  ]);

  return (
    <div>
      <PageHeader title="Activities" description="All calls, emails, meetings, notes, and tasks." />
      <div className="grid grid-cols-2 gap-6">
        <div className="card p-6">
          <h2 className="font-semibold mb-3">Open tasks ({openTasks.length})</h2>
          <ActivityList activities={openTasks} />
          <ContextLinks activities={openTasks} />
        </div>
        <div className="card p-6">
          <h2 className="font-semibold mb-3">Recent activity</h2>
          <ActivityList activities={recent} />
          <ContextLinks activities={recent} />
        </div>
      </div>
    </div>
  );
}

function ContextLinks({ activities }: { activities: any[] }) {
  if (activities.length === 0) return null;
  return (
    <ul className="mt-4 text-xs text-slate-400 space-y-1">
      {activities.slice(0, 0).map((a) => null)}
    </ul>
  );
}
