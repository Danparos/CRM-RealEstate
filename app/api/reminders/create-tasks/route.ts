import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const FOLLOW_UP_DAYS: Record<string, number> = {
  A: 2,
  B: 7,
  C: 30,
};

const PRIORITY_MAP: Record<string, string> = {
  A: "high",
  B: "medium",
  C: "low",
};

const SKIP_STAGES = new Set(["signed_closed", "archived"]);

export async function POST() {
  try {
    const supabase = createClient();

    const { data: clients, error: clientsError } = await supabase
      .from("clients")
      .select("id, first_name, last_name, client_class, last_activity_at, primary_agent, stage")
      .eq("archived", false);

    if (clientsError) {
      console.error("[api/reminders/create-tasks] fetch clients error:", clientsError.message);
      return NextResponse.json({ error: clientsError.message }, { status: 500 });
    }

    const now = Date.now();
    const MS_PER_DAY = 24 * 60 * 60 * 1000;
    const today = new Date().toISOString().slice(0, 10);

    const overdueClients = (clients ?? []).filter((client) => {
      if (SKIP_STAGES.has(client.stage)) return false;
      const threshold = FOLLOW_UP_DAYS[client.client_class as string];
      if (!threshold) return false;
      const lastActivity = client.last_activity_at ? new Date(client.last_activity_at).getTime() : null;
      if (lastActivity === null) return true;
      const daysUntilDue = (lastActivity + threshold * MS_PER_DAY - now) / MS_PER_DAY;
      return daysUntilDue < 0;
    });

    if (overdueClients.length === 0) {
      return NextResponse.json({ created: 0, skipped: 0 });
    }

    const overdueClientIds = overdueClients.map((c) => c.id);

    const { data: existingTasks, error: tasksError } = await supabase
      .from("tasks")
      .select("client_id, title, status")
      .in("client_id", overdueClientIds)
      .neq("status", "done")
      .ilike("title", "Follow up%");

    if (tasksError) {
      console.error("[api/reminders/create-tasks] fetch tasks error:", tasksError.message);
      return NextResponse.json({ error: tasksError.message }, { status: 500 });
    }

    const clientsWithOpenTask = new Set((existingTasks ?? []).map((t) => t.client_id));

    const tasksToCreate = overdueClients
      .filter((client) => !clientsWithOpenTask.has(client.id))
      .map((client) => ({
        id: `task-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        title: `Follow up with ${client.first_name} ${client.last_name}`,
        description: `Client is overdue for follow-up (Class ${client.client_class})`,
        due_date: today,
        client_id: client.id,
        assigned_to: client.primary_agent ?? null,
        status: "todo",
        priority: PRIORITY_MAP[client.client_class as string] ?? "medium",
      }));

    const skipped = overdueClients.length - tasksToCreate.length;

    if (tasksToCreate.length === 0) {
      return NextResponse.json({ created: 0, skipped });
    }

    const { error: insertError } = await supabase.from("tasks").insert(tasksToCreate);

    if (insertError) {
      console.error("[api/reminders/create-tasks] insert error:", insertError.message);
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({ created: tasksToCreate.length, skipped });
  } catch (err) {
    console.error("[api/reminders/create-tasks] unexpected:", err);
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}
