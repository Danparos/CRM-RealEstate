"use client";

import { useState, useEffect } from "react";
import { Plus, Pencil, Mail, Phone, Globe, Trash2, X, Send, Loader2, CheckCircle, Link, Copy } from "lucide-react";
import type { Agent } from "@/types";
import { ROLE_CONFIG } from "@/lib/agents-config";
import { getAllAgents, upsertAgent, deleteAgent, nextAgentId } from "@/lib/db/agents";
import { AgentForm } from "@/components/admin/agent-form";

function initials(name: string) {
  return name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
}

type InviteState = "idle" | "sending" | "sent" | "error";

export function AgentsClient() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [editAgent, setEditAgent] = useState<Agent | null | "new">(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [inviteStates, setInviteStates] = useState<Record<string, InviteState>>({});

  const sendInvite = async (agent: Agent) => {
    setInviteStates(s => ({ ...s, [agent.id]: "sending" }));
    try {
      const res = await fetch("/api/admin/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: agent.email, name: agent.name, role: agent.role }),
      });
      const json = await res.json() as { error?: string };
      if (!res.ok) throw new Error(json.error ?? "Failed");
      setInviteStates(s => ({ ...s, [agent.id]: "sent" }));
      setTimeout(() => setInviteStates(s => ({ ...s, [agent.id]: "idle" })), 3000);
    } catch {
      setInviteStates(s => ({ ...s, [agent.id]: "error" }));
      setTimeout(() => setInviteStates(s => ({ ...s, [agent.id]: "idle" })), 3000);
    }
  };

  useEffect(() => {
    getAllAgents().then(setAgents).finally(() => setLoading(false));
  }, []);

  const handleSave = async (saved: Agent) => {
    await upsertAgent(saved);
    const exists = agents.find(a => a.id === saved.id);
    setAgents(exists ? agents.map(a => a.id === saved.id ? saved : a) : [...agents, saved]);
    setEditAgent(null);
  };

  const handleDelete = async (id: string) => {
    await deleteAgent(id);
    setAgents(agents.filter(a => a.id !== id));
    setDeleteConfirm(null);
  };

  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyLeadLink = (agent: Agent) => {
    const base = typeof window !== "undefined" ? window.location.origin : "";
    const url = `${base}/lead?agent=${agent.id}&agentName=${encodeURIComponent(agent.name)}`;
    navigator.clipboard.writeText(url);
    setCopiedId(agent.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const roleCounts = agents.reduce<Record<string, number>>((acc, a) => {
    acc[a.role] = (acc[a.role] ?? 0) + 1;
    return acc;
  }, {});

  if (loading) return <div className="text-sm text-stone-400 py-8 text-center">Loading agents…</div>;

  return (
    <div className="space-y-6">

      {/* Stats bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {(["admin", "office_manager", "senior_agent", "agent", "support"] as const).map(role => {
          const cfg = ROLE_CONFIG[role];
          return (
            <div key={role} className="bg-white rounded-xl border border-stone-200 shadow-sm px-4 py-3 flex items-center gap-3">
              <span className={`h-2.5 w-2.5 rounded-full shrink-0 ${cfg.dotClass}`} />
              <div>
                <p className="text-[10px] uppercase tracking-wider text-stone-400 font-semibold leading-none">{cfg.label}</p>
                <p className="text-xl font-bold text-stone-900 leading-tight mt-0.5">{roleCounts[role] ?? 0}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Agent grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {agents.map(agent => {
          const cfg = ROLE_CONFIG[agent.role];
          const isActive = agent.active !== false;
          return (
            <div key={agent.id} className={`bg-white rounded-xl border shadow-sm overflow-hidden transition-all hover:shadow-md ${isActive ? "border-stone-200" : "border-stone-100 opacity-60"}`}>
              <div className="p-5">
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-[#B8960C]/10 flex items-center justify-center shrink-0 border border-[#B8960C]/20">
                      <span className="text-base font-bold text-[#B8960C]">{initials(agent.name)}</span>
                    </div>
                    <div>
                      <p className="font-serif text-base font-bold text-stone-900 leading-tight">{agent.name}</p>
                      {!isActive && <span className="text-[10px] text-red-400 font-medium">Inactive</span>}
                    </div>
                  </div>
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold border shrink-0 ${cfg.badgeClass}`}>
                    {cfg.label}
                  </span>
                </div>

                <div className="space-y-1.5 text-sm">
                  <div className="flex items-center gap-2 text-stone-600">
                    <Mail size={13} className="text-stone-400 shrink-0" />
                    <span className="truncate text-xs">{agent.email}</span>
                  </div>
                  {agent.phone && (
                    <div className="flex items-center gap-2 text-stone-600">
                      <Phone size={13} className="text-stone-400 shrink-0" />
                      <span className="text-xs">{agent.phone}</span>
                    </div>
                  )}
                  {agent.languages.length > 0 && (
                    <div className="flex items-center gap-2">
                      <Globe size={13} className="text-stone-400 shrink-0 mt-0.5" />
                      <div className="flex flex-wrap gap-1">
                        {agent.languages.map(lang => (
                          <span key={lang} className="inline-flex px-1.5 py-0.5 rounded text-[10px] font-medium bg-stone-100 text-stone-600 border border-stone-200">{lang}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="px-5 py-3 border-t border-stone-100 bg-stone-50/50 flex items-center justify-between">
                <span className="text-[10px] text-stone-400">
                  {agent.createdAt ? `Since ${new Date(agent.createdAt).toLocaleDateString("en-GB", { month: "short", year: "numeric" })}` : ""}
                </span>
                <div className="flex items-center gap-1.5">
                  <button onClick={() => setDeleteConfirm(agent.id)}
                    className="p-1.5 rounded-lg text-stone-300 hover:text-red-500 hover:bg-red-50 transition-colors">
                    <Trash2 size={13} strokeWidth={2} />
                  </button>
                  {/* Copy lead link */}
                  <button
                    onClick={() => copyLeadLink(agent)}
                    title="Copy personal lead capture link"
                    className="p-1.5 rounded-lg text-stone-300 hover:text-[#B8960C] hover:bg-[#B8960C]/5 transition-colors"
                  >
                    {copiedId === agent.id ? <CheckCircle size={13} className="text-green-500" /> : <Link size={13} strokeWidth={2} />}
                  </button>
                  {/* Invite button */}
                  {(() => {
                    const state = inviteStates[agent.id] ?? "idle";
                    return (
                      <button
                        onClick={() => sendInvite(agent)}
                        disabled={state === "sending" || state === "sent"}
                        title={state === "sent" ? "Invite sent!" : state === "error" ? "Failed — try again" : "Send invite email"}
                        className={`inline-flex items-center gap-1.5 h-7 px-3 rounded-lg text-xs font-semibold transition-colors ${
                          state === "sent" ? "bg-green-500 text-white" :
                          state === "error" ? "bg-red-500 text-white" :
                          "bg-stone-100 text-stone-600 hover:bg-stone-200"
                        }`}
                      >
                        {state === "sending" && <Loader2 size={11} className="animate-spin" />}
                        {state === "sent" && <CheckCircle size={11} />}
                        {(state === "idle" || state === "error") && <Send size={11} strokeWidth={2} />}
                        {state === "sending" ? "Sending…" : state === "sent" ? "Sent!" : state === "error" ? "Error" : "Invite"}
                      </button>
                    );
                  })()}
                  <button onClick={() => setEditAgent(agent)}
                    className="inline-flex items-center gap-1.5 h-7 px-3 rounded-lg bg-[#B8960C] text-white text-xs font-semibold hover:bg-[#9e7f0a] transition-colors">
                    <Pencil size={11} strokeWidth={2} /> Edit
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {/* Add agent card */}
        <button onClick={() => setEditAgent("new")}
          className="bg-white rounded-xl border-2 border-dashed border-stone-200 shadow-sm p-5 flex flex-col items-center justify-center gap-3 text-stone-400 hover:border-[#B8960C] hover:text-[#B8960C] transition-colors min-h-[180px] group">
          <div className="h-12 w-12 rounded-full border-2 border-dashed border-current flex items-center justify-center">
            <Plus size={20} strokeWidth={1.5} />
          </div>
          <span className="text-sm font-medium">Add Agent</span>
        </button>
      </div>

      {/* Edit / New modal */}
      {editAgent !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl p-8 relative">
            <button onClick={() => setEditAgent(null)} className="absolute top-4 right-4 p-2 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors">
              <X size={16} strokeWidth={2} />
            </button>
            <h2 className="font-serif text-2xl font-bold text-stone-900 mb-6">
              {editAgent === "new" ? "Add New Agent" : `Edit — ${(editAgent as Agent).name}`}
            </h2>
            <AgentForm
              agent={editAgent === "new" ? undefined : editAgent as Agent}
              nextId={nextAgentId(agents)}
              onSave={handleSave}
              onCancel={() => setEditAgent(null)}
            />
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center">
            <div className="h-12 w-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
              <Trash2 size={20} className="text-red-500" />
            </div>
            <h3 className="font-serif text-xl font-bold text-stone-900 mb-2">Remove Agent?</h3>
            <p className="text-sm text-stone-500 mb-6">This will remove the agent from the system. Assigned clients and properties will remain unchanged.</p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => handleDelete(deleteConfirm)}
                className="h-10 px-5 rounded-lg bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition-colors">
                Remove
              </button>
              <button onClick={() => setDeleteConfirm(null)}
                className="h-10 px-5 rounded-lg border border-stone-200 text-sm font-medium text-stone-600 hover:border-stone-300 transition-colors">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
