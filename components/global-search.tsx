"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import clsx from "clsx";

type Results = {
  contacts: { id: string; firstName: string; lastName: string; email: string | null }[];
  companies: { id: string; name: string; industry: string | null }[];
  deals: { id: string; title: string; stage: string; amount: number }[];
  loans: { id: string; reference: string; status: string; borrower: string }[];
};

const EMPTY: Results = { contacts: [], companies: [], deals: [], loans: [] };

export function GlobalSearch() {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [results, setResults] = useState<Results>(EMPTY);
  const [loading, setLoading] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  useEffect(() => {
    if (!q.trim()) {
      setResults(EMPTY);
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      const res = await fetch(`/api/search?q=${encodeURIComponent(q.trim())}`);
      setLoading(false);
      if (res.ok) {
        setResults(await res.json());
      }
    }, 150);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [q]);

  const total =
    results.contacts.length + results.companies.length + results.deals.length + results.loans.length;

  function go(href: string) {
    setOpen(false);
    setQ("");
    router.push(href);
  }

  return (
    <div ref={wrapRef} className="relative w-80">
      <input
        type="search"
        placeholder="Search contacts, companies, deals, loans…"
        className="input w-full"
        value={q}
        onFocus={() => setOpen(true)}
        onChange={(e) => { setQ(e.target.value); setOpen(true); }}
      />
      {open && q.trim() && (
        <div className="absolute left-0 right-0 mt-1 card shadow-lg z-50 max-h-[70vh] overflow-y-auto">
          {loading && <div className="p-3 text-sm text-slate-500">Searching…</div>}
          {!loading && total === 0 && (
            <div className="p-3 text-sm text-slate-500">No matches.</div>
          )}
          {!loading && total > 0 && (
            <div className="divide-y divide-slate-100">
              <Section title="Contacts">
                {results.contacts.map((c) => (
                  <ResultRow key={c.id} onClick={() => go(`/contacts/${c.id}`)}>
                    <span className="font-medium">{c.firstName} {c.lastName}</span>
                    {c.email && <span className="text-slate-500 text-xs"> · {c.email}</span>}
                  </ResultRow>
                ))}
              </Section>
              <Section title="Companies">
                {results.companies.map((c) => (
                  <ResultRow key={c.id} onClick={() => go(`/companies/${c.id}`)}>
                    <span className="font-medium">{c.name}</span>
                    {c.industry && <span className="text-slate-500 text-xs"> · {c.industry}</span>}
                  </ResultRow>
                ))}
              </Section>
              <Section title="Deals">
                {results.deals.map((d) => (
                  <ResultRow key={d.id} onClick={() => go(`/deals/${d.id}`)}>
                    <span className="font-medium">{d.title}</span>
                    <span className="text-slate-500 text-xs"> · {d.stage}</span>
                  </ResultRow>
                ))}
              </Section>
              <Section title="Loans">
                {results.loans.map((l) => (
                  <ResultRow key={l.id} onClick={() => go(`/loans/${l.id}`)}>
                    <span className="font-mono text-xs">{l.reference}</span>
                    <span className="text-slate-500 text-xs"> · {l.borrower} · {l.status}</span>
                  </ResultRow>
                ))}
              </Section>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const items = Array.isArray(children) ? children : [children];
  const filled = items.filter(Boolean) as React.ReactElement[];
  if (filled.length === 0) return null;
  return (
    <div>
      <div className="px-3 pt-2 pb-1 text-[10px] uppercase tracking-wide text-slate-400">{title}</div>
      <ul>{filled}</ul>
    </div>
  );
}

function ResultRow({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <li>
      <button
        onClick={onClick}
        className={clsx("w-full text-left px-3 py-2 text-sm hover:bg-slate-50")}
      >
        {children}
      </button>
    </li>
  );
}
