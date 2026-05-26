"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import clsx from "clsx";

const nav = [
  { href: "/", label: "Dashboard", icon: "▦" },
  { href: "/contacts", label: "Contacts", icon: "👤" },
  { href: "/companies", label: "Companies", icon: "🏢" },
  { href: "/deals", label: "Pipeline", icon: "🎯" },
  { href: "/loans", label: "Loans", icon: "💵" },
  { href: "/activities", label: "Activities", icon: "📋" },
  { href: "/import", label: "Import / Export", icon: "⇅" },
];

const adminNav = [
  { href: "/users", label: "Users", icon: "⚙" },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "ADMIN";
  const items = isAdmin ? [...nav, ...adminNav] : nav;
  return (
    <aside className="w-60 shrink-0 border-r border-slate-200 bg-white flex flex-col">
      <div className="h-14 flex items-center px-5 border-b border-slate-200">
        <span className="text-lg font-semibold text-brand-600">AJS CRM</span>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {items.map((item) => {
          const active =
            item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-brand-50 text-brand-700"
                  : "text-slate-700 hover:bg-slate-100"
              )}
            >
              <span className="w-5 text-center">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="p-3 text-xs text-slate-400 border-t border-slate-200">
        v0.1 · Lending CRM
      </div>
    </aside>
  );
}
