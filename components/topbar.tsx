"use client";

import { signOut } from "next-auth/react";
import { GlobalSearch } from "./global-search";

export function Topbar({ user }: { user: { name?: string | null; email?: string | null; role: string } }) {
  return (
    <header className="h-14 shrink-0 border-b border-slate-200 bg-white px-6 flex items-center justify-between gap-4">
      <GlobalSearch />
      <div className="flex items-center gap-4">
        <div className="text-right">
          <div className="text-sm font-medium">{user.name ?? user.email}</div>
          <div className="text-xs text-slate-500">{user.role.replace("_", " ")}</div>
        </div>
        <button
          className="btn-secondary"
          onClick={() => signOut({ callbackUrl: "/login" })}
        >
          Sign out
        </button>
      </div>
    </header>
  );
}
