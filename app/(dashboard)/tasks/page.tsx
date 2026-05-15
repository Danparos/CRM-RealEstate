"use client";

import { useState, useEffect, useCallback } from "react";
import { CheckSquare, Plus, Calendar, User, Link2, Trash2, ChevronRight, AlertCircle, X } from "lucide-react";
import { getAllTasks, upsertTask, deleteTask } from "@/lib/db/tasks";
import { getAllClients } from "@/lib/db/clients";
import { getAllProperties } from "@/lib/db/properties";
import { getAllAgents } from "@/lib/db/agents";
import type { Task, Client, Property, Agent } from "@/types";
import { cn } from "@/lib/utils";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function generateId() {
  return `task-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function formatDate(d?: string) {
  if (!d) return null;
  const date = new Date(d + "T00:00:00");
  return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function isOverdue(d?: string) {
  if (!d) return false;
  return new Date(d + "T00:00:00") < new Date(new Date().toDateString());
}

// ─── Priority badge ───────────────────────────────────────────────────────────

const PRIORITY_STYLES: Record<Task["priority"], string> = {
  high:   "bg-red-50   text-red-700   border border-red-200",
  medium: "bg-amber-50 text-amber-700 border border-amber-200",
  low:    "bg-stone-100 text-stone-600 border border-stone-200",
};

const PRIORITY_LABELS: Record<Task["priority"], string> = {
  high: "High", medium: "Medium", low: "Low",
};

function PriorityBadge({ priority }: { priority: Task["priority"] }) {
  return (
    <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide", PRIORITY_STYLES[priority])}>
      {PRIORITY_LABELS[priority]}
    </span>
  );
}

// ─── Status columns config ────────────────────────────────────────────────────

const COLUMNS: { status: Task["status"]; label: string; bg: string; dot: string }[] = [
  { status: "todo",        label: "To Do",       bg: "bg-stone-50/60",  dot: "bg-stone-400"  },
  { status: "in_progress", label: "In Progress",  bg: "bg-amber-50/50",  dot: "bg-amber-400"  },
  { status: "done",        label: "Done",         bg: "bg-emerald-50/40", dot: "bg-emerald-400" },
];

// ─── Task Card ────────────────────────────────────────────────────────────────

interface TaskCardProps {
  task: Task;
  clients: Client[];
  properties: Property[];
  onEdit: (t: Task) => void;
  onDelete: (id: string) => void;
  onMove: (task: Task, status: Task["status"]) => void;
}

function TaskCard({ task, clients, properties, onEdit, onDelete, onMove }: TaskCardProps) {
  const client   = clients.find(c => c.id === task.clientId);
  const property = properties.find(p => p.id === task.propertyId);
  const overdue  = isOverdue(task.dueDate) && task.status !== "done";

  const nextStatus: Record<Task["status"], Task["status"] | null> = {
    todo: "in_progress",
    in_progress: "done",
    done: null,
  };
  const prevStatus: Record<Task["status"], Task["status"] | null> = {
    todo: null,
    in_progress: "todo",
    done: "in_progress",
  };

  return (
    <div
      className="group relative bg-white rounded-xl border border-warm-200 shadow-sm hover:shadow-md hover:border-[#B8960C]/30 transition-all duration-150 cursor-pointer p-4"
      onClick={() => onEdit(task)}
    >
      {/* Priority + Actions row */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <PriorityBadge priority={task.priority} />
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
          {prevStatus[task.status] && (
            <button
              title="Move back"
              onClick={() => onMove(task, prevStatus[task.status]!)}
              className="p-1 rounded hover:bg-stone-100 text-stone-400 hover:text-stone-600 transition-colors rotate-180"
            >
              <ChevronRight size={13} strokeWidth={2.5} />
            </button>
          )}
          {nextStatus[task.status] && (
            <button
              title={nextStatus[task.status] === "done" ? "Mark done" : "Start"}
              onClick={() => onMove(task, nextStatus[task.status]!)}
              className="p-1 rounded hover:bg-stone-100 text-stone-400 hover:text-[#B8960C] transition-colors"
            >
              <ChevronRight size={13} strokeWidth={2.5} />
            </button>
          )}
          <button
            title="Delete task"
            onClick={() => onDelete(task.id)}
            className="p-1 rounded hover:bg-red-50 text-stone-300 hover:text-red-500 transition-colors"
          >
            <Trash2 size={12} strokeWidth={2} />
          </button>
        </div>
      </div>

      {/* Title */}
      <p className={cn(
        "text-sm font-medium text-stone-800 leading-snug mb-2",
        task.status === "done" && "line-through text-stone-400"
      )}>
        {task.title}
      </p>

      {/* Description */}
      {task.description && (
        <p className="text-[11px] text-stone-400 leading-relaxed mb-3 line-clamp-2">{task.description}</p>
      )}

      {/* Meta */}
      <div className="flex flex-col gap-1.5 mt-auto">
        {task.dueDate && (
          <div className={cn("flex items-center gap-1.5 text-[11px]", overdue ? "text-red-500" : "text-stone-400")}>
            {overdue && <AlertCircle size={10} strokeWidth={2.5} />}
            {!overdue && <Calendar size={10} strokeWidth={2} />}
            <span>{formatDate(task.dueDate)}{overdue ? " · Overdue" : ""}</span>
          </div>
        )}
        {task.assignedTo && (
          <div className="flex items-center gap-1.5 text-[11px] text-stone-400">
            <User size={10} strokeWidth={2} />
            <span className="truncate">{task.assignedTo}</span>
          </div>
        )}
        {(client || property) && (
          <div className="flex items-center gap-1.5 text-[11px] text-[#B8960C]">
            <Link2 size={10} strokeWidth={2} />
            <span className="truncate">
              {client ? `${client.firstName} ${client.lastName}` : ""}
              {client && property ? " · " : ""}
              {property ? (property.title?.en ?? property.reference) : ""}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Task Modal ───────────────────────────────────────────────────────────────

const EMPTY_TASK: Omit<Task, "id"> = {
  title: "",
  description: "",
  dueDate: "",
  assignedTo: "",
  clientId: "",
  propertyId: "",
  status: "todo",
  priority: "medium",
};

interface TaskModalProps {
  task: Task | null;
  clients: Client[];
  properties: Property[];
  agents: Agent[];
  onSave: (t: Task) => void;
  onClose: () => void;
}

function TaskModal({ task, clients, properties, agents, onSave, onClose }: TaskModalProps) {
  const [form, setForm] = useState<Omit<Task, "id">>(() =>
    task ? {
      title:       task.title,
      description: task.description ?? "",
      dueDate:     task.dueDate     ?? "",
      assignedTo:  task.assignedTo  ?? "",
      clientId:    task.clientId    ?? "",
      propertyId:  task.propertyId  ?? "",
      status:      task.status,
      priority:    task.priority,
    } : { ...EMPTY_TASK }
  );

  const isEdit = !!task;

  function handleSave() {
    if (!form.title.trim()) return;
    const saved: Task = {
      id: task?.id ?? generateId(),
      ...form,
      title:       form.title.trim(),
      description: form.description?.trim() || undefined,
      dueDate:     form.dueDate     || undefined,
      assignedTo:  form.assignedTo?.trim() || undefined,
      clientId:    form.clientId    || undefined,
      propertyId:  form.propertyId  || undefined,
    };
    onSave(saved);
  }

  const inputCls = "w-full rounded-lg border border-warm-200 bg-white px-3 py-2 text-sm text-stone-800 placeholder:text-stone-300 focus:outline-none focus:ring-2 focus:ring-[#B8960C]/30 focus:border-[#B8960C] transition-colors";
  const labelCls = "block text-[11px] font-semibold uppercase tracking-wider text-stone-400 mb-1";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" onClick={onClose} />

      <div className="relative z-10 w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-warm-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-warm-100 bg-stone-50/60">
          <div className="flex items-center gap-2">
            <CheckSquare size={16} strokeWidth={2} className="text-[#B8960C]" />
            <h2 className="text-[15px] font-semibold text-stone-800">{isEdit ? "Edit Task" : "New Task"}</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-400 hover:text-stone-600 transition-colors">
            <X size={16} strokeWidth={2} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Title */}
          <div>
            <label className={labelCls}>Title <span className="text-red-400">*</span></label>
            <input
              className={inputCls}
              placeholder="Task title..."
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              autoFocus
            />
          </div>

          {/* Description */}
          <div>
            <label className={labelCls}>Description</label>
            <textarea
              className={cn(inputCls, "resize-none h-20")}
              placeholder="Add details..."
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            />
          </div>

          {/* Priority + Status */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Priority</label>
              <select
                className={inputCls}
                value={form.priority}
                onChange={e => setForm(f => ({ ...f, priority: e.target.value as Task["priority"] }))}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>Status</label>
              <select
                className={inputCls}
                value={form.status}
                onChange={e => setForm(f => ({ ...f, status: e.target.value as Task["status"] }))}
              >
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </div>
          </div>

          {/* Due Date + Assigned To */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Due Date</label>
              <input
                type="date"
                className={inputCls}
                value={form.dueDate ?? ""}
                onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))}
              />
            </div>
            <div>
              <label className={labelCls}>Assigned To</label>
              <select
                className={inputCls}
                value={form.assignedTo ?? ""}
                onChange={e => setForm(f => ({ ...f, assignedTo: e.target.value }))}
              >
                <option value="">Unassigned</option>
                {agents.filter(a => a.active !== false).map(a => (
                  <option key={a.id} value={a.name}>{a.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Client */}
          <div>
            <label className={labelCls}>Linked Client</label>
            <select
              className={inputCls}
              value={form.clientId ?? ""}
              onChange={e => setForm(f => ({ ...f, clientId: e.target.value }))}
            >
              <option value="">None</option>
              {clients.map(c => (
                <option key={c.id} value={c.id}>{c.firstName} {c.lastName}</option>
              ))}
            </select>
          </div>

          {/* Property */}
          <div>
            <label className={labelCls}>Linked Property</label>
            <select
              className={inputCls}
              value={form.propertyId ?? ""}
              onChange={e => setForm(f => ({ ...f, propertyId: e.target.value }))}
            >
              <option value="">None</option>
              {properties.map(p => (
                <option key={p.id} value={p.id}>{p.reference} — {p.title?.en ?? p.area}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 px-6 py-4 border-t border-warm-100 bg-stone-50/60">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-medium text-stone-500 hover:bg-stone-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!form.title.trim()}
            className="px-5 py-2 rounded-lg text-sm font-semibold text-white bg-[#B8960C] hover:bg-[#a07c0a] disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm"
          >
            {isEdit ? "Save Changes" : "Create Task"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function TasksPage() {
  const [tasks,      setTasks]      = useState<Task[]>([]);
  const [clients,    setClients]    = useState<Client[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [agents,     setAgents]     = useState<Agent[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [saveError,  setSaveError]  = useState<string | null>(null);
  const [modal,      setModal]      = useState<{ open: boolean; task: Task | null }>({ open: false, task: null });

  const load = useCallback(async () => {
    setLoading(true);
    const [t, c, p, a] = await Promise.all([getAllTasks(), getAllClients(), getAllProperties(), getAllAgents()]);
    setTasks(t);
    setClients(c);
    setProperties(p);
    setAgents(a);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleSave(task: Task) {
    try {
      setSaveError(null);
      await upsertTask(task);
      setModal({ open: false, task: null });
      await load();
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Failed to save task");
    }
  }

  async function handleDelete(id: string) {
    await deleteTask(id);
    setTasks(prev => prev.filter(t => t.id !== id));
  }

  async function handleMove(task: Task, status: Task["status"]) {
    const updated = { ...task, status };
    setTasks(prev => prev.map(t => t.id === task.id ? updated : t));
    await upsertTask(updated);
  }

  const [agentFilter, setAgentFilter] = useState<string>("");

  const visibleTasks = agentFilter
    ? tasks.filter(t => t.assignedTo === agentFilter)
    : tasks;

  const tasksByStatus = (status: Task["status"]) => visibleTasks.filter(t => t.status === status);

  // For the "All Agents" view: group tasks by agent within a column
  function getAgentGroups(status: Task["status"]) {
    const statusTasks = tasks.filter(t => t.status === status);
    const seen = new Set<string>();
    const order: (string | null)[] = [];
    for (const t of statusTasks) {
      const key = t.assignedTo ?? "";
      if (!seen.has(key)) { seen.add(key); order.push(t.assignedTo ?? null); }
    }
    // Named agents first (sorted), unassigned last
    const named = order.filter((n): n is string => n !== null).sort();
    const hasUnassigned = order.includes(null);
    return [
      ...named.map(name => ({ name, tasks: statusTasks.filter(t => t.assignedTo === name) })),
      ...(hasUnassigned ? [{ name: null, tasks: statusTasks.filter(t => !t.assignedTo) }] : []),
    ];
  }

  const totalCount   = tasks.length;
  const doneCount    = tasks.filter(t => t.status === "done").length;
  const overdueCount = tasks.filter(t => isOverdue(t.dueDate) && t.status !== "done").length;

  return (
    <div className="min-h-screen bg-[#FAF9F7]">
      {/* Page Header */}
      <div className="border-b border-warm-200 bg-white">
        <div className="max-w-[1400px] mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#B8960C]/10">
                <CheckSquare size={18} strokeWidth={1.75} className="text-[#B8960C]" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-stone-900 tracking-tight">Tasks</h1>
                <p className="text-[12px] text-stone-400 mt-0.5">
                  {totalCount} total · {doneCount} done
                  {overdueCount > 0 && (
                    <span className="ml-2 text-red-500 font-medium">{overdueCount} overdue</span>
                  )}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <select
                value={agentFilter}
                onChange={e => setAgentFilter(e.target.value)}
                className="h-9 rounded-lg border border-stone-200 bg-white px-3 text-sm text-stone-700 outline-none focus:border-[#B8960C] focus:ring-2 focus:ring-[#B8960C]/20 transition-all appearance-none cursor-pointer"
              >
                <option value="">All Agents</option>
                {agents.filter(a => a.active !== false).map(a => (
                  <option key={a.id} value={a.name}>{a.name}</option>
                ))}
              </select>
            <button
              onClick={() => setModal({ open: true, task: null })}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#B8960C] text-white text-sm font-semibold shadow-sm hover:bg-[#a07c0a] transition-colors"
            >
              <Plus size={15} strokeWidth={2.5} />
              Add Task
            </button>
            </div>
          </div>
        </div>
      </div>

      {/* Error banner */}
      {saveError && (
        <div className="max-w-[1400px] mx-auto px-6 pt-4">
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
            <AlertCircle size={15} className="shrink-0" />
            <span className="font-medium">Error saving task:</span> {saveError}
            <button onClick={() => setSaveError(null)} className="ml-auto text-red-400 hover:text-red-600"><X size={14} /></button>
          </div>
        </div>
      )}

      {/* Kanban Board */}
      <div className="max-w-[1400px] mx-auto px-6 py-6">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="h-7 w-7 rounded-full border-2 border-[#B8960C] border-t-transparent animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {COLUMNS.map(({ status, label, bg, dot }) => {
              const col = tasksByStatus(status);
              const groups = agentFilter ? null : getAgentGroups(status);
              const totalInCol = agentFilter ? col.length : tasks.filter(t => t.status === status).length;
              return (
                <div key={status} className={cn("rounded-2xl p-4", bg, "border border-warm-200/60 min-h-[200px]")}>
                  {/* Column Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className={cn("h-2.5 w-2.5 rounded-full", dot)} />
                      <h2 className="text-sm font-semibold text-stone-700 tracking-wide">{label}</h2>
                    </div>
                    <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-white border border-warm-200 text-[11px] font-semibold text-stone-500 px-1.5">
                      {totalInCol}
                    </span>
                  </div>

                  {/* Cards — grouped by agent when no filter active */}
                  {groups ? (
                    groups.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-10 text-center">
                        <p className="text-[11px] text-stone-300 font-medium">No tasks here</p>
                        {status === "todo" && (
                          <button onClick={() => setModal({ open: true, task: null })} className="mt-2 text-[11px] text-[#B8960C] hover:underline">+ Add one</button>
                        )}
                      </div>
                    ) : (
                      <div className="flex flex-col gap-4">
                        {groups.map(({ name, tasks: groupTasks }) => (
                          <div key={name ?? "__unassigned__"}>
                            {/* Agent sub-header */}
                            <div className="flex items-center gap-1.5 mb-2">
                              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#B8960C]/10 shrink-0">
                                <User size={10} strokeWidth={2} className="text-[#B8960C]" />
                              </div>
                              <span className="text-[11px] font-semibold text-stone-500 tracking-wide truncate">
                                {name ?? "Unassigned"}
                              </span>
                              <span className="ml-auto text-[10px] font-semibold text-stone-400 shrink-0">{groupTasks.length}</span>
                            </div>
                            <div className="flex flex-col gap-2">
                              {groupTasks.map(task => (
                                <TaskCard
                                  key={task.id}
                                  task={task}
                                  clients={clients}
                                  properties={properties}
                                  onEdit={t => setModal({ open: true, task: t })}
                                  onDelete={handleDelete}
                                  onMove={handleMove}
                                />
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )
                  ) : (
                    <div className="flex flex-col gap-3">
                      {col.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-10 text-center">
                          <p className="text-[11px] text-stone-300 font-medium">No tasks here</p>
                          {status === "todo" && (
                            <button onClick={() => setModal({ open: true, task: null })} className="mt-2 text-[11px] text-[#B8960C] hover:underline">+ Add one</button>
                          )}
                        </div>
                      ) : (
                        col.map(task => (
                          <TaskCard
                            key={task.id}
                            task={task}
                            clients={clients}
                            properties={properties}
                            onEdit={t => setModal({ open: true, task: t })}
                            onDelete={handleDelete}
                            onMove={handleMove}
                          />
                        ))
                      )}
                    </div>
                  )}

                  {/* Add at bottom of To Do / In Progress */}
                  {status !== "done" && totalInCol > 0 && (
                    <button
                      onClick={() => setModal({ open: true, task: null })}
                      className="mt-3 w-full flex items-center justify-center gap-1.5 rounded-lg border border-dashed border-warm-300 py-2 text-[11px] text-stone-400 hover:border-[#B8960C]/40 hover:text-[#B8960C] transition-colors"
                    >
                      <Plus size={11} strokeWidth={2.5} />
                      Add task
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal */}
      {modal.open && (
        <TaskModal
          task={modal.task}
          clients={clients}
          properties={properties}
          agents={agents}
          onSave={handleSave}
          onClose={() => setModal({ open: false, task: null })}
        />
      )}
    </div>
  );
}
