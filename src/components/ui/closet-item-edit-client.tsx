"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ClosetItemEditForm } from "@/components/closet-item-edit-form";
import type { WardrobeItem } from "@/types/wardrobe";

type Props = {
  item: WardrobeItem;
};

export function ClosetItemEditClient({ item }: Props) {
  const router = useRouter();
  const [imageUploadStatus, setImageUploadStatus] = useState<
    "idle" | "uploading" | "saved" | "error"
  >("idle");
  const [imageUploadError, setImageUploadError] = useState("");
  const [currentItem, setCurrentItem] = useState<WardrobeItem>(item);

  async function handleImageUpload(file: File) {
    setImageUploadStatus("uploading");
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(`/api/closet/items/${item.id}/image`, {
      method: "POST",
      body: formData,
    });

    if (res.ok) {
      setImageUploadStatus("saved");
    } else {
      setImageUploadStatus("error");
      const data = (await res.json()) as { error?: string };
      setImageUploadError(data.error ?? "Error al subir la foto.");
    }
  }

  function handleSaved(updatedItem: WardrobeItem) {
    setCurrentItem(updatedItem);
    router.push(`/closet/item/${updatedItem.id}`);
    router.refresh();
  }

  function handleCancel() {
    router.push(`/closet/item/${item.id}`);
  }

  return (
    <div>
      <nav className="item-d-nav">
        <Link href={`/closet/item/${item.id}`} className="item-d-back">
          ← {item.name}
        </Link>
        <Link href="/closet/gallery" className="item-d-back">
          Galería
        </Link>
      </nav>

      <p className="eyebrow mb-3">Editar pieza</p>
      <h1 className="font-display mb-6 text-[3rem] leading-[0.88] tracking-[-0.03em] text-[var(--espresso)] md:text-[4rem]">
        {item.name}
      </h1>

      <div className="item-edit-image-section">
        <div className="item-edit-preview-wrap">
          {item.imageUrl ? (
            <div
              className="item-edit-preview"
              style={{ backgroundImage: `url(${item.imageUrl})` }}
              aria-label={item.name}
            />
          ) : (
            <div className="item-edit-preview item-edit-preview--empty">
              <p className="font-display text-xl leading-none text-[var(--espresso)]">
                Sin foto aún
              </p>
            </div>
          )}
        </div>

        <div className="item-edit-upload-wrap">
          <p className="eyebrow mb-3">
            {item.imageUrl ? "Reemplazar foto" : "Subir foto"}
          </p>
          <label className="item-edit-upload-label">
            <span>Elegir archivo</span>
            <input
              type="file"
              accept="image/*"
              className="sr-only"
              disabled={imageUploadStatus === "uploading"}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void handleImageUpload(file);
                e.target.value = "";
              }}
            />
          </label>
          {imageUploadStatus === "uploading" ? (
            <p className="mt-3 text-sm text-[var(--ink-soft)]">Subiendo…</p>
          ) : null}
          {imageUploadStatus === "saved" ? (
            <p className="mt-3 text-sm font-semibold text-[var(--olive)]">
              Foto actualizada. Visible al recargar.
            </p>
          ) : null}
          {imageUploadStatus === "error" ? (
            <p className="mt-3 text-sm font-semibold text-[var(--rust)]">
              {imageUploadError}
            </p>
          ) : null}
        </div>
      </div>

      <ClosetItemEditForm
        item={currentItem}
        onSaved={handleSaved}
        onCancel={handleCancel}
      />
    </div>
  );
}
