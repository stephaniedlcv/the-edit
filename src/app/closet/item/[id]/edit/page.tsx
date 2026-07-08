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
    <section className="item-edit">
      <div className="item-d-wrap">
        <ClosetItemEditClient item={item} />
      </div>
    </section>
  );
}
