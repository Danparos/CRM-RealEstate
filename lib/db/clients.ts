import { supabase } from "@/lib/supabase";
import type { Client } from "@/types";

// ─── Row → Client ─────────────────────────────────────────────────────────────
function toClient(row: Record<string, unknown>): Client {
  return {
    id:         row.id as string,
    salutation: row.salutation as Client["salutation"],
    firstName:  row.first_name as string,
    lastName:   row.last_name as string,
    email:      row.email as string | undefined,
    phone:      row.phone as string | undefined,
    nationality: row.nationality as string | undefined,
    language:    row.language   as string | undefined,

    clientClass: row.client_class as Client["clientClass"],
    priceGroup:  row.price_group  as Client["priceGroup"],
    budgetMin:   row.budget_min   as number | undefined,
    budgetMax:   row.budget_max   as number | undefined,

    stage:           row.stage            as Client["stage"],
    primaryAgent:    row.primary_agent    as string | undefined,
    primaryAgentId:  row.primary_agent_id as string | undefined,
    coAgentIds:      row.co_agent_ids     as string[] | undefined,

    propertyInterest:    row.property_interest    as string | undefined,
    propertyLocations:   row.property_locations   as string[] | undefined,
    propertyTypes:       row.property_types       as string[] | undefined,
    propertyBedroomsMin: row.property_bedrooms_min as string | undefined,
    propertyBedroomsMax: row.property_bedrooms_max as string | undefined,
    propertyPool:        row.property_pool         as Client["propertyPool"],
    propertyViews:       row.property_views        as string[] | undefined,

    lastActivityAt:   row.last_activity_at   as string | undefined,
    lastActivityNote: row.last_activity_note as string | undefined,
    stageEnteredAt:   row.stage_entered_at   as string | undefined,
    createdAt:        row.created_at         as string | undefined,
    updatedAt:        row.updated_at         as string | undefined,
    archived:         row.archived           as boolean | undefined,
    archivedAt:       row.archived_at        as string | undefined,
  };
}

// ─── Client → Row ─────────────────────────────────────────────────────────────
function toRow(c: Client): Record<string, unknown> {
  return {
    id:         c.id,
    salutation: c.salutation   ?? null,
    first_name: c.firstName,
    last_name:  c.lastName,
    email:      c.email        ?? null,
    phone:      c.phone        ?? null,
    nationality: c.nationality ?? null,
    language:    c.language    ?? null,

    client_class: c.clientClass,
    price_group:  c.priceGroup  ?? null,
    budget_min:   c.budgetMin   ?? null,
    budget_max:   c.budgetMax   ?? null,

    stage:            c.stage,
    primary_agent:    c.primaryAgent   ?? null,
    primary_agent_id: c.primaryAgentId ?? null,
    co_agent_ids:     c.coAgentIds     ?? null,

    property_interest:    c.propertyInterest    ?? null,
    property_locations:   c.propertyLocations   ?? null,
    property_types:       c.propertyTypes       ?? null,
    property_bedrooms_min: c.propertyBedroomsMin ?? null,
    property_bedrooms_max: c.propertyBedroomsMax ?? null,
    property_pool:        c.propertyPool         ?? null,
    property_views:       c.propertyViews        ?? null,

    last_activity_at:   c.lastActivityAt   ?? null,
    last_activity_note: c.lastActivityNote ?? null,
    stage_entered_at:   c.stageEnteredAt   ?? null,
    // created_at and updated_at are managed by Supabase defaults; only pass if present
    ...(c.createdAt  ? { created_at:  c.createdAt  } : {}),
    ...(c.updatedAt  ? { updated_at:  c.updatedAt  } : {}),
    archived:    c.archived   ?? null,
    archived_at: c.archivedAt ?? null,
  };
}

// ─── Public API ───────────────────────────────────────────────────────────────

export async function getAllClients(): Promise<Client[]> {
  try {
    const { data, error } = await supabase
      .from("clients")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) { console.error("[db/clients] getAllClients:", error.message); return []; }
    return (data ?? []).map(toClient);
  } catch (err) {
    console.error("[db/clients] getAllClients unexpected:", err);
    return [];
  }
}

export async function getClient(id: string): Promise<Client | null> {
  try {
    const { data, error } = await supabase
      .from("clients")
      .select("*")
      .eq("id", id)
      .single();
    if (error) { console.error("[db/clients] getClient:", error.message); return null; }
    return data ? toClient(data as Record<string, unknown>) : null;
  } catch (err) {
    console.error("[db/clients] getClient unexpected:", err);
    return null;
  }
}

export async function upsertClient(c: Client): Promise<void> {
  try {
    const { error } = await supabase
      .from("clients")
      .upsert(toRow(c), { onConflict: "id" });
    if (error) console.error("[db/clients] upsertClient:", error.message);
  } catch (err) {
    console.error("[db/clients] upsertClient unexpected:", err);
  }
}

/** Returns a new unique client ID in the form "local-{timestamp}" */
export async function generateClientId(): Promise<string> {
  return `local-${Date.now()}`;
}

export async function updateClientStage(
  clientId: string,
  newStage: Client["stage"],
  note?: string,
): Promise<void> {
  const now = new Date().toISOString();
  try {
    const { error } = await supabase
      .from("clients")
      .update({
        stage:              newStage,
        stage_entered_at:   now,
        last_activity_at:   now,
        last_activity_note: note ?? `Moved to ${newStage.replace(/_/g, " ")} stage`,
        updated_at:         now,
      })
      .eq("id", clientId);
    if (error) console.error("[db/clients] updateClientStage:", error.message);
  } catch (err) {
    console.error("[db/clients] updateClientStage unexpected:", err);
  }
}
