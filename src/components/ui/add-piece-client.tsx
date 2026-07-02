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
        const data = (await res.json()) as { error?: string };
        setUploadError(data.error ?? "Image upload failed.");
        setUploadStatus("error");
      }
    }

    router.push(`/closet/item/${newItem.id}`);
    router.refresh();
  }

  function handleCancel() {
    router.push("/closet/gallery");
  }

  return (
    <main className="add-piece-page">
      <div className="add-piece-wrap">

        <nav className="item-d-nav">
          <Link href="/closet/gallery" className="item-d-back">← Gallery</Link>
          <Link href="/closet" className="item-d-back">Dashboard</Link>
        </nav>

        <header className="add-piece-header">
          <p className="eyebrow mb-3">New closet piece</p>
          <h1 className="font-display add-piece-title">Add piece</h1>
          <p className="add-piece-sub">
            Build your closet one clean piece at a time.
          </p>
        </header>

        <div className="add-piece-photo-card">
          <div className="add-piece-image-wrap">
            {previewUrl ? (
              <div
                className="add-piece-preview"
                style={{ backgroundImage: `url(${previewUrl})` }}
                aria-label="Photo preview"
              />
            ) : (
              <div className="add-piece-preview--empty">
                <p className="font-display text-xl leading-none text-[var(--espresso)]">
                  No photo yet
                </p>
              </div>
            )}
          </div>

          <div className="add-piece-upload-col">
            <p className="eyebrow mb-2">Photo</p>

            <label className="item-edit-upload-label">
              <span>{previewUrl ? "Change photo" : "Choose file"}</span>
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
              <p className="mt-2 text-sm text-[var(--ink-soft)]">Uploading…</p>
            ) : null}
            {uploadStatus === "error" ? (
              <p className="mt-2 text-sm font-semibold text-[var(--rust)]">
                {uploadError} You can add a photo later via Edit.
              </p>
            ) : null}

            <div className="add-piece-ai-placeholder">
              <p className="add-piece-ai-label">AI Catalog Clean-Up</p>
              <p className="add-piece-ai-note">Clean the background, center the item, and keep the garment true to life.</p>
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
    </main>
  );
}
