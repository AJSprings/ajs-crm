"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useState } from "react";

export function DeleteButton({
  url,
  redirectTo,
  label = "Delete",
  confirmMessage = "Are you sure?",
}: {
  url: string;
  redirectTo?: string;
  label?: string;
  confirmMessage?: string;
}) {
  const router = useRouter();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);

  if (session?.user?.role !== "ADMIN") return null;

  async function onClick() {
    if (!confirm(confirmMessage)) return;
    setLoading(true);
    const res = await fetch(url, { method: "DELETE" });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      alert(data.error ?? "Failed to delete");
      return;
    }
    if (redirectTo) router.push(redirectTo);
    router.refresh();
  }

  return (
    <button onClick={onClick} className="btn-danger" disabled={loading}>
      {loading ? "Deleting…" : label}
    </button>
  );
}
