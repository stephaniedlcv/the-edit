"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ClosetItemEditForm } from "@/components/closet-item-edit-form";
import type { WardrobeItem } from "@/types/wardrobe";

const EMPTY_ITEM: WardrobeItem = {
  id: "",
  name: "",
  status: "owned",
  category: "top",
  colorFamily: "white",
  colorName: "White",
  vibes: [],
};

export function AddPieceClient() {
  const router = useRouter();
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadStatus, setUploadStatus] = useState<
    "idle" | "uploading" | "done" | "error"
  >("idle");
  const [uploadError, setUploadError] = useState("");
  const [savedItemId, setSavedItemId] = useState<string | null>(null);

  function handleFileChange(file: File) {
    setPendingFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setUploadStatus("idle");
    setUploadError("");
  }

  async function handleSaved(newItem: WardrobeItem) {
    if (pendingFile) {
      setUploadStatus("uploading");
      const formData = new FormData();
      formData.append("file", pendingFile);

      const res = await fetch(`/api/closet/items/${newItem.id}/image`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const body = (await res.json()) as { error?: string };
        setUploadError(body.error ?? "No se pudo subir la imagen.");
        setUploadStatus("error");
        setSavedItemId(newItem.id);
        return;
      }

      setUploadStatus("done");
    }

    router.push(`/closet/item/${newItem.id}`);
    router.refresh();
  }

  function handleCancel() {
    router.push("/closet/gallery");
  }

  return (
    <section className="add-piece-page">
      <div className="add-piece-wrap">

        <nav className="item-d-nav">
          <Link href="/closet/gallery" className="item-d-back">← Galería</Link>
          <Link href="/closet" className="item-d-back">Archivo</Link>
        </nav>

        <header className="add-piece-header">
          <p className="eyebrow mb-3">Nueva pieza</p>
          <h1 className="font-display add-piece-title">Añadir pieza</h1>
          <p className="add-piece-sub">
            Construye tu clóset una pieza a la vez.
          </p>
        </header>

        <div className="add-piece-photo-card">
          <div className="add-piece-image-wrap">
            {previewUrl ? (
              <div
                className="add-piece-preview"
                style={{ backgroundImage: `url(${previewUrl})` }}
                aria-label="Vista previa de foto"
              />
            ) : (
              <div className="add-piece-preview--empty">
                <p className="font-display text-xl leading-none text-[var(--espresso)]">
                  Sin foto aún
                </p>
              </div>
            )}
          </div>

          <div className="add-piece-upload-col">
            <p className="eyebrow mb-2">Foto</p>

            <label className="item-edit-upload-label">
              <span>{previewUrl ? "Cambiar foto" : "Elegir archivo"}</span>
              <input
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileChange(file);
                  e.target.value = "";
                }}
              />
            </label>

            {uploadStatus === "uploading" ? (
              <p className="mt-2 text-sm text-[var(--ink-soft)]">Subiendo…</p>
            ) : null}
            {uploadStatus === "error" ? (
              <div className="mt-2 space-y-1">
                <p className="text-sm font-semibold text-[var(--rust)]">
                  {uploadError}
                </p>
                <p className="text-sm text-[var(--ink-soft)]">
                  Tu pieza fue guardada — solo falló la foto. Puedes agregar una foto después desde Editar.
                </p>
                {savedItemId ? (
                  <Link
                    href={`/closet/item/${savedItemId}`}
                    className="inline-block mt-1 text-sm underline text-[var(--espresso)]"
                  >
                    Ver pieza guardada →
                  </Link>
                ) : null}
              </div>
            ) : null}

            <div className="add-piece-ai-placeholder">
              <p className="add-piece-ai-label">AI Catalog Clean-Up</p>
              <p className="add-piece-ai-note">Limpia el fondo, centra la prenda y mantenla fiel a la realidad.</p>
            </div>
          </div>
        </div>

        <ClosetItemEditForm
          item={EMPTY_ITEM}
          onSaved={handleSaved}
          onCancel={handleCancel}
          mode="create"
        />

      </div>
    </section>
  );
}
