import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { SavedOutfitCard } from "@/components/saved-outfit-card";
import { getSavedOutfits } from "@/lib/outfits/data";

export const dynamic = "force-dynamic";

export default async function SavedOutfitsPage() {
  const { outfits, error } = await getSavedOutfits();

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
        description="These are generated outfits you edited and saved into Supabase. This is the foundation for Planner, outfit history, and style learning."
        asideEyebrow="Outfit Memory"
        asideText={`${outfits.length} saved looks available from your database.`}
      >
        <div className="flex flex-wrap gap-5">
          <Link
            href="/outfits"
            className="border-b-[1.5px] border-transparent pb-[3px] text-[0.58rem] font-semibold uppercase tracking-[0.18em] text-[var(--coffee)] no-underline transition hover:border-[var(--coffee)]"
          >
            Outfit Builder
          </Link>
          <Link
            href="/outfits/saved"
            className="border-b-[1.5px] border-[var(--espresso)] pb-[3px] text-[0.58rem] font-semibold uppercase tracking-[0.18em] text-[var(--espresso)] no-underline"
          >
            Saved Outfits
          </Link>
        </div>
      </PageHeader>

      <section className="mx-auto max-w-6xl px-6 py-10 md:px-10">
        {error ? (
          <div className="rounded-[8px] border border-[rgba(128,55,45,0.28)] bg-[rgba(128,55,45,0.08)] p-6 text-sm leading-7 text-[var(--espresso)]">
            Could not load saved outfits: {error}
          </div>
        ) : outfits.length > 0 ? (
          <div className="grid gap-6 lg:grid-cols-2">
            {outfits.map((outfit) => (
              <SavedOutfitCard key={outfit.id} outfit={outfit} />
            ))}
          </div>
        ) : (
          <div className="rounded-[8px] border border-dashed border-[var(--line)] bg-[var(--paper)] p-8 text-sm leading-7 text-[var(--ink-soft)]">
            No saved outfits yet. Go to Outfit Builder, edit a generated look, and press Save changes.
          </div>
        )}
      </section>
    </main>
  );
}
