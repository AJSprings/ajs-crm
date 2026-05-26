"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ACTIVITY_TYPES, type ActivityType } from "@/lib/constants";

type Props = {
  contactId?: string;
  companyId?: string;
  dealId?: string;
  loanId?: string;
};

export function ActivityForm(props: Props) {
  const router = useRouter();
  const [type, setType] = useState<ActivityType>("NOTE");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [dueAt, setDueAt] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/activities", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ type, subject, body, dueAt, ...props }),
    });
    setLoading(false);
    if (!res.ok) {
      alert("Failed to log activity");
      return;
    }
    setSubject("");
    setBody("");
    setDueAt("");
    setType("NOTE");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="label">Type</label>
          <select className="input" value={type} onChange={(e) => setType(e.target.value as ActivityType)}>
            {ACTIVITY_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
        <div className="col-span-2">
          <label className="label">Subject</label>
          <input className="input" value={subject} onChange={(e) => setSubject(e.target.value)} required />
        </div>
      </div>
      <div>
        <label className="label">Notes</label>
        <textarea className="input min-h-[80px]" value={body} onChange={(e) => setBody(e.target.value)} />
      </div>
      {type === "TASK" && (
        <div>
          <label className="label">Due date</label>
          <input type="datetime-local" className="input" value={dueAt} onChange={(e) => setDueAt(e.target.value)} />
        </div>
      )}
      <div className="flex justify-end">
        <button type="submit" className="btn-primary" disabled={loading || !subject.trim()}>
          {loading ? "Logging…" : "Log activity"}
        </button>
      </div>
    </form>
  );
}
