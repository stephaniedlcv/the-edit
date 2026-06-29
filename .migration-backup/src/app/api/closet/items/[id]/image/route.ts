import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";

const BUCKET_NAME = "closet-items";
const MAX_FILE_SIZE = 8 * 1024 * 1024;

function sanitizeFileName(fileName: string) {
  return fileName
    .toLowerCase()
    .replace(/[^a-z0-9.]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const supabase = getSupabaseServerClient();

  if (!supabase) {
    return NextResponse.json(
      { ok: false, error: "Supabase is not configured." },
      { status: 500 },
    );
  }

  const { id } = await context.params;

  if (!id) {
    return NextResponse.json(
      { ok: false, error: "Missing closet item id." },
      { status: 400 },
    );
  }

  let formData: FormData;

  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid form data." },
      { status: 400 },
    );
  }

  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json(
      { ok: false, error: "Missing image file." },
      { status: 400 },
    );
  }

  if (!file.type.startsWith("image/")) {
    return NextResponse.json(
      { ok: false, error: "File must be an image." },
      { status: 400 },
    );
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { ok: false, error: "Image must be 8MB or smaller." },
      { status: 400 },
    );
  }

  const safeFileName = sanitizeFileName(file.name || "closet-photo.jpg");
  const imagePath = `${id}/main/${Date.now()}-${safeFileName}`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(imagePath, file, {
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) {
    return NextResponse.json(
      { ok: false, error: uploadError.message },
      { status: 500 },
    );
  }

  const { error: clearPrimaryError } = await supabase
    .from("wardrobe_item_images")
    .update({ is_primary: false })
    .eq("wardrobe_item_id", id);

  if (clearPrimaryError) {
    return NextResponse.json(
      { ok: false, error: clearPrimaryError.message },
      { status: 500 },
    );
  }

  const { error: insertError } = await supabase.from("wardrobe_item_images").insert({
    wardrobe_item_id: id,
    storage_bucket: BUCKET_NAME,
    image_path: imagePath,
    image_url: null,
    image_type: "main",
    alt_text: file.name,
    sort_order: 0,
    is_primary: true,
  });

  if (insertError) {
    return NextResponse.json(
      { ok: false, error: insertError.message },
      { status: 500 },
    );
  }

  const { data: signedData, error: signedError } = await supabase.storage
    .from(BUCKET_NAME)
    .createSignedUrl(imagePath, 60 * 60);

  if (signedError || !signedData?.signedUrl) {
    return NextResponse.json(
      { ok: false, error: signedError?.message ?? "Could not create signed URL." },
      { status: 500 },
    );
  }

  return NextResponse.json({
    ok: true,
    imagePath,
    imageUrl: signedData.signedUrl,
  });
}
