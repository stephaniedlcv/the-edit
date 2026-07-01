export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { getWardrobeItemById } from "@/lib/wardrobe/data";
import { ClosetItemEditClient } from "@/components/ui/closet-item-edit-client";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function ClosetItemEditPage({ params }: Props) {
  const { id } = await params;
  const item = await getWardrobeItemById(id);

  if (!item) {
    notFound();
  }

  return (
    <main className="item-edit min-h-screen px-4 py-6 md:px-6 md:py-8">
      <div className="mx-auto max-w-[820px]">
        <ClosetItemEditClient item={item} />
      </div>
    </main>
  );
}
