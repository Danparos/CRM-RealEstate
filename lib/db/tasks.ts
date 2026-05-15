import { supabase } from "@/lib/supabase";
import type { Task } from "@/types";

// ─── Row → Task ───────────────────────────────────────────────────────────────
function toTask(row: Record<string, unknown>): Task {
  return {
    id:          row.id          as string,
    title:       row.title       as string,
    description: row.description as string | undefined,
    dueDate:     row.due_date    as string | undefined,
    assignedTo:  row.assigned_to as string | undefined,
    clientId:    row.client_id   as string | undefined,
    propertyId:  row.property_id as string | undefined,
    status:      row.status      as Task["status"],
    priority:    row.priority    as Task["priority"],
    createdAt:   row.created_at  as string | undefined,
  };
}

// ─── Task → Row ───────────────────────────────────────────────────────────────
function toRow(t: Task): Record<string, unknown> {
  return {
    id:          t.id,
    title:       t.title,
    description: t.description  ?? null,
    due_date:    t.dueDate       ?? null,
    assigned_to: t.assignedTo   ?? null,
    client_id:   t.clientId   || null,
    property_id: t.propertyId || null,
    status:      t.status,
    priority:    t.priority,
    ...(t.createdAt ? { created_at: t.createdAt } : {}),
  };
}

// ─── Public API ───────────────────────────────────────────────────────────────

export async function getAllTasks(): Promise<Task[]> {
  try {
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) { console.error("[db/tasks] getAllTasks:", error.message); return []; }
    return (data ?? []).map(toTask);
  } catch (err) {
    console.error("[db/tasks] getAllTasks unexpected:", err);
    return [];
  }
}

export async function upsertTask(t: Task): Promise<void> {
  const { error } = await supabase
    .from("tasks")
    .upsert(toRow(t), { onConflict: "id" });
  if (error) throw new Error(error.message);
}

export async function deleteTask(id: string): Promise<void> {
  try {
    const { error } = await supabase
      .from("tasks")
      .delete()
      .eq("id", id);
    if (error) console.error("[db/tasks] deleteTask:", error.message);
  } catch (err) {
    console.error("[db/tasks] deleteTask unexpected:", err);
  }
}
