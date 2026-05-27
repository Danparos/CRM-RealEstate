import { createClient } from "@/lib/supabase/client";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Document {
  id: string;
  entityType: "client" | "property";
  entityId: string;
  category: "private" | "general";
  fileName: string;
  fileSize?: number;
  mimeType?: string;
  storagePath: string;
  uploadedAt: string;
}

// ─── Row shape returned from Supabase ─────────────────────────────────────────

interface DocumentRow {
  id: string;
  entity_type: "client" | "property";
  entity_id: string;
  category: "private" | "general";
  file_name: string;
  file_size?: number;
  mime_type?: string;
  storage_path: string;
  uploaded_at: string;
}

// ─── Mapper ───────────────────────────────────────────────────────────────────

function rowToDocument(row: DocumentRow): Document {
  return {
    id: row.id,
    entityType: row.entity_type,
    entityId: row.entity_id,
    category: row.category,
    fileName: row.file_name,
    fileSize: row.file_size,
    mimeType: row.mime_type,
    storagePath: row.storage_path,
    uploadedAt: row.uploaded_at,
  };
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Fetch all documents for an entity (client or property), ordered by upload date descending.
 */
export async function getDocuments(
  entityType: "client" | "property",
  entityId: string
): Promise<Document[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("documents")
      .select("*")
      .eq("entity_type", entityType)
      .eq("entity_id", entityId)
      .order("uploaded_at", { ascending: false });

    if (error) {
      console.error("[db/documents] getDocuments:", error.message);
      return [];
    }

    return ((data ?? []) as DocumentRow[]).map(rowToDocument);
  } catch (err) {
    console.error("[db/documents] getDocuments unexpected:", err);
    return [];
  }
}

/**
 * Upload a file to storage and insert a metadata row in the documents table.
 * Returns the created Document or null on error.
 */
export async function uploadDocument(
  entityType: "client" | "property",
  entityId: string,
  category: "private" | "general",
  file: File
): Promise<Document | null> {
  try {
    const supabase = createClient();
    const storagePath = `${entityType}s/${entityId}/${category}/${Date.now()}_${file.name}`;

    // 1. Upload file to storage
    const { error: uploadError } = await supabase.storage
      .from("documents")
      .upload(storagePath, file, { upsert: false });

    if (uploadError) {
      console.error("[db/documents] uploadDocument (storage):", uploadError.message);
      return null;
    }

    // 2. Insert metadata row
    const { data, error: insertError } = await supabase
      .from("documents")
      .insert({
        entity_type: entityType,
        entity_id: entityId,
        category,
        file_name: file.name,
        file_size: file.size,
        mime_type: file.type || null,
        storage_path: storagePath,
      })
      .select("*")
      .single();

    if (insertError) {
      console.error("[db/documents] uploadDocument (insert):", insertError.message);
      return null;
    }

    return rowToDocument(data as DocumentRow);
  } catch (err) {
    console.error("[db/documents] uploadDocument unexpected:", err);
    return null;
  }
}

/**
 * Generate a signed URL for a stored document, valid for 1 hour.
 * Returns the URL string or null on error.
 */
export async function getSignedUrl(storagePath: string): Promise<string | null> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase.storage
      .from("documents")
      .createSignedUrl(storagePath, 3600);

    if (error) {
      console.error("[db/documents] getSignedUrl:", error.message);
      return null;
    }

    return data?.signedUrl ?? null;
  } catch (err) {
    console.error("[db/documents] getSignedUrl unexpected:", err);
    return null;
  }
}

/**
 * Delete a document from storage and remove its metadata row from the database.
 * Returns true on full success, false on any error.
 */
export async function deleteDocument(
  id: string,
  storagePath: string
): Promise<boolean> {
  try {
    const supabase = createClient();

    // 1. Remove file from storage
    const { error: storageError } = await supabase.storage
      .from("documents")
      .remove([storagePath]);

    if (storageError) {
      console.error("[db/documents] deleteDocument (storage):", storageError.message);
      return false;
    }

    // 2. Delete metadata row
    const { error: deleteError } = await supabase
      .from("documents")
      .delete()
      .eq("id", id);

    if (deleteError) {
      console.error("[db/documents] deleteDocument (db):", deleteError.message);
      return false;
    }

    return true;
  } catch (err) {
    console.error("[db/documents] deleteDocument unexpected:", err);
    return false;
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Format a file size in bytes to a human-readable string.
 */
export function formatFileSize(bytes?: number): string {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
