import { createClient } from "@/lib/supabase/client";

export interface Presentation {
  id: string;
  token: string;
  propertyId: string;
  propertyRef: string;
  propertyTitle: string;
  clientId?: string;
  clientName: string;
  clientEmail: string;
  agentName: string;
  agentEmail?: string;
  agentPhone?: string;
  createdAt: string;
  sentAt?: string;
  openedAt?: string;
  acceptedAt?: string;
  acceptedName?: string;
  message?: string;
  photos?: string[];
}

function toPresentation(row: Record<string, unknown>): Presentation {
  return {
    id:             row.id as string,
    token:          row.token as string,
    propertyId:     row.property_id as string,
    propertyRef:    row.property_ref as string,
    propertyTitle:  row.property_title as string,
    clientId:       row.client_id as string | undefined,
    clientName:     row.client_name as string,
    clientEmail:    row.client_email as string,
    agentName:      row.agent_name as string,
    agentEmail:     row.agent_email as string | undefined,
    agentPhone:     row.agent_phone as string | undefined,
    createdAt:      row.created_at as string,
    sentAt:         row.sent_at as string | undefined,
    openedAt:       row.opened_at as string | undefined,
    acceptedAt:     row.accepted_at as string | undefined,
    acceptedName:   row.accepted_name as string | undefined,
    message:        row.message as string | undefined,
    photos:         row.photos as string[] | undefined,
  };
}

export async function createPresentation(data: Omit<Presentation, "id" | "token" | "createdAt">): Promise<Presentation | null> {
  try {
    const { data: row, error } = await createClient()
      .from("property_presentations")
      .insert({
        property_id:    data.propertyId,
        property_ref:   data.propertyRef,
        property_title: data.propertyTitle,
        client_id:      data.clientId ?? null,
        client_name:    data.clientName,
        client_email:   data.clientEmail,
        agent_name:     data.agentName,
        agent_email:    data.agentEmail ?? null,
        agent_phone:    data.agentPhone ?? null,
        sent_at:        new Date().toISOString(),
        message:        data.message ?? null,
      })
      .select()
      .single();
    if (error) { console.error("[db/presentations] create:", error.message); return null; }
    return row ? toPresentation(row as Record<string, unknown>) : null;
  } catch (err) {
    console.error("[db/presentations] create unexpected:", err);
    return null;
  }
}

export async function getPresentationByToken(token: string): Promise<Presentation | null> {
  try {
    const { data, error } = await createClient()
      .from("property_presentations")
      .select("*")
      .eq("token", token)
      .single();
    if (error) { console.error("[db/presentations] getByToken:", error.message); return null; }
    return data ? toPresentation(data as Record<string, unknown>) : null;
  } catch (err) {
    console.error("[db/presentations] getByToken unexpected:", err);
    return null;
  }
}

export async function markOpened(token: string): Promise<void> {
  try {
    await createClient()
      .from("property_presentations")
      .update({ opened_at: new Date().toISOString() })
      .eq("token", token)
      .is("opened_at", null);
  } catch {}
}

export async function acceptPresentation(token: string, name: string, ip?: string): Promise<boolean> {
  try {
    const { error } = await createClient()
      .from("property_presentations")
      .update({
        accepted_at:   new Date().toISOString(),
        accepted_name: name,
        accepted_ip:   ip ?? null,
      })
      .eq("token", token)
      .is("accepted_at", null);
    if (error) { console.error("[db/presentations] accept:", error.message); return false; }
    return true;
  } catch {
    return false;
  }
}

export async function getPresentationsByProperty(propertyId: string): Promise<Presentation[]> {
  try {
    const { data, error } = await createClient()
      .from("property_presentations")
      .select("*")
      .eq("property_id", propertyId)
      .order("created_at", { ascending: false });
    if (error) { console.error("[db/presentations] byProperty:", error.message); return []; }
    return (data ?? []).map(r => toPresentation(r as Record<string, unknown>));
  } catch {
    return [];
  }
}
