"use client";

import { useState } from "react";
import { Plus, X, Send, Loader2, CheckCircle } from "lucide-react";
import type { Agent, UserRole } from "@/types";
import { ROLE_CONFIG, LANGUAGE_OPTIONS } from "@/lib/agents-config";

const ROLES: UserRole[] = ["admin", "office_manager", "senior_agent", "agent", "support"];

const inp = "h-10 w-full rounded-lg border border-stone-200 bg-white px-3 text-sm text-stone-800 outline-none focus:border-[#B8960C] focus:ring-2 focus:ring-[#B8960C]/20 transition-all";
const sel = inp + " appearance-none cursor-pointer";

interface Props {
  agent?: Agent;
  nextId: string;
  onSave: (agent: Agent) => void;
  onCancel: () => void;
}

export function AgentForm({ agent, nextId, onSave, onCancel }: Props) {
  const isNew = !agent;
  const [form, setForm] = useState({
    name:      agent?.name      ?? "",
    email:     agent?.email     ?? "",
    phone:     agent?.phone     ?? "",
    role:      (agent?.role     ?? "agent") as UserRole,
    languages: agent?.languages ?? [] as string[],
    active:    agent?.active    ?? true,
  });
  const [newLang, setNewLang] = useState("");
  const [sendInvite, setSendInvite] = useState(isNew);
  const [inviteState, setInviteState] = useState<"idle" | "sending" | "sent" | "error">("idle");

  const set = <K extends keyof typeof form>(k: K, v: typeof form[K]) =>
    setForm(p => ({ ...p, [k]: v }));

  const addLang = (val: string) => {
    if (val && !form.languages.includes(val)) {
      set("languages", [...form.languages, val]);
      setNewLang("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const saved: Agent = {
      id:        agent?.id ?? nextId,
      createdAt: agent?.createdAt ?? new Date().toISOString().slice(0, 10),
      ...form,
    };
    onSave(saved);
    if (isNew && sendInvite && form.email) {
      setInviteState("sending");
      try {
        const res = await fetch("/api/admin/invite", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: form.email, name: form.name, role: form.role }),
        });
        const json = await res.json() as { error?: string };
        if (!res.ok) throw new Error(json.error ?? "Failed");
        setInviteState("sent");
      } catch {
        setInviteState("error");
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-stone-400 mb-1.5">Full Name *</label>
          <input type="text" required value={form.name} onChange={e => set("name", e.target.value)} className={inp} placeholder="e.g. Maria Antoniadou" />
        </div>
        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-stone-400 mb-1.5">Email *</label>
          <input type="email" required value={form.email} onChange={e => set("email", e.target.value)} className={inp} placeholder="email@agency.gr" />
        </div>
        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-stone-400 mb-1.5">Phone</label>
          <input type="tel" value={form.phone} onChange={e => set("phone", e.target.value)} className={inp} placeholder="+30 694 ..." />
        </div>
        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-stone-400 mb-1.5">Role *</label>
          <select required value={form.role} onChange={e => set("role", e.target.value as UserRole)} className={sel}>
            {ROLES.map(r => (
              <option key={r} value={r}>{ROLE_CONFIG[r].label}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-3 pt-6">
          <button type="button" onClick={() => set("active", !form.active)}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${form.active ? "bg-[#B8960C]" : "bg-stone-300"}`}>
            <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${form.active ? "translate-x-5" : "translate-x-0"}`} />
          </button>
          <span className="text-sm text-stone-700">{form.active ? "Active" : "Inactive"}</span>
        </div>
      </div>

      <div>
        <label className="block text-[11px] font-semibold uppercase tracking-wider text-stone-400 mb-1.5">Languages</label>
        <div className="flex flex-wrap gap-1.5 mb-2">
          {form.languages.map(lang => (
            <span key={lang} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs bg-stone-100 text-stone-700 border border-stone-200">
              {lang}
              <button type="button" onClick={() => set("languages", form.languages.filter(l => l !== lang))}
                className="ml-0.5 text-stone-400 hover:text-red-500 transition-colors">
                <X size={10} strokeWidth={2.5} />
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <select value={newLang} onChange={e => { if (e.target.value) addLang(e.target.value); setNewLang(""); }} className={`${sel} flex-1`}>
            <option value="">+ Add language…</option>
            {LANGUAGE_OPTIONS.filter(l => !form.languages.includes(l)).map(l => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
          <input type="text" value={newLang} onChange={e => setNewLang(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addLang(newLang); }}}
            placeholder="Or type…" className={`${inp} w-36`} />
          <button type="button" onClick={() => addLang(newLang)}
            className="shrink-0 inline-flex items-center justify-center h-10 w-10 rounded-lg border border-stone-200 text-stone-400 hover:border-[#B8960C] hover:text-[#B8960C] transition-colors">
            <Plus size={14} strokeWidth={2} />
          </button>
        </div>
      </div>

      {/* Invite toggle — new agents only */}
      {isNew && (
        <div className="flex items-center gap-3 py-3 px-4 rounded-xl bg-stone-50 border border-stone-200">
          <button
            type="button"
            onClick={() => setSendInvite(v => !v)}
            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${sendInvite ? "bg-[#B8960C]" : "bg-stone-300"}`}
          >
            <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${sendInvite ? "translate-x-4" : "translate-x-0"}`} />
          </button>
          <div className="flex-1">
            <p className="text-sm font-medium text-stone-700">Send invite email</p>
            <p className="text-xs text-stone-400">Agent will receive a link to set their password</p>
          </div>
          {inviteState === "sending" && <Loader2 size={14} className="animate-spin text-stone-400" />}
          {inviteState === "sent" && <CheckCircle size={14} className="text-green-500" />}
          {inviteState === "error" && <Send size={14} className="text-red-400" />}
        </div>
      )}

      <div className="flex gap-3 pt-2 border-t border-stone-100">
        <button type="submit"
          className="inline-flex items-center gap-2 h-10 px-6 rounded-lg bg-[#B8960C] text-white text-sm font-semibold hover:bg-[#9e7f0a] transition-colors shadow-sm">
          {agent ? "Save Changes" : "Add Agent"}
        </button>
        <button type="button" onClick={onCancel}
          className="h-10 px-5 rounded-lg text-sm font-medium text-stone-500 hover:text-stone-700 border border-stone-200 hover:border-stone-300 transition-colors">
          Cancel
        </button>
      </div>
    </form>
  );
}
