"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ROLES, type Role } from "@/lib/constants";
import { formatDate } from "@/lib/format";

type Row = {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt: Date;
};

export function UsersTable({ users, currentUserId }: { users: Row[]; currentUserId: string }) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);

  async function changeRole(id: string, role: Role) {
    setBusyId(id);
    const res = await fetch(`/api/users/${id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ role }),
    });
    setBusyId(null);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      alert(data.error ?? "Failed to update");
      return;
    }
    router.refresh();
  }

  async function remove(id: string) {
    if (!confirm("Delete this user?")) return;
    setBusyId(id);
    const res = await fetch(`/api/users/${id}`, { method: "DELETE" });
    setBusyId(null);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      alert(data.error ?? "Failed to delete");
      return;
    }
    router.refresh();
  }

  return (
    <div className="card overflow-hidden">
      <table className="w-full">
        <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
          <tr>
            <th className="px-4 py-3">Name</th>
            <th className="px-4 py-3">Email</th>
            <th className="px-4 py-3">Role</th>
            <th className="px-4 py-3">Joined</th>
            <th className="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 text-sm">
          {users.map((u) => (
            <tr key={u.id} className="hover:bg-slate-50">
              <td className="px-4 py-3 font-medium">
                {u.name}
                {u.id === currentUserId && <span className="ml-2 text-xs text-slate-400">(you)</span>}
              </td>
              <td className="px-4 py-3 text-slate-600">{u.email}</td>
              <td className="px-4 py-3">
                <select
                  className="input w-40"
                  value={u.role}
                  onChange={(e) => changeRole(u.id, e.target.value as Role)}
                  disabled={busyId === u.id}
                >
                  {ROLES.map((r) => (
                    <option key={r} value={r}>{r.replace("_", " ")}</option>
                  ))}
                </select>
              </td>
              <td className="px-4 py-3 text-slate-600">{formatDate(u.createdAt)}</td>
              <td className="px-4 py-3 text-right">
                {u.id !== currentUserId && (
                  <button
                    onClick={() => remove(u.id)}
                    className="text-xs text-slate-400 hover:text-red-600"
                    disabled={busyId === u.id}
                  >
                    Delete
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
