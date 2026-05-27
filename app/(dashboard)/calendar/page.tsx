"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Pencil, Trash2, X, CalendarDays, MapPin } from "lucide-react";
import { getAllAppointments, createAppointment, updateAppointment, deleteAppointment } from "@/lib/db/appointments";
import { getAllClients } from "@/lib/db/clients";
import { getAllAgents } from "@/lib/db/agents";
import type { Appointment } from "@/lib/db/appointments";
import type { Client, Agent } from "@/types";
import { cn } from "@/lib/utils";

type AppointmentType = Appointment["type"];

const TYPE_CONFIG: Record<AppointmentType, { label: string; bg: string; text: string; dot: string }> = {
  viewing:   { label: "Viewing",   bg: "bg-indigo-50",  text: "text-indigo-700",  dot: "bg-indigo-400"  },
  call:      { label: "Call",      bg: "bg-sky-50",     text: "text-sky-700",     dot: "bg-sky-400"     },
  meeting:   { label: "Meeting",   bg: "bg-violet-50",  text: "text-violet-700",  dot: "bg-violet-400"  },
  signing:   { label: "Signing",   bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-400" },
  follow_up: { label: "Follow-up", bg: "bg-amber-50",   text: "text-amber-700",   dot: "bg-amber-400"   },
};

const EMPTY_FORM = {
  date: "",
  time: "",
  type: "viewing" as AppointmentType,
  clientName: "",
  clientId: "",
  agentName: "",
  note: "",
  location: "",
};

function formatDayHeader(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00Z");
  return d.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
}

function groupByDate(appointments: Appointment[]): Map<string, Appointment[]> {
  const sorted = [...appointments].sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time));
  const map = new Map<string, Appointment[]>();
  for (const apt of sorted) {
    if (!map.has(apt.date)) map.set(apt.date, []);
    map.get(apt.date)!.push(apt);
  }
  return map;
}

function isToday(dateStr: string): boolean {
  return new Date().toISOString().slice(0, 10) === dateStr;
}

function isPast(dateStr: string): boolean {
  return dateStr < new Date().toISOString().slice(0, 10);
}

export default function CalendarPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [clients,      setClients]      = useState<Client[]>([]);
  const [agents,       setAgents]       = useState<Agent[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [modalOpen,    setModalOpen]    = useState(false);
  const [editing,      setEditing]      = useState<Appointment | null>(null);
  const [form,         setForm]         = useState(EMPTY_FORM);
  const [saving,       setSaving]       = useState(false);
  const [deleting,     setDeleting]     = useState<string | null>(null);
  const [showPast,     setShowPast]     = useState(false);

  useEffect(() => {
    Promise.all([getAllAppointments(), getAllClients(), getAllAgents()]).then(([apts, cls, ags]) => {
      setAppointments(apts);
      setClients(cls);
      setAgents(ags);
      setLoading(false);
    });
  }, []);

  function openCreate() {
    setEditing(null);
    setForm({ ...EMPTY_FORM, date: new Date().toISOString().slice(0, 10) });
    setModalOpen(true);
  }

  function openEdit(apt: Appointment) {
    setEditing(apt);
    setForm({
      date:       apt.date,
      time:       apt.time,
      type:       apt.type,
      clientName: apt.clientName,
      clientId:   apt.clientId ?? "",
      agentName:  apt.agentName,
      note:       apt.note,
      location:   apt.location ?? "",
    });
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditing(null);
    setForm(EMPTY_FORM);
  }

  function handleClientSelect(clientId: string) {
    const client = clients.find(c => c.id === clientId);
    setForm(f => ({
      ...f,
      clientId,
      clientName: client ? `${client.firstName} ${client.lastName}` : f.clientName,
    }));
  }

  async function handleSave() {
    if (!form.date || !form.time || !form.clientName.trim() || !form.agentName.trim() || !form.note.trim()) return;
    setSaving(true);
    const payload = {
      date:       form.date,
      time:       form.time,
      type:       form.type,
      clientName: form.clientName.trim(),
      clientId:   form.clientId || undefined,
      agentName:  form.agentName.trim(),
      note:       form.note.trim(),
      location:   form.location.trim() || undefined,
    };
    if (editing) {
      const ok = await updateAppointment(editing.id, payload);
      if (ok) setAppointments(prev => prev.map(a => a.id === editing.id ? { ...editing, ...payload } : a));
    } else {
      const created = await createAppointment(payload);
      if (created) setAppointments(prev => [...prev, created]);
    }
    setSaving(false);
    closeModal();
  }

  async function handleDelete(id: string) {
    setDeleting(id);
    const ok = await deleteAppointment(id);
    if (ok) setAppointments(prev => prev.filter(a => a.id !== id));
    setDeleting(null);
  }

  const filtered = showPast ? appointments : appointments.filter(a => !isPast(a.date));
  const grouped  = groupByDate(filtered);
  const pastCount = appointments.filter(a => isPast(a.date)).length;

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-serif text-[28px] font-semibold text-stone-900 leading-tight">Calendar</h1>
          <p className="mt-0.5 text-sm text-stone-500">Appointments & viewings</p>
        </div>
        <div className="flex items-center gap-3">
          {pastCount > 0 && (
            <button
              onClick={() => setShowPast(p => !p)}
              className="text-xs text-stone-400 hover:text-stone-600 transition-colors"
            >
              {showPast ? "Hide past" : `Show ${pastCount} past`}
            </button>
          )}
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 h-9 px-4 rounded-lg bg-[#B8960C] text-white text-sm font-semibold hover:bg-[#9a7a0a] transition-colors shadow-sm"
          >
            <Plus size={14} strokeWidth={2.5} />
            New Appointment
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-2">
        {(Object.entries(TYPE_CONFIG) as [AppointmentType, typeof TYPE_CONFIG[AppointmentType]][]).map(([type, cfg]) => (
          <span key={type} className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${cfg.bg} ${cfg.text}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
            {cfg.label}
          </span>
        ))}
      </div>

      {/* Appointment list */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="h-7 w-7 rounded-full border-2 border-[#B8960C] border-t-transparent animate-spin" />
        </div>
      ) : grouped.size === 0 ? (
        <div className="text-center py-16 text-stone-400">
          <CalendarDays size={40} strokeWidth={1} className="mx-auto mb-3 opacity-40" />
          <p className="text-sm font-medium">No upcoming appointments</p>
          <button onClick={openCreate} className="mt-3 text-[#B8960C] text-sm font-semibold hover:underline">Add one now</button>
        </div>
      ) : (
        <div className="space-y-8">
          {Array.from(grouped.entries()).map(([date, apts]) => (
            <div key={date}>
              <div className="flex items-center gap-3 mb-3">
                <div className="h-px flex-1 bg-stone-200" />
                <h2 className={cn(
                  "font-serif text-[13px] font-semibold whitespace-nowrap px-2 py-0.5 rounded-full",
                  isToday(date) ? "bg-[#B8960C] text-white" : "text-stone-500"
                )}>
                  {isToday(date) ? "Today — " : ""}{formatDayHeader(date)}
                </h2>
                <div className="h-px flex-1 bg-stone-200" />
              </div>

              <div className="space-y-2.5">
                {apts.map(apt => {
                  const tc = TYPE_CONFIG[apt.type];
                  return (
                    <div
                      key={apt.id}
                      className={cn(
                        "group bg-white rounded-xl border shadow-sm px-5 py-4 flex items-start gap-4 transition-all",
                        isPast(date) ? "opacity-60 border-stone-100" : "border-stone-200 hover:border-stone-300 hover:shadow-md"
                      )}
                    >
                      {/* Time */}
                      <div className="shrink-0 mt-0.5">
                        <span className="inline-flex items-center justify-center w-14 py-1.5 rounded-lg bg-stone-100 text-xs font-semibold text-stone-700 tabular-nums">
                          {apt.time}
                        </span>
                      </div>

                      {/* Type badge */}
                      <div className="shrink-0 mt-0.5">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${tc.bg} ${tc.text}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${tc.dot}`} />
                          {tc.label}
                        </span>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          {apt.clientId ? (
                            <Link href={`/clients/${apt.clientId}`} className="text-[15px] font-semibold text-stone-900 hover:text-[#B8960C] transition-colors leading-tight">
                              {apt.clientName}
                            </Link>
                          ) : (
                            <span className="text-[15px] font-semibold text-stone-900 leading-tight">{apt.clientName}</span>
                          )}
                          {apt.location && (
                            <span className="flex items-center gap-1 text-xs text-stone-400">
                              <MapPin size={10} strokeWidth={1.5} />{apt.location}
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-sm text-stone-500 leading-snug">{apt.note}</p>
                        <p className="mt-1.5 text-[11px] text-stone-400 font-medium">{apt.agentName}</p>
                      </div>

                      {/* Actions */}
                      <div className="shrink-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity mt-0.5">
                        <button
                          onClick={() => openEdit(apt)}
                          className="h-7 w-7 flex items-center justify-center rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
                          title="Edit"
                        >
                          <Pencil size={13} strokeWidth={2} />
                        </button>
                        <button
                          onClick={() => handleDelete(apt.id)}
                          disabled={deleting === apt.id}
                          className="h-7 w-7 flex items-center justify-center rounded-lg text-stone-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                          title="Delete"
                        >
                          {deleting === apt.id
                            ? <span className="h-3 w-3 rounded-full border border-red-300 border-t-transparent animate-spin" />
                            : <Trash2 size={13} strokeWidth={2} />
                          }
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(28,20,10,0.5)", backdropFilter: "blur(4px)" }}
          onClick={e => { if (e.target === e.currentTarget) closeModal(); }}
        >
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden">
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 bg-gradient-to-r from-stone-50 to-white">
              <h2 className="font-serif text-lg font-semibold text-stone-900">
                {editing ? "Edit Appointment" : "New Appointment"}
              </h2>
              <button onClick={closeModal} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-stone-100 text-stone-400 text-xl">×</button>
            </div>

            <div className="px-6 py-5 space-y-4">
              {/* Date + Time */}
              <div className="grid grid-cols-2 gap-3">
                <label className="flex flex-col gap-1.5">
                  <span className="text-[10px] uppercase tracking-wider font-semibold text-stone-400">Date</span>
                  <input
                    type="date"
                    value={form.date}
                    onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                    className="rounded-xl border border-stone-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#B8960C]/40"
                  />
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="text-[10px] uppercase tracking-wider font-semibold text-stone-400">Time</span>
                  <input
                    type="time"
                    value={form.time}
                    onChange={e => setForm(f => ({ ...f, time: e.target.value }))}
                    className="rounded-xl border border-stone-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#B8960C]/40"
                  />
                </label>
              </div>

              {/* Type */}
              <label className="flex flex-col gap-1.5">
                <span className="text-[10px] uppercase tracking-wider font-semibold text-stone-400">Type</span>
                <select
                  value={form.type}
                  onChange={e => setForm(f => ({ ...f, type: e.target.value as AppointmentType }))}
                  className="rounded-xl border border-stone-200 px-3 py-2.5 text-sm text-stone-800 focus:outline-none focus:ring-1 focus:ring-[#B8960C]/40"
                >
                  {(Object.entries(TYPE_CONFIG) as [AppointmentType, typeof TYPE_CONFIG[AppointmentType]][]).map(([type, cfg]) => (
                    <option key={type} value={type}>{cfg.label}</option>
                  ))}
                </select>
              </label>

              {/* Client */}
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] uppercase tracking-wider font-semibold text-stone-400">Client</span>
                <select
                  value={form.clientId}
                  onChange={e => handleClientSelect(e.target.value)}
                  className="rounded-xl border border-stone-200 px-3 py-2.5 text-sm text-stone-800 focus:outline-none focus:ring-1 focus:ring-[#B8960C]/40"
                >
                  <option value="">— Select client or enter manually —</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>{c.firstName} {c.lastName}</option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Or enter client name manually"
                  value={form.clientName}
                  onChange={e => setForm(f => ({ ...f, clientName: e.target.value, clientId: "" }))}
                  className="rounded-xl border border-stone-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#B8960C]/40"
                />
              </div>

              {/* Agent */}
              <label className="flex flex-col gap-1.5">
                <span className="text-[10px] uppercase tracking-wider font-semibold text-stone-400">Agent</span>
                <select
                  value={form.agentName}
                  onChange={e => setForm(f => ({ ...f, agentName: e.target.value }))}
                  className="rounded-xl border border-stone-200 px-3 py-2.5 text-sm text-stone-800 focus:outline-none focus:ring-1 focus:ring-[#B8960C]/40"
                >
                  <option value="">— Select agent —</option>
                  {agents.map(a => (
                    <option key={a.id} value={a.name}>{a.name}</option>
                  ))}
                </select>
              </label>

              {/* Location */}
              <label className="flex flex-col gap-1.5">
                <span className="text-[10px] uppercase tracking-wider font-semibold text-stone-400">Location <span className="font-normal normal-case text-stone-300">(optional)</span></span>
                <input
                  type="text"
                  placeholder="e.g. Naoussa, Paros"
                  value={form.location}
                  onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                  className="rounded-xl border border-stone-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#B8960C]/40"
                />
              </label>

              {/* Note */}
              <label className="flex flex-col gap-1.5">
                <span className="text-[10px] uppercase tracking-wider font-semibold text-stone-400">Notes</span>
                <textarea
                  rows={3}
                  placeholder="What is this appointment about?"
                  value={form.note}
                  onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
                  className="rounded-xl border border-stone-200 px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-[#B8960C]/40"
                />
              </label>
            </div>

            <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-stone-100 bg-stone-50/50">
              <button onClick={closeModal} className="px-4 py-2 text-[12px] font-semibold text-stone-500 hover:text-stone-700">Cancel</button>
              <button
                onClick={handleSave}
                disabled={saving || !form.date || !form.time || !form.clientName.trim() || !form.agentName.trim() || !form.note.trim()}
                className={cn(
                  "px-5 py-2.5 rounded-xl text-[13px] font-semibold transition-all",
                  !saving && form.date && form.time && form.clientName.trim() && form.agentName.trim() && form.note.trim()
                    ? "bg-[#B8960C] text-white hover:bg-[#9a7a0a]"
                    : "bg-stone-200 text-stone-400 cursor-not-allowed"
                )}
              >
                {saving ? "Saving…" : editing ? "Save Changes" : "Create Appointment"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
