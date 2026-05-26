"use client";

import { useRouter } from "next/navigation";
import { formatDateTime } from "@/lib/format";
import clsx from "clsx";

type Activity = {
  id: string;
  type: string;
  subject: string;
  body: string | null;
  dueAt: Date | null;
  doneAt: Date | null;
  createdAt: Date;
  author?: { name: string } | null;
};

const typeColor: Record<string, string> = {
  CALL: "bg-blue-100 text-blue-700",
  EMAIL: "bg-violet-100 text-violet-700",
  MEETING: "bg-amber-100 text-amber-700",
  NOTE: "bg-slate-100 text-slate-700",
  TASK: "bg-emerald-100 text-emerald-700",
};

export function ActivityList({ activities }: { activities: Activity[] }) {
  const router = useRouter();

  if (activities.length === 0) {
    return <p className="text-sm text-slate-500">No activity yet.</p>;
  }

  async function toggleDone(a: Activity) {
    await fetch(`/api/activities/${a.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ doneAt: a.doneAt ? null : new Date().toISOString() }),
    });
    router.refresh();
  }

  async function remove(a: Activity) {
    if (!confirm("Delete this activity?")) return;
    await fetch(`/api/activities/${a.id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <ul className="space-y-3">
      {activities.map((a) => (
        <li key={a.id} className="flex gap-3 border-l-2 border-slate-200 pl-3 py-1">
          <div className="flex-1">
            <div className="flex items-center gap-2 text-sm">
              <span className={clsx("badge", typeColor[a.type] ?? "bg-slate-100 text-slate-700")}>{a.type}</span>
              <span className={clsx("font-medium", a.doneAt && "line-through text-slate-400")}>{a.subject}</span>
              {a.dueAt && !a.doneAt && (
                <span className="text-xs text-amber-700">Due {formatDateTime(a.dueAt)}</span>
              )}
            </div>
            {a.body && <p className="mt-1 text-sm text-slate-600 whitespace-pre-wrap">{a.body}</p>}
            <div className="mt-1 text-xs text-slate-400">
              {a.author?.name && <>by {a.author.name} · </>}
              {formatDateTime(a.createdAt)}
            </div>
          </div>
          <div className="flex flex-col gap-1 shrink-0">
            {a.type === "TASK" && (
              <button onClick={() => toggleDone(a)} className="text-xs text-slate-500 hover:text-emerald-600">
                {a.doneAt ? "Reopen" : "Mark done"}
              </button>
            )}
            <button onClick={() => remove(a)} className="text-xs text-slate-400 hover:text-red-600">Delete</button>
          </div>
        </li>
      ))}
    </ul>
  );
}
