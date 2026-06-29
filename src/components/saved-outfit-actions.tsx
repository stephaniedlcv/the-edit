"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function SavedOutfitActions({
  outfitId,
  outfitTitle,
}: {
  outfitId: string;
  outfitTitle: string;
}) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function deleteOutfit() {
    const confirmed = window.confirm(
      `Delete this saved outfit?\n\n${outfitTitle}\n\nThis will hide it from Saved Outfits.`,
    );

    if (!confirmed) return;

    try {
      setIsDeleting(true);
      setError(null);

      const response = await fetch("/api/outfits/saved", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: outfitId }),
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok || !result.ok) {
        throw new Error(result.error ?? "Could not delete outfit.");
      }

      router.refresh();
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "Could not delete outfit.",
      );
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <button
        type="button"
        onClick={deleteOutfit}
        disabled={isDeleting}
        className="rounded-full border border-[rgba(128,55,45,0.35)] px-3 py-1.5 text-[0.55rem] font-semibold uppercase tracking-[0.18em] text-[var(--rust)] transition hover:bg-[rgba(128,55,45,0.08)] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isDeleting ? "Deleting..." : "Delete"}
      </button>

      {error ? (
        <p className="max-w-[180px] text-right text-[0.68rem] leading-4 text-[var(--rust)]">
          {error}
        </p>
      ) : null}
    </div>
  );
}
