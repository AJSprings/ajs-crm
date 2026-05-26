"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Contact, Company } from "@prisma/client";

export function ContactForm({ contact, companies }: { contact?: Contact; companies: Company[] }) {
  const router = useRouter();
  const [form, setForm] = useState({
    firstName: contact?.firstName ?? "",
    lastName: contact?.lastName ?? "",
    email: contact?.email ?? "",
    phone: contact?.phone ?? "",
    title: contact?.title ?? "",
    companyId: contact?.companyId ?? "",
    notes: contact?.notes ?? "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const url = contact ? `/api/contacts/${contact.id}` : "/api/contacts";
    const method = contact ? "PATCH" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "content-type": "application/json" },
      body: JSON.stringify(form),
    });
    setLoading(false);
    if (!res.ok) {
      setError("Failed to save contact");
      return;
    }
    const saved = await res.json();
    router.push(`/contacts/${saved.id}`);
    router.refresh();
  }

  function setField<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  return (
    <form onSubmit={onSubmit} className="card p-6 space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">First name</label>
          <input className="input" value={form.firstName} onChange={(e) => setField("firstName", e.target.value)} required />
        </div>
        <div>
          <label className="label">Last name</label>
          <input className="input" value={form.lastName} onChange={(e) => setField("lastName", e.target.value)} required />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Email</label>
          <input type="email" className="input" value={form.email} onChange={(e) => setField("email", e.target.value)} />
        </div>
        <div>
          <label className="label">Phone</label>
          <input className="input" value={form.phone} onChange={(e) => setField("phone", e.target.value)} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Title</label>
          <input className="input" value={form.title} onChange={(e) => setField("title", e.target.value)} />
        </div>
        <div>
          <label className="label">Company</label>
          <select className="input" value={form.companyId} onChange={(e) => setField("companyId", e.target.value)}>
            <option value="">—</option>
            {companies.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label className="label">Notes</label>
        <textarea className="input min-h-[100px]" value={form.notes} onChange={(e) => setField("notes", e.target.value)} />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex justify-end gap-3">
        <button type="button" className="btn-secondary" onClick={() => router.back()}>Cancel</button>
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? "Saving…" : contact ? "Save changes" : "Create contact"}
        </button>
      </div>
    </form>
  );
}
