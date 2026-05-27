"use client";

import { useState, useEffect, useCallback } from "react";
import { Users, ArrowRight, CheckSquare, Square, Loader2, CheckCircle } from "lucide-react";
import type { Agent, Client } from "@/types";
import { getAllAgents } from "@/lib/db/agents";
import { getClientsByAgent, reassignClients } from "@/lib/db/clients";
import { ROLE_CONFIG } from "@/lib/agents-config";

const STAGE_LABELS: Record<string, string> = {
  new_inquiry: "New Inquiry",
  qualified: "Qualified",
  property_presentation: "Presentation",
  offer_submitted: "Offer",
  negotiation: "Negotiation",
  legal_process: "Legal",
  signed_closed: "Closed",
};

export function ClientReassignment() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [fromAgentId, setFromAgentId] = useState("");
  const [toAgentId, setToAgentId] = useState("");
  const [clients, setClients] = useState<Client[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loadingClients, setLoadingClients] = useState(false);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    getAllAgents().then(setAgents);
  }, []);

  const loadClients = useCallback(async (agentId: string) => {
    setLoadingClients(true);
    setSelected(new Set());
    setDone(false);
    const list = await getClientsByAgent(agentId);
    setClients(list);
    setLoadingClients(false);
  }, []);

  const handleFromChange = (agentId: string) => {
    setFromAgentId(agentId);
    setToAgentId("");
    setClients([]);
    setSelected(new Set());
    setDone(false);
    if (agentId) loadClients(agentId);
  };

  const toggleAll = () => {
    if (selected.size === clients.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(clients.map(c => c.id)));
    }
  };

  const toggleClient = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  };

  const handleReassign = async () => {
    if (!toAgentId || selected.size === 0) return;
    const toAgent = agents.find(a => a.id === toAgentId);
    if (!toAgent) return;
    setSaving(true);
    await reassignClients(Array.from(selected), toAgentId, toAgent.name);
    setSaving(false);
    setDone(true);
    setClients(prev => prev.filter(c => !selected.has(c.id)));
    setSelected(new Set());
  };

  const fromAgent = agents.find(a => a.id === fromAgentId);
  const availableToAgents = agents.filter(a => a.id !== fromAgentId && a.active !== false);
  const allSelected = clients.length > 0 && selected.size === clients.length;

  return (
    <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
      <div className="px-6 py-5 border-b border-stone-100 flex items-center gap-3">
        <div className="h-9 w-9 rounded-xl bg-amber-50 flex items-center justify-center">
          <Users size={16} className="text-amber-600" />
        </div>
        <div>
          <h3 className="font-serif text-lg font-bold text-stone-900">Client Reassignment</h3>
          <p className="text-xs text-stone-400 mt-0.5">Bulk-reassign clients when an agent leaves or transfers</p>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Agent selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-stone-400 mb-1.5">
              From Agent
            </label>
            <select
              value={fromAgentId}
              onChange={e => handleFromChange(e.target.value)}
              className="h-10 w-full rounded-lg border border-stone-200 bg-white px-3 text-sm text-stone-800 outline-none focus:border-[#B8960C] focus:ring-2 focus:ring-[#B8960C]/20 transition-all appearance-none cursor-pointer"
            >
              <option value="">Select agent…</option>
              {agents.map(a => (
                <option key={a.id} value={a.id}>{a.name} ({ROLE_CONFIG[a.role]?.label})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-stone-400 mb-1.5">
              To Agent
            </label>
            <select
              value={toAgentId}
              onChange={e => setToAgentId(e.target.value)}
              disabled={!fromAgentId}
              className="h-10 w-full rounded-lg border border-stone-200 bg-white px-3 text-sm text-stone-800 outline-none focus:border-[#B8960C] focus:ring-2 focus:ring-[#B8960C]/20 transition-all appearance-none cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <option value="">Select target agent…</option>
              {availableToAgents.map(a => (
                <option key={a.id} value={a.id}>{a.name} ({ROLE_CONFIG[a.role]?.label})</option>
              ))}
            </select>
          </div>
        </div>

        {/* Client list */}
        {fromAgentId && (
          <div>
            {loadingClients ? (
              <div className="flex items-center justify-center py-8 text-stone-400 gap-2">
                <Loader2 size={16} className="animate-spin" />
                <span className="text-sm">Loading clients…</span>
              </div>
            ) : clients.length === 0 ? (
              <div className="text-center py-8 text-stone-400">
                <Users size={24} className="mx-auto mb-2 opacity-40" />
                <p className="text-sm">{fromAgent?.name} has no assigned clients</p>
              </div>
            ) : (
              <div className="border border-stone-200 rounded-xl overflow-hidden">
                {/* Header row */}
                <div className="flex items-center gap-3 px-4 py-3 bg-stone-50 border-b border-stone-200">
                  <button onClick={toggleAll} className="text-stone-400 hover:text-[#B8960C] transition-colors shrink-0">
                    {allSelected
                      ? <CheckSquare size={16} className="text-[#B8960C]" />
                      : <Square size={16} />}
                  </button>
                  <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider flex-1">
                    {selected.size > 0 ? `${selected.size} of ${clients.length} selected` : `${clients.length} clients`}
                  </span>
                  {selected.size > 0 && toAgentId && (
                    <button
                      onClick={handleReassign}
                      disabled={saving}
                      className="inline-flex items-center gap-1.5 h-8 px-4 rounded-lg bg-[#B8960C] text-white text-xs font-semibold hover:bg-[#9e7f0a] transition-colors disabled:opacity-60"
                    >
                      {saving ? <Loader2 size={12} className="animate-spin" /> : <ArrowRight size={12} />}
                      {saving ? "Reassigning…" : `Reassign ${selected.size}`}
                    </button>
                  )}
                  {selected.size > 0 && !toAgentId && (
                    <span className="text-xs text-amber-600 font-medium">← Select target agent</span>
                  )}
                </div>

                {/* Client rows */}
                <div className="divide-y divide-stone-100 max-h-80 overflow-y-auto">
                  {clients.map(client => (
                    <label
                      key={client.id}
                      className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-stone-50 transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={selected.has(client.id)}
                        onChange={() => toggleClient(client.id)}
                        className="sr-only"
                      />
                      <span className="shrink-0 text-stone-400">
                        {selected.has(client.id)
                          ? <CheckSquare size={15} className="text-[#B8960C]" />
                          : <Square size={15} />}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-stone-900 truncate">
                          {client.firstName} {client.lastName}
                        </p>
                        <p className="text-xs text-stone-400 truncate">{client.email ?? client.phone ?? "—"}</p>
                      </div>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-stone-100 text-stone-500 shrink-0">
                        {STAGE_LABELS[client.stage] ?? client.stage}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Success banner */}
        {done && (
          <div className="flex items-center gap-3 px-4 py-3 bg-green-50 border border-green-200 rounded-xl text-green-700">
            <CheckCircle size={16} className="shrink-0" />
            <p className="text-sm font-medium">Clients successfully reassigned.</p>
          </div>
        )}
      </div>
    </div>
  );
}
