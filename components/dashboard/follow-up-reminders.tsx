"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

interface ReminderClient {
  id: string;
  first_name: string;
  last_name: string;
  client_class: "A" | "B" | "C";
  last_activity_at: string | null;
  primary_agent: string;
  stage: string;
}

interface RemindersData {
  overdue: ReminderClient[];
  dueToday: ReminderClient[];
  dueSoon: ReminderClient[];
}

function classLabel(c: string) {
  if (c === "A") return { label: "Hot", bg: "bg-red-100 text-red-700", dot: "bg-red-500" };
  if (c === "B") return { label: "Warm", bg: "bg-amber-100 text-amber-700", dot: "bg-amber-500" };
  return { label: "Cold", bg: "bg-slate-100 text-slate-600", dot: "bg-slate-400" };
}

function timeAgo(iso: string | null): string {
  if (!iso) return "Never contacted";
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

function ClientRow({ client }: { client: ReminderClient }) {
  const cls = classLabel(client.client_class);
  return (
    <Link
      href={`/clients/${client.id}`}
      className="flex items-center gap-3 px-4 py-3 hover:bg-[#faf8f5] transition-colors group"
    >
      <span className={`shrink-0 h-2 w-2 rounded-full ${cls.dot}`} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-800 truncate group-hover:text-gray-900">
          {client.first_name} {client.last_name}
        </p>
        <p className="text-xs text-gray-400">{client.primary_agent}</p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${cls.bg}`}>
          {cls.label}
        </span>
        <span className="text-xs text-gray-400 whitespace-nowrap">{timeAgo(client.last_activity_at)}</span>
      </div>
    </Link>
  );
}

export function FollowUpReminders() {
  const [data, setData] = useState<RemindersData | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [taskResult, setTaskResult] = useState<{ created: number } | null>(null);

  useEffect(() => {
    fetch("/api/reminders")
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  const handleCreateTasks = async () => {
    setCreating(true);
    const res = await fetch("/api/reminders/create-tasks", { method: "POST" });
    const result = await res.json();
    setTaskResult(result);
    setCreating(false);
    setTimeout(() => setTaskResult(null), 4000);
  };

  const totalUrgent = (data?.overdue.length ?? 0) + (data?.dueToday.length ?? 0);

  return (
    <div className="rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold text-gray-700 tracking-wide uppercase">Follow-ups</h2>
          {totalUrgent > 0 && (
            <span className="inline-flex items-center justify-center h-5 min-w-5 px-1.5 rounded-full text-[10px] font-bold bg-red-500 text-white">
              {totalUrgent}
            </span>
          )}
        </div>
        <button
          onClick={handleCreateTasks}
          disabled={creating || totalUrgent === 0}
          className="text-xs font-medium text-[#B8960C] hover:text-[#8B6914] disabled:text-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          {creating ? "Creating…" : taskResult ? `✓ ${taskResult.created} tasks created` : "Auto-create tasks →"}
        </button>
      </div>

      {loading ? (
        <div className="px-5 py-8 text-center text-sm text-gray-400">Loading…</div>
      ) : !data || (data.overdue.length === 0 && data.dueToday.length === 0 && data.dueSoon.length === 0) ? (
        <div className="px-5 py-8 text-center text-sm text-gray-400">All follow-ups are up to date</div>
      ) : (
        <div className="divide-y divide-gray-50">
          {data.overdue.length > 0 && (
            <div>
              <div className="px-4 py-2 bg-red-50">
                <p className="text-[10px] font-bold text-red-500 uppercase tracking-wide">
                  Overdue · {data.overdue.length}
                </p>
              </div>
              {data.overdue.map((c) => <ClientRow key={c.id} client={c} />)}
            </div>
          )}
          {data.dueToday.length > 0 && (
            <div>
              <div className="px-4 py-2 bg-amber-50">
                <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wide">
                  Due Today · {data.dueToday.length}
                </p>
              </div>
              {data.dueToday.map((c) => <ClientRow key={c.id} client={c} />)}
            </div>
          )}
          {data.dueSoon.length > 0 && (
            <div>
              <div className="px-4 py-2 bg-gray-50">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">
                  Due Soon · {data.dueSoon.length}
                </p>
              </div>
              {data.dueSoon.map((c) => <ClientRow key={c.id} client={c} />)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
