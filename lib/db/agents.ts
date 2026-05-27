import { createClient } from "@/lib/supabase/client";
import type { Agent, UserRole } from "@/types";

function toAgent(row: Record<string, unknown>): Agent {
  return {
    id:        row.id        as string,
    name:      row.name      as string,
    email:     row.email     as string,
    phone:     row.phone     as string | undefined,
    role:      row.role      as UserRole,
    languages: (row.languages as string[]) ?? [],
    active:    row.active    as boolean,
    createdAt: row.created_at as string | undefined,
  };
}

export async function getAllAgents(): Promise<Agent[]> {
  try {
    const { data, error } = await createClient()
      .from("agents")
      .select("*")
      .order("name");
    if (error) { console.error("[db/agents] getAllAgents:", error.message); return []; }
    return (data ?? []).map(toAgent);
  } catch (err) {
    console.error("[db/agents] getAllAgents unexpected:", err);
    return [];
  }
}

export async function upsertAgent(a: Agent): Promise<void> {
  try {
    const { error } = await createClient().from("agents").upsert({
      id:         a.id,
      name:       a.name,
      email:      a.email,
      phone:      a.phone      ?? null,
      role:       a.role,
      languages:  a.languages  ?? [],
      active:     a.active     ?? true,
      created_at: a.createdAt  ?? new Date().toISOString(),
    }, { onConflict: "id" });
    if (error) console.error("[db/agents] upsertAgent:", error.message);
  } catch (err) {
    console.error("[db/agents] upsertAgent unexpected:", err);
  }
}

export async function deleteAgent(id: string): Promise<void> {
  try {
    const { error } = await createClient().from("agents").delete().eq("id", id);
    if (error) console.error("[db/agents] deleteAgent:", error.message);
  } catch (err) {
    console.error("[db/agents] deleteAgent unexpected:", err);
  }
}

export function nextAgentId(agents: Agent[]): string {
  const ids = agents.map(a => a.id).filter(id => id.startsWith("agent-"));
  const nums = ids.map(id => parseInt(id.replace("agent-", "")) || 0);
  const max = nums.length ? Math.max(...nums) : 0;
  return `agent-${max + 1}`;
}
