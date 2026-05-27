import { createClient } from "@/lib/supabase/client";

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Returns all photo URLs for a property, ordered by position.
 */
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

/**
 * Replaces all photos for a property with the provided URLs (in order).
 * Deletes all existing rows for the property, then inserts the new set.
 */
export async function savePhotosForProperty(propertyId: string, urls: string[]): Promise<void> {
  try {
    // Delete existing
    const { error: deleteError } = await createClient()
      .from("property_photos")
      .delete()
      .eq("property_id", propertyId);
    if (deleteError) {
      console.error("[db/photos] savePhotosForProperty (delete):", deleteError.message);
      return;
    }

    if (urls.length === 0) return;

    // Insert new rows with position index
    const rows = urls.map((url, idx) => ({
      property_id: propertyId,
      url,
      position: idx,
    }));

    const { error: insertError } = await createClient()
      .from("property_photos")
      .insert(rows);
    if (insertError) {
      console.error("[db/photos] savePhotosForProperty (insert):", insertError.message);
    }
  } catch (err) {
    console.error("[db/photos] savePhotosForProperty unexpected:", err);
  }
}
