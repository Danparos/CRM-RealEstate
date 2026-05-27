import { createClient } from "@/lib/supabase/client";

export interface Appointment {
  id: string;
  date: string;
  time: string;
  type: "viewing" | "call" | "meeting" | "signing" | "follow_up";
  clientName: string;
  clientId?: string;
  agentName: string;
  note: string;
  location?: string;
  createdAt?: string;
}

function toAppointment(row: Record<string, unknown>): Appointment {
  return {
    id:         row.id as string,
    date:       row.date as string,
    time:       row.time as string,
    type:       row.type as Appointment["type"],
    clientName: row.client_name as string,
    clientId:   row.client_id as string | undefined,
    agentName:  row.agent_name as string,
    note:       row.note as string,
    location:   row.location as string | undefined,
    createdAt:  row.created_at as string | undefined,
  };
}

export async function getAllAppointments(): Promise<Appointment[]> {
  try {
    const { data, error } = await createClient()
      .from("appointments")
      .select("*")
      .order("date", { ascending: true })
      .order("time", { ascending: true });
    if (error) { console.error("[db/appointments] getAll:", error.message); return []; }
    return (data ?? []).map(r => toAppointment(r as Record<string, unknown>));
  } catch (err) {
    console.error("[db/appointments] getAll unexpected:", err);
    return [];
  }
}

export async function createAppointment(data: Omit<Appointment, "id" | "createdAt">): Promise<Appointment | null> {
  try {
    const { data: row, error } = await createClient()
      .from("appointments")
      .insert({
        date:        data.date,
        time:        data.time,
        type:        data.type,
        client_name: data.clientName,
        client_id:   data.clientId ?? null,
        agent_name:  data.agentName,
        note:        data.note,
        location:    data.location ?? null,
      })
      .select()
      .single();
    if (error) { console.error("[db/appointments] create:", error.message); return null; }
    return row ? toAppointment(row as Record<string, unknown>) : null;
  } catch (err) {
    console.error("[db/appointments] create unexpected:", err);
    return null;
  }
}

export async function updateAppointment(id: string, data: Omit<Appointment, "id" | "createdAt">): Promise<boolean> {
  try {
    const { error } = await createClient()
      .from("appointments")
      .update({
        date:        data.date,
        time:        data.time,
        type:        data.type,
        client_name: data.clientName,
        client_id:   data.clientId ?? null,
        agent_name:  data.agentName,
        note:        data.note,
        location:    data.location ?? null,
      })
      .eq("id", id);
    if (error) { console.error("[db/appointments] update:", error.message); return false; }
    return true;
  } catch (err) {
    console.error("[db/appointments] update unexpected:", err);
    return false;
  }
}

export async function deleteAppointment(id: string): Promise<boolean> {
  try {
    const { error } = await createClient()
      .from("appointments")
      .delete()
      .eq("id", id);
    if (error) { console.error("[db/appointments] delete:", error.message); return false; }
    return true;
  } catch (err) {
    console.error("[db/appointments] delete unexpected:", err);
    return false;
  }
}
