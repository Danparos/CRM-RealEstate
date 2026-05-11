import { supabase } from "@/lib/supabase";
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
  const { data, error } = await supabase
    .from("agents")
    .select("*")
    .order("name");
  if (error) throw error;
  return (data ?? []).map(toAgent);
}

export async function upsertAgent(a: Agent): Promise<void> {
  const { error } = await supabase.from("agents").upsert({
    id:         a.id,
    name:       a.name,
    email:      a.email,
    phone:      a.phone      ?? null,
    role:       a.role,
    languages:  a.languages  ?? [],
    active:     a.active     ?? true,
    created_at: a.createdAt  ?? new Date().toISOString(),
  }, { onConflict: "id" });
  if (error) throw error;
}

export async function deleteAgent(id: string): Promise<void> {
  const { error } = await supabase.from("agents").delete().eq("id", id);
  if (error) throw error;
}

export function nextAgentId(agents: Agent[]): string {
  const ids = agents.map(a => a.id).filter(id => id.startsWith("agent-"));
  const nums = ids.map(id => parseInt(id.replace("agent-", "")) || 0);
  const max = nums.length ? Math.max(...nums) : 0;
  return `agent-${max + 1}`;
}
