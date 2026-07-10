"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { WardrobeItem } from "@/types/wardrobe";

type Props = {
  item: WardrobeItem;
};

export function ClosetItemLifecycleAction({ item }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isArchived = (item.itemStatus ?? "active") === "archived";
  const nextStatus = isArchived ? "active" : "archived";
  const label = isArchived ? "Restaurar" : "Archivar";
  const loadingLabel = isArchived ? "Restaurando…" : "Archivando…";

  async function handleClick() {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/closet/items/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...item, itemStatus: nextStatus }),
      });

      const result = (await response.json()) as { ok?: boolean; error?: string };

      if (!response.ok || !result.ok) {
        setError(result.error ?? "Algo salió mal. Intenta de nuevo.");
        return;
      }

      router.refresh();
    } catch {
      setError("Error de red. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="item-d-lifecycle-wrap">
      <button
        type="button"
        className={`item-d-lifecycle-btn${isArchived ? " restore" : ""}`}
        onClick={handleClick}
        disabled={loading}
      >
        {loading ? loadingLabel : label}
      </button>

      {error ? (
        <p className="item-d-lifecycle-error">{error}</p>
      ) : null}
    </div>
  );
}
