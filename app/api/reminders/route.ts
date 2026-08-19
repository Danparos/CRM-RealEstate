import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const FOLLOW_UP_DAYS: Record<string, number> = {
  A: 2,
  B: 7,
  C: 30,
};

const SKIP_STAGES = new Set(["signed_closed", "archived"]);

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("clients")
      .select("id, first_name, last_name, client_class, last_activity_at, primary_agent, stage")
      .eq("archived", false);

    if (error) {
      console.error("[api/reminders] fetch error:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const now = Date.now();
    const MS_PER_DAY = 24 * 60 * 60 * 1000;

    const overdue: typeof data = [];
    const dueToday: typeof data = [];
    const dueSoon: typeof data = [];

    for (const client of data ?? []) {
      if (SKIP_STAGES.has(client.stage)) continue;

      const threshold = FOLLOW_UP_DAYS[client.client_class as string];
      if (!threshold) continue;

      const lastActivity = client.last_activity_at ? new Date(client.last_activity_at).getTime() : null;

      if (lastActivity === null) {
        overdue.push(client);
        continue;
      }

      const dueAt = lastActivity + threshold * MS_PER_DAY;
      const daysUntilDue = (dueAt - now) / MS_PER_DAY;

      if (daysUntilDue < 0) {
        overdue.push(client);
      } else if (daysUntilDue < 1) {
        dueToday.push(client);
      } else if (daysUntilDue <= 2) {
        dueSoon.push(client);
      }
    }

    return NextResponse.json({ overdue, dueToday, dueSoon });
  } catch (err) {
    console.error("[api/reminders] unexpected:", err);
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}
