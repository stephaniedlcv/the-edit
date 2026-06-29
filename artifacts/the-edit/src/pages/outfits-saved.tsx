import { useEffect, useState } from "react";
import { Link } from "wouter";
import { PageHeader } from "@/components/page-header";
import { SavedOutfitCard } from "@/components/saved-outfit-card";
import { getSavedOutfits, type SavedOutfit } from "@/lib/outfits/data";

export function SavedOutfitsPage() {
  const [outfits, setOutfits] = useState<SavedOutfit[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSavedOutfits().then((result) => {
      setOutfits(result.outfits);
      setError(result.error);
      setLoading(false);
    });
  }, []);

  return (
    <main className="pb-16 md:pb-20">
      <PageHeader
        eyebrow="Saved Outfits"
        title={
          <>
            Your edited looks,{" "}
            <em className="text-[var(--coffee)]">saved for real.</em>
          </>
        }
        description="Every outfit you have saved from the outfit builder — sorted by date, ready to repeat."
        asideEyebrow="Outfit Log"
        asideText={`${String(outfits.length).padStart(2, "0")} saved looks in your archive.`}
      >
        <div className="flex flex-wrap gap-5">
          <Link
            to="/outfits"
            className="border-b-[1.5px] border-transparent pb-[3px] text-[0.58rem] font-semibold uppercase tracking-[0.18em] text-[var(--coffee)] no-underline transition hover:border-[var(--coffee)]"
          >
            Outfit Builder
          </Link>
          <Link
            to="/outfits/saved"
            className="border-b-[1.5px] border-[var(--espresso)] pb-[3px] text-[0.58rem] font-semibold uppercase tracking-[0.18em] text-[var(--espresso)] no-underline"
          >
            Saved Outfits
          </Link>
        </div>
      </PageHeader>

      <section className="mx-auto max-w-6xl px-6 py-10 md:px-10">
        {loading ? (
          <p className="text-sm text-[var(--ink-soft)]">Loading saved outfits...</p>
        ) : error ? (
          <div className="rounded-[4px] border border-[var(--line)] bg-[var(--paper-2)] px-7 py-7">
            <p className="text-[0.62rem] font-semibold uppercase tracking-[0.22em] text-[var(--caramel)]">
              Supabase not configured
            </p>
            <p className="mt-3 text-sm leading-7 text-[var(--ink-soft)]">
              Connect Supabase to save and view outfits. Use the outfit builder
              to create and save looks.
            </p>
            <Link
              to="/outfits"
              className="mt-5 inline-block border-b-[1.5px] border-[var(--espresso)] pb-[3px] text-[0.58rem] font-semibold uppercase tracking-[0.18em] text-[var(--espresso)] no-underline"
            >
              Go to outfit builder
            </Link>
          </div>
        ) : outfits.length === 0 ? (
          <div className="rounded-[4px] border border-[var(--line)] bg-[var(--paper-2)] px-7 py-7">
            <p className="text-[0.62rem] font-semibold uppercase tracking-[0.22em] text-[var(--caramel)]">
              No saved outfits yet
            </p>
            <p className="mt-3 text-sm leading-7 text-[var(--ink-soft)]">
              Save looks from the outfit builder and they will appear here.
            </p>
            <Link
              to="/outfits"
              className="mt-5 inline-block border-b-[1.5px] border-[var(--espresso)] pb-[3px] text-[0.58rem] font-semibold uppercase tracking-[0.18em] text-[var(--espresso)] no-underline"
            >
              Go to outfit builder
            </Link>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {outfits.map((outfit) => (
              <SavedOutfitCard key={outfit.id} outfit={outfit} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
