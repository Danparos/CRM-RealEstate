import { createClient } from "@/lib/supabase/client";
import type { Vendor } from "@/types";

function toVendor(row: Record<string, unknown>): Vendor {
  return {
    id:               row.id as string,
    salutation:       row.salutation as Vendor["salutation"],
    firstName:        row.first_name as string,
    lastName:         row.last_name as string,
    email:            row.email as string | undefined,
    phone:            row.phone as string | undefined,
    nationality:      row.nationality as string | undefined,
    language:         row.language as string | undefined,
    stage:            (row.stage as Vendor["stage"]) ?? "owner_inquiry",
    primaryAgentId:   row.primary_agent_id as string | undefined,
    primaryAgent:     row.primary_agent as string | undefined,
    propertyId:       row.property_id as string | undefined,
    propertyRef:      row.property_ref as string | undefined,
    askingPrice:      row.asking_price as number | undefined,
    valuationPrice:   row.valuation_price as number | undefined,
    listingCommission: row.listing_commission as number | undefined,
    contractType:     row.contract_type as Vendor["contractType"],
    exclusiveUntil:   row.exclusive_until as string | undefined,
    notes:            row.notes as string | undefined,
    lastActivityAt:   row.last_activity_at as string | undefined,
    lastActivityNote: row.last_activity_note as string | undefined,
    stageEnteredAt:   row.stage_entered_at as string | undefined,
    createdAt:        row.created_at as string | undefined,
    updatedAt:        row.updated_at as string | undefined,
    archived:         row.archived as boolean | undefined,
    archivedAt:       row.archived_at as string | undefined,
  };
}

function toRow(v: Vendor): Record<string, unknown> {
  return {
    id:                 v.id,
    salutation:         v.salutation         ?? null,
    first_name:         v.firstName,
    last_name:          v.lastName,
    email:              v.email              ?? null,
    phone:              v.phone              ?? null,
    nationality:        v.nationality        ?? null,
    language:           v.language           ?? null,
    stage:              v.stage,
    primary_agent_id:   v.primaryAgentId     ?? null,
    primary_agent:      v.primaryAgent       ?? null,
    property_id:        v.propertyId         ?? null,
    property_ref:       v.propertyRef        ?? null,
    asking_price:       v.askingPrice        ?? null,
    valuation_price:    v.valuationPrice     ?? null,
    listing_commission: v.listingCommission  ?? null,
    contract_type:      v.contractType       ?? null,
    exclusive_until:    v.exclusiveUntil     ?? null,
    notes:              v.notes              ?? null,
    last_activity_at:   v.lastActivityAt     ?? null,
    last_activity_note: v.lastActivityNote   ?? null,
    stage_entered_at:   v.stageEnteredAt     ?? null,
    ...(v.createdAt ? { created_at: v.createdAt } : {}),
    updated_at:         new Date().toISOString(),
    archived:           v.archived           ?? false,
    archived_at:        v.archivedAt         ?? null,
  };
}

export async function getAllVendors(): Promise<Vendor[]> {
  try {
    const { data, error } = await createClient()
      .from("vendors")
      .select("*")
      .or("archived.eq.false,archived.is.null")
      .order("created_at", { ascending: false });
    if (error) { console.error("[db/vendors] getAll:", error.message); return []; }
    return (data ?? []).map(r => toVendor(r as Record<string, unknown>));
  } catch (err) {
    console.error("[db/vendors] getAll unexpected:", err);
    return [];
  }
}

export async function getVendorByPropertyId(propertyId: string): Promise<Vendor | null> {
  try {
    const { data, error } = await createClient()
      .from("vendors")
      .select("*")
      .eq("property_id", propertyId)
      .or("archived.eq.false,archived.is.null")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) { console.error("[db/vendors] getByPropertyId:", error.message); return null; }
    return data ? toVendor(data as Record<string, unknown>) : null;
  } catch (err) {
    console.error("[db/vendors] getByPropertyId unexpected:", err);
    return null;
  }
}

export async function getVendor(id: string): Promise<Vendor | null> {
  try {
    const { data, error } = await createClient()
      .from("vendors")
      .select("*")
      .eq("id", id)
      .single();
    if (error) { console.error("[db/vendors] get:", error.message); return null; }
    return data ? toVendor(data as Record<string, unknown>) : null;
  } catch (err) {
    console.error("[db/vendors] get unexpected:", err);
    return null;
  }
}

export async function upsertVendor(v: Vendor): Promise<boolean> {
  try {
    const { error } = await createClient()
      .from("vendors")
      .upsert(toRow(v), { onConflict: "id" });
    if (error) { console.error("[db/vendors] upsert:", error.message); return false; }
    return true;
  } catch (err) {
    console.error("[db/vendors] upsert unexpected:", err);
    return false;
  }
}

export function generateVendorId(): string {
  return `vendor-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}
