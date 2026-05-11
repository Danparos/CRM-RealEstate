import { supabase } from "@/lib/supabase";
import type { Property } from "@/types";

// ─── Row → Property ──────────────────────────────────────────────────────────
function toProperty(row: Record<string, unknown>): Property {
  return {
    id:          row.id as string,
    reference:   row.reference as string,
    title:       (row.title as Record<string, string>) ?? {},
    type:        row.type as Property["type"],
    status:      row.status as Property["status"],

    // Admin
    ownershipGroup:       row.ownership_group as string | undefined,
    agentId:              row.agent_id as string,
    coAgentIds:           row.co_agent_ids as string[] | undefined,
    recordingResponsible: row.recording_responsible as string | undefined,
    displayOnWebsite:     row.display_on_website as boolean | undefined,
    disabled:             row.disabled as boolean | undefined,
    keysAvailable:        row.keys_available as boolean | undefined,

    // Financial
    askingPrice:      row.asking_price as number,
    buyerCommission:  row.buyer_commission as number | undefined,
    sellerCommission: row.seller_commission as number | undefined,
    contractType:     row.contract_type as Property["contractType"],

    // Physical
    bedrooms:  row.bedrooms as number,
    bathrooms: row.bathrooms as number,
    buildArea: row.build_area as number,
    buildableArea: row.buildable_area as number | undefined,
    plotArea:      row.plot_area as number | undefined,
    floors:        row.floors as number | undefined,
    rooms:         row.rooms as number | undefined,
    balconies:     row.balconies as number | undefined,
    terraces:      row.terraces as number | undefined,
    yearOfConstruction: row.year_of_construction as number | undefined,
    condition:     row.condition as Property["condition"],
    energyClass:   row.energy_class as Property["energyClass"],
    heatingTypes:  row.heating_types as string[] | undefined,

    // Location
    area:        row.area as string,
    island:      row.island as string | undefined,
    country:     row.country as string | undefined,
    scoutRegion: row.scout_region as string | undefined,
    address:     row.address as string | undefined,
    postalCode:  row.postal_code as string | undefined,
    lat:         row.lat as number | undefined,
    lng:         row.lng as number | undefined,

    // Classification
    usage:           row.usage as Property["usage"],
    marketingMethod: row.marketing_method as Property["marketingMethod"],

    // Features
    seafront:       row.seafront as boolean,
    seaView:        row.sea_view as boolean,
    pool:           row.pool as boolean,
    distanceFromSea: row.distance_from_sea as number | undefined,
    features:       row.features as string[] | undefined,
    description:    row.description as string | undefined,
    comments:       row.comments as string | undefined,
    legalChecklist: row.legal_checklist as { label: string; checked: boolean }[] | undefined,
    coverImage:     row.cover_image as string | undefined,
  };
}

// ─── Property → Row ──────────────────────────────────────────────────────────
function toRow(p: Property): Record<string, unknown> {
  return {
    id:        p.id,
    reference: p.reference,
    title:     p.title,
    type:      p.type,
    status:    p.status,

    ownership_group:       p.ownershipGroup       ?? null,
    agent_id:              p.agentId,
    co_agent_ids:          p.coAgentIds            ?? null,
    recording_responsible: p.recordingResponsible  ?? null,
    display_on_website:    p.displayOnWebsite       ?? null,
    disabled:              p.disabled               ?? null,
    keys_available:        p.keysAvailable          ?? null,

    asking_price:      p.askingPrice,
    buyer_commission:  p.buyerCommission  ?? null,
    seller_commission: p.sellerCommission ?? null,
    contract_type:     p.contractType     ?? null,

    bedrooms:           p.bedrooms,
    bathrooms:          p.bathrooms,
    build_area:         p.buildArea,
    buildable_area:     p.buildableArea        ?? null,
    plot_area:          p.plotArea             ?? null,
    floors:             p.floors               ?? null,
    rooms:              p.rooms                ?? null,
    balconies:          p.balconies            ?? null,
    terraces:           p.terraces             ?? null,
    year_of_construction: p.yearOfConstruction ?? null,
    condition:          p.condition            ?? null,
    energy_class:       p.energyClass          ?? null,
    heating_types:      p.heatingTypes         ?? null,

    area:         p.area,
    island:       p.island       ?? null,
    country:      p.country      ?? null,
    scout_region: p.scoutRegion  ?? null,
    address:      p.address      ?? null,
    postal_code:  p.postalCode   ?? null,
    lat:          p.lat          ?? null,
    lng:          p.lng          ?? null,

    usage:            p.usage           ?? null,
    marketing_method: p.marketingMethod ?? null,

    seafront:          p.seafront,
    sea_view:          p.seaView,
    pool:              p.pool,
    distance_from_sea: p.distanceFromSea ?? null,
    features:          p.features        ?? null,
    description:       p.description     ?? null,
    comments:          p.comments        ?? null,
    legal_checklist:   p.legalChecklist  ?? null,
    cover_image:       p.coverImage      ?? null,
  };
}

// ─── Public API ──────────────────────────────────────────────────────────────

export async function getAllProperties(): Promise<Property[]> {
  try {
    const { data, error } = await supabase
      .from("properties")
      .select("*")
      .order("reference", { ascending: true });
    if (error) { console.error("[db/properties] getAllProperties:", error.message); return []; }
    return (data ?? []).map(toProperty);
  } catch (err) {
    console.error("[db/properties] getAllProperties unexpected:", err);
    return [];
  }
}

export async function getProperty(id: string): Promise<Property | null> {
  try {
    const { data, error } = await supabase
      .from("properties")
      .select("*")
      .eq("id", id)
      .single();
    if (error) { console.error("[db/properties] getProperty:", error.message); return null; }
    return data ? toProperty(data as Record<string, unknown>) : null;
  } catch (err) {
    console.error("[db/properties] getProperty unexpected:", err);
    return null;
  }
}

export async function upsertProperty(p: Property): Promise<void> {
  try {
    const { error } = await supabase
      .from("properties")
      .upsert(toRow(p), { onConflict: "id" });
    if (error) console.error("[db/properties] upsertProperty:", error.message);
  } catch (err) {
    console.error("[db/properties] upsertProperty unexpected:", err);
  }
}

/** Returns the next reference string, e.g. "EK-013" */
export async function getNextReference(): Promise<string> {
  try {
    const { data, error } = await supabase
      .from("properties")
      .select("reference");
    if (error) { console.error("[db/properties] getNextReference:", error.message); return "EK-001"; }
    const nums = (data ?? [])
      .map((row: { reference: string }) => parseInt(row.reference.replace(/\D/g, "")) || 0);
    const max = Math.max(0, ...nums);
    return `EK-${String(max + 1).padStart(3, "0")}`;
  } catch (err) {
    console.error("[db/properties] getNextReference unexpected:", err);
    return "EK-001";
  }
}
