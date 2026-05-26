"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { DEAL_STAGES, DEAL_STAGE_LABELS, type DealStage } from "@/lib/constants";
import { formatCurrency } from "@/lib/format";
import clsx from "clsx";

type Deal = {
  id: string;
  title: string;
  amount: number;
  stage: string;
  contact: { id: string; firstName: string; lastName: string } | null;
  company: { id: string; name: string } | null;
};

export function Kanban({ deals }: { deals: Deal[] }) {
  const router = useRouter();
  const [local, setLocal] = useState(deals);
  const [dragOver, setDragOver] = useState<DealStage | null>(null);

  function onDragStart(e: React.DragEvent, dealId: string) {
    e.dataTransfer.setData("text/plain", dealId);
    e.dataTransfer.effectAllowed = "move";
  }

  async function onDrop(e: React.DragEvent, stage: DealStage) {
    e.preventDefault();
    setDragOver(null);
    const dealId = e.dataTransfer.getData("text/plain");
    const deal = local.find((d) => d.id === dealId);
    if (!deal || deal.stage === stage) return;
    setLocal((prev) => prev.map((d) => (d.id === dealId ? { ...d, stage } : d)));
    const res = await fetch(`/api/deals/${dealId}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ stage }),
    });
    if (!res.ok) {
      // revert
      setLocal(deals);
      alert("Failed to move deal");
    }
    router.refresh();
  }

  return (
    <div className="flex-1 overflow-x-auto">
      <div className="flex gap-4 pb-4 min-w-max">
        {DEAL_STAGES.map((stage) => {
          const stageDeals = local.filter((d) => d.stage === stage);
          const stageTotal = stageDeals.reduce((sum, d) => sum + d.amount, 0);
          return (
            <div
              key={stage}
              onDragOver={(e) => { e.preventDefault(); setDragOver(stage); }}
              onDragLeave={() => setDragOver((s) => (s === stage ? null : s))}
              onDrop={(e) => onDrop(e, stage)}
              className={clsx(
                "w-72 shrink-0 rounded-lg bg-slate-100 p-3 flex flex-col gap-2 max-h-full",
                dragOver === stage && "ring-2 ring-brand-500 bg-brand-50"
              )}
            >
              <div className="flex items-center justify-between px-1">
                <div className="font-semibold text-sm text-slate-700">
                  {DEAL_STAGE_LABELS[stage]}
                </div>
                <div className="text-xs text-slate-500">
                  {stageDeals.length} · {formatCurrency(stageTotal)}
                </div>
              </div>
              <div className="space-y-2 overflow-y-auto">
                {stageDeals.map((d) => (
                  <div
                    key={d.id}
                    draggable
                    onDragStart={(e) => onDragStart(e, d.id)}
                    className="rounded-md bg-white p-3 border border-slate-200 shadow-sm cursor-grab active:cursor-grabbing hover:border-brand-400"
                  >
                    <Link href={`/deals/${d.id}`} className="block">
                      <div className="font-medium text-sm">{d.title}</div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        {formatCurrency(d.amount)}
                      </div>
                      {(d.contact || d.company) && (
                        <div className="text-xs text-slate-400 mt-1 truncate">
                          {d.contact && `${d.contact.firstName} ${d.contact.lastName}`}
                          {d.contact && d.company && " · "}
                          {d.company?.name}
                        </div>
                      )}
                    </Link>
                  </div>
                ))}
                {stageDeals.length === 0 && (
                  <div className="text-xs text-slate-400 px-1 py-2">No deals</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
