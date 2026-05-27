import { createClient } from "@/lib/supabase/client";
import type { Activity } from "@/types";

// ─── Row → Activity ───────────────────────────────────────────────────────────
function toActivity(row: Record<string, unknown>): Activity {
  return {
    id:         row.id          as string,
    clientId:   row.client_id   as string | undefined,
    propertyId: row.property_id as string | undefined,
    type:       row.type        as Activity["type"],
    date:       row.date        as string,
    note:       row.note        as string,
    agentName:  row.agent_name  as string,
    metadata:   row.metadata    as Record<string, string> | undefined,
  };
}

// ─── Public API ───────────────────────────────────────────────────────────────

export async function getActivitiesForClient(clientId: string): Promise<Activity[]> {
  try {
    const { data, error } = await createClient()
      .from("activities")
      .select("*")
      .eq("client_id", clientId)
      .order("date", { ascending: false });
    if (error) { console.error("[db/activities] getActivitiesForClient:", error.message); return []; }
    return (data ?? []).map(toActivity);
  } catch (err) {
    console.error("[db/activities] getActivitiesForClient unexpected:", err);
    return [];
  }
}

export async function getActivitiesForProperty(propertyId: string): Promise<Activity[]> {
  try {
    const { data, error } = await createClient()
      .from("activities")
      .select("*")
      .eq("property_id", propertyId)
      .order("date", { ascending: false });
    if (error) { console.error("[db/activities] getActivitiesForProperty:", error.message); return []; }
    return (data ?? []).map(toActivity);
  } catch (err) {
    console.error("[db/activities] getActivitiesForProperty unexpected:", err);
    return [];
  }
}

export async function getAllActivities(): Promise<Activity[]> {
  try {
    const { data, error } = await createClient()
      .from("activities")
      .select("*")
      .order("date", { ascending: false });
    if (error) { console.error("[db/activities] getAllActivities:", error.message); return []; }
    return (data ?? []).map(toActivity);
  } catch (err) {
    console.error("[db/activities] getAllActivities unexpected:", err);
    return [];
  }
}

export async function createActivity(data: {
  clientId?: string;
  propertyId?: string;
  type: Activity["type"];
  note: string;
  agentName: string;
  metadata?: Record<string, string>;
}): Promise<Activity | null> {
  try {
    const { data: row, error } = await createClient()
      .from("activities")
      .insert({
        id:          `act-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        client_id:   data.clientId   ?? null,
        property_id: data.propertyId ?? null,
        type:        data.type,
        date:        new Date().toISOString(),
        note:        data.note,
        agent_name:  data.agentName,
        metadata:    data.metadata ?? null,
      })
      .select()
      .single();
    if (error) { console.error("[db/activities] create:", error.message); return null; }
    return row ? toActivity(row as Record<string, unknown>) : null;
  } catch (err) {
    console.error("[db/activities] create unexpected:", err);
    return null;
  }
}
