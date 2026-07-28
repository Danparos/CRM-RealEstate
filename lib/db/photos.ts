import { createClient } from "@/lib/supabase/client";

const BUCKET = "property-photos";

// ─── Read ─────────────────────────────────────────────────────────────────────

export async function getPhotosForProperty(propertyId: string): Promise<string[]> {
  try {
    const { data, error } = await createClient()
      .from("property_photos")
      .select("url")
      .eq("property_id", propertyId)
      .order("position", { ascending: true });
    if (error) { console.error("[db/photos] getPhotosForProperty:", error.message); return []; }
    return (data ?? []).map((row: { url: string }) => row.url);
  } catch (err) {
    console.error("[db/photos] getPhotosForProperty unexpected:", err);
    return [];
  }
}

// ─── Upload ───────────────────────────────────────────────────────────────────

/**
 * Uploads a file to Supabase Storage and inserts a row in property_photos.
 * Returns the public URL of the stored photo.
 * Throws on any failure.
 */
export async function uploadPhotoForProperty(
  propertyId: string,
  file: File,
  position: number
): Promise<string> {
  const supabase = createClient();
  const safeName = file.name.replace(/\s+/g, "_").replace(/[^a-zA-Z0-9._-]/g, "");
  const path = `${propertyId}/${Date.now()}_${safeName}`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { upsert: false, contentType: file.type || "image/jpeg" });

  if (uploadError) throw new Error(`Storage upload failed: ${uploadError.message}`);

  const { data: { publicUrl } } = supabase.storage.from(BUCKET).getPublicUrl(path);

  const { error: insertError } = await supabase
    .from("property_photos")
    .insert({ property_id: propertyId, url: publicUrl, position });

  if (insertError) {
    // clean up the uploaded file so storage and DB stay in sync
    await supabase.storage.from(BUCKET).remove([path]);
    throw new Error(`DB insert failed: ${insertError.message}`);
  }

  return publicUrl;
}

// ─── Delete ───────────────────────────────────────────────────────────────────

/**
 * Removes a photo row from the DB.
 * If the URL points to our Storage bucket, also removes the file.
 * Throws on failure.
 */
export async function deletePhotoForProperty(
  propertyId: string,
  url: string
): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase
    .from("property_photos")
    .delete()
    .eq("property_id", propertyId)
    .eq("url", url);

  if (error) throw new Error(`Failed to delete photo: ${error.message}`);

  // If it's a Storage URL for our bucket, remove the file too
  if (url.includes(`/storage/v1/object/public/${BUCKET}/`)) {
    const path = url.split(`/storage/v1/object/public/${BUCKET}/`)[1];
    if (path) {
      await supabase.storage.from(BUCKET).remove([decodeURIComponent(path)]);
    }
  }
}

// ─── Reorder ──────────────────────────────────────────────────────────────────

/**
 * Updates position values for existing rows to match the given URL order.
 * Does NOT re-send image data — only updates position integers.
 * Throws on failure.
 */
export async function reorderPhotosForProperty(
  propertyId: string,
  urls: string[]
): Promise<void> {
  const supabase = createClient();

  // Fetch current rows to get their IDs (we need IDs to update positions)
  const { data, error } = await supabase
    .from("property_photos")
    .select("id, url")
    .eq("property_id", propertyId);

  if (error) throw new Error(`Failed to fetch photo rows: ${error.message}`);

  const urlToId = new Map((data ?? []).map((r: { id: string; url: string }) => [r.url, r.id]));

  // Upsert with only id + position (no URL resend)
  const updates = urls
    .map((url, idx) => ({ id: urlToId.get(url), position: idx }))
    .filter((u): u is { id: string; position: number } => !!u.id);

  if (updates.length === 0) return;

  const { error: upsertError } = await supabase
    .from("property_photos")
    .upsert(updates, { onConflict: "id" });

  if (upsertError) throw new Error(`Failed to reorder photos: ${upsertError.message}`);
}
