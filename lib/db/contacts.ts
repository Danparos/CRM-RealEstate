import { createClient } from "@/lib/supabase/client";

export interface Contact {
  id: string;
  type: "lawyer" | "notary" | "accountant" | "engineer";
  salutation?: "Mr" | "Mrs" | "Ms" | "Dr";
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  mobile?: string;
  address?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

function toContact(row: Record<string, unknown>): Contact {
  return {
    id:         row.id as string,
    type:       row.type as Contact["type"],
    salutation: row.salutation as Contact["salutation"] | undefined,
    firstName:  row.first_name as string,
    lastName:   row.last_name as string,
    email:      row.email as string | undefined,
    phone:      row.phone as string | undefined,
    mobile:     row.mobile as string | undefined,
    address:    row.address as string | undefined,
    notes:      row.notes as string | undefined,
    createdAt:  row.created_at as string,
    updatedAt:  row.updated_at as string,
  };
}

function toRow(data: Omit<Contact, "id" | "createdAt" | "updatedAt">): Record<string, unknown> {
  return {
    type:       data.type,
    salutation: data.salutation ?? null,
    first_name: data.firstName,
    last_name:  data.lastName,
    email:      data.email ?? null,
    phone:      data.phone ?? null,
    mobile:     data.mobile ?? null,
    address:    data.address ?? null,
    notes:      data.notes ?? null,
  };
}

export async function getAllContacts(type?: Contact["type"]): Promise<Contact[]> {
  try {
    let query = createClient()
      .from("contacts")
      .select("*")
      .order("last_name", { ascending: true });
    if (type) {
      query = query.eq("type", type);
    }
    const { data, error } = await query;
    if (error) { console.error("[db/contacts] getAll:", error.message); return []; }
    return (data ?? []).map(r => toContact(r as Record<string, unknown>));
  } catch (err) {
    console.error("[db/contacts] getAll unexpected:", err);
    return [];
  }
}

export async function getContact(id: string): Promise<Contact | null> {
  try {
    const { data, error } = await createClient()
      .from("contacts")
      .select("*")
      .eq("id", id)
      .single();
    if (error) { console.error("[db/contacts] get:", error.message); return null; }
    return data ? toContact(data as Record<string, unknown>) : null;
  } catch (err) {
    console.error("[db/contacts] get unexpected:", err);
    return null;
  }
}

export async function createContact(data: Omit<Contact, "id" | "createdAt" | "updatedAt">): Promise<Contact | null> {
  try {
    const { data: row, error } = await createClient()
      .from("contacts")
      .insert(toRow(data))
      .select()
      .single();
    if (error) { console.error("[db/contacts] create:", error.message); return null; }
    return row ? toContact(row as Record<string, unknown>) : null;
  } catch (err) {
    console.error("[db/contacts] create unexpected:", err);
    return null;
  }
}

export async function updateContact(id: string, data: Omit<Contact, "id" | "createdAt" | "updatedAt">): Promise<boolean> {
  try {
    const { error } = await createClient()
      .from("contacts")
      .update(toRow(data))
      .eq("id", id);
    if (error) { console.error("[db/contacts] update:", error.message); return false; }
    return true;
  } catch (err) {
    console.error("[db/contacts] update unexpected:", err);
    return false;
  }
}

export async function deleteContact(id: string): Promise<boolean> {
  try {
    const { error } = await createClient()
      .from("contacts")
      .delete()
      .eq("id", id);
    if (error) { console.error("[db/contacts] delete:", error.message); return false; }
    return true;
  } catch (err) {
    console.error("[db/contacts] delete unexpected:", err);
    return false;
  }
}
