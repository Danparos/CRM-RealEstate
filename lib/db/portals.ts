import { createClient } from "@/lib/supabase/server";

export interface ClientPortal {
  id: string;
  token: string;
  clientId: string;
  createdAt: string;
  lastAccessedAt: string | null;
  active: boolean;
}

function toPortal(row: Record<string, unknown>): ClientPortal {
  return {
    id:             row.id as string,
    token:          row.token as string,
    clientId:       row.client_id as string,
    createdAt:      row.created_at as string,
    lastAccessedAt: row.last_accessed_at as string | null,
    active:         row.active as boolean,
  };
}

export async function generatePortalForClient(clientId: string): Promise<string | null> {
  try {
    const supabase = createClient();
    const { error: deactivateError } = await supabase
      .from("client_portals")
      .update({ active: false })
      .eq("client_id", clientId);
    if (deactivateError) { console.error("[db/portals] generatePortalForClient deactivate:", deactivateError.message); return null; }
    const { data, error } = await supabase
      .from("client_portals")
      .insert({ client_id: clientId })
      .select()
      .single();
    if (error) { console.error("[db/portals] generatePortalForClient insert:", error.message); return null; }
    return data ? (data as Record<string, unknown>).token as string : null;
  } catch (err) {
    console.error("[db/portals] generatePortalForClient unexpected:", err);
    return null;
  }
}

export async function getPortalByToken(token: string): Promise<ClientPortal | null> {
  try {
    const { data, error } = await createClient()
      .from("client_portals")
      .select("*")
      .eq("token", token)
      .eq("active", true)
      .single();
    if (error) { console.error("[db/portals] getPortalByToken:", error.message); return null; }
    return data ? toPortal(data as Record<string, unknown>) : null;
  } catch (err) {
    console.error("[db/portals] getPortalByToken unexpected:", err);
    return null;
  }
}

export async function touchPortal(token: string): Promise<void> {
  try {
    await createClient()
      .from("client_portals")
      .update({ last_accessed_at: new Date().toISOString() })
      .eq("token", token);
  } catch {}
}

export async function revokePortal(clientId: string): Promise<void> {
  try {
    const { error } = await createClient()
      .from("client_portals")
      .update({ active: false })
      .eq("client_id", clientId);
    if (error) console.error("[db/portals] revokePortal:", error.message);
  } catch (err) {
    console.error("[db/portals] revokePortal unexpected:", err);
  }
}
