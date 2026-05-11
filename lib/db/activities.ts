import { supabase } from "@/lib/supabase";
import type { Activity } from "@/types";

// ─── Row → Activity ───────────────────────────────────────────────────────────
function toActivity(row: Record<string, unknown>): Activity {
  return {
    id:         row.id        as string,
    clientId:   row.client_id as string,
    type:       row.type      as Activity["type"],
    date:       row.date      as string,
    note:       row.note      as string,
    agentName:  row.agent_name as string,
    metadata:   row.metadata  as Record<string, string> | undefined,
  };
}

// ─── Public API ───────────────────────────────────────────────────────────────

export async function getActivitiesForClient(clientId: string): Promise<Activity[]> {
  try {
    const { data, error } = await supabase
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

export async function getAllActivities(): Promise<Activity[]> {
  try {
    const { data, error } = await supabase
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
