import { createClient } from "@supabase/supabase-js";
import { mockClients, mockActivities, mockProperties } from "../lib/mock-data";
import type { Client, Property, Activity } from "../types";

const supabase = createClient(
  "https://ghlilsrgfazcordijncl.supabase.co",
  "sb_publishable_qAyRgMax58OiPzVsr6glHw_EqRydMLk"
);

// ─── Property row mapper ──────────────────────────────────────────────────────
function propertyToRow(p: Property): Record<string, unknown> {
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

// ─── Client row mapper ────────────────────────────────────────────────────────
function clientToRow(c: Client): Record<string, unknown> {
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
    archived:    c.archived   ?? null,
    archived_at: c.archivedAt ?? null,
  };
}

// ─── Activity row mapper ──────────────────────────────────────────────────────
function activityToRow(a: Activity): Record<string, unknown> {
  return {
    id:         a.id,
    client_id:  a.clientId,
    type:       a.type,
    date:       a.date,
    note:       a.note,
    agent_name: a.agentName,
    metadata:   a.metadata ?? null,
  };
}

// ─── Seed ─────────────────────────────────────────────────────────────────────
const SEED_AGENTS = [
  { id: "errikos", name: "Errikos Kohls",       email: "errikos@kohlsrealty.gr", phone: "+30 694 100 0001", role: "admin",        languages: ["English","Greek","German"], active: true, created_at: "2022-01-01" },
  { id: "klaus",   name: "Klaus Weber",          email: "klaus@kohlsrealty.gr",   phone: "+30 694 100 0002", role: "senior_agent", languages: ["German","English","Greek"],  active: true, created_at: "2022-03-15" },
  { id: "anna",    name: "Anna Papadopoulos",    email: "anna@kohlsrealty.gr",    phone: "+30 694 100 0003", role: "agent",        languages: ["Greek","English"],           active: true, created_at: "2023-06-01" },
];

async function seed() {
  console.log("Seeding database…\n");

  // Properties
  console.log(`Upserting ${mockProperties.length} properties…`);
  const propertyRows = mockProperties.map(propertyToRow);
  const { error: propError } = await supabase
    .from("properties")
    .upsert(propertyRows, { onConflict: "id", ignoreDuplicates: true });
  if (propError) {
    console.error("  ERROR (properties):", propError.message);
  } else {
    console.log("  OK");
  }

  // Clients
  console.log(`Upserting ${mockClients.length} clients…`);
  const clientRows = mockClients.map(clientToRow);
  const { error: clientError } = await supabase
    .from("clients")
    .upsert(clientRows, { onConflict: "id", ignoreDuplicates: true });
  if (clientError) {
    console.error("  ERROR (clients):", clientError.message);
  } else {
    console.log("  OK");
  }

  // Activities
  console.log(`Upserting ${mockActivities.length} activities…`);
  const activityRows = mockActivities.map(activityToRow);
  const { error: activityError } = await supabase
    .from("activities")
    .upsert(activityRows, { onConflict: "id", ignoreDuplicates: true });
  if (activityError) {
    console.error("  ERROR (activities):", activityError.message);
  } else {
    console.log("  OK");
  }

  // Agents
  console.log(`Upserting ${SEED_AGENTS.length} agents…`);
  const { error: agentError } = await supabase
    .from("agents")
    .upsert(SEED_AGENTS, { onConflict: "id", ignoreDuplicates: true });
  if (agentError) {
    console.error("  ERROR (agents):", agentError.message);
  } else {
    console.log("  OK");
  }

  console.log("\nSeed complete.");
}

seed().catch(err => {
  console.error("Fatal seed error:", err);
  process.exit(1);
});
