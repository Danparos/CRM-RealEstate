"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, FileSignature, ChevronRight, Clock, CheckCircle2, User, Home, Briefcase } from "lucide-react";
import { getAllContracts, createContract } from "@/lib/db/contracts";
import { getAllClients } from "@/lib/db/clients";
import type { Contract } from "@/lib/db/contracts";
import type { Client } from "@/types";
import { cn } from "@/lib/utils";

const STAGE_CONFIG = {
  legal_process: { label: "Legal Process", bg: "bg-red-50",     text: "text-red-700",     dot: "bg-red-400"     },
  signed_closed: { label: "Signed & Closed", bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-400" },
};

function formatPrice(n?: number) {
  if (!n) return "—";
  return "€" + n.toLocaleString("de-DE");
}

function formatDate(d?: string) {
  if (!d) return "—";
  return new Date(d + "T12:00:00Z").toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
}

export default function ContractsPage() {
  const router = useRouter();
  const [contracts,    setContracts]    = useState<Contract[]>([]);
  const [clients,      setClients]      = useState<Client[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [filter,       setFilter]       = useState<"all" | "legal_process" | "signed_closed">("all");
  const [modalOpen,    setModalOpen]    = useState(false);
  const [selectedClient, setSelectedClient] = useState("");
  const [creating,     setCreating]     = useState(false);

  useEffect(() => {
    Promise.all([getAllContracts(), getAllClients()]).then(([cs, cls]) => {
      setContracts(cs);
      setClients(cls);
      setLoading(false);
    });
  }, []);

  // Pipeline clients in legal_process or signed_closed without a contract
  const pipelineClients = clients.filter(c =>
    c.stage === "legal_process" &&
    !contracts.find(ct => ct.clientId === c.id)
  );

  const filtered = contracts.filter(c => filter === "all" || c.stage === filter);

  async function handleCreateFromClient() {
    if (!selectedClient) return;
    const client = clients.find(c => c.id === selectedClient);
    if (!client) return;
    setCreating(true);
    const created = await createContract({
      clientId:    client.id,
      buyerName:   `${client.firstName} ${client.lastName}`,
      buyerEmail:  client.email,
      buyerPhone:  client.phone,
      buyerNationality: client.nationality,
      agentName:   client.primaryAgent,
      stage:       (client.stage === "signed_closed" ? "signed_closed" : "legal_process") as Contract["stage"],
      followUpItems: [],
    });
    setCreating(false);
    if (created) router.push(`/contracts/${created.id}`);
    setModalOpen(false);
  }

  async function handleCreateBlank() {
    setCreating(true);
    const created = await createContract({
      buyerName:     "",
      stage:         "legal_process",
      followUpItems: [],
    });
    setCreating(false);
    if (created) router.push(`/contracts/${created.id}`);
    setModalOpen(false);
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-serif text-[28px] font-semibold text-stone-900 leading-tight">Transactions</h1>
          <p className="mt-0.5 text-sm text-stone-500">Deal tracking from legal process to completion</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 h-9 px-4 rounded-lg bg-[#B8960C] text-white text-sm font-semibold hover:bg-[#9a7a0a] transition-colors shadow-sm"
        >
          <Plus size={14} strokeWidth={2.5} />
          New Contract
        </button>
      </div>

      {/* Stage filter */}
      <div className="flex gap-2">
        {(["all", "legal_process", "signed_closed"] as const).map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors",
              filter === s ? "bg-stone-900 text-white" : "bg-white border border-stone-200 text-stone-500 hover:bg-stone-50"
            )}
          >
            {s === "all" ? `All (${contracts.length})` : s === "legal_process" ? `Legal Process (${contracts.filter(c => c.stage === "legal_process").length})` : `Signed & Closed (${contracts.filter(c => c.stage === "signed_closed").length})`}
          </button>
        ))}
      </div>

      {/* Pipeline suggestions */}
      {pipelineClients.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-4">
          <p className="text-[11px] uppercase tracking-wider font-semibold text-amber-700 mb-3">Pipeline clients ready for a contract</p>
          <div className="flex flex-wrap gap-2">
            {pipelineClients.map(c => (
              <button
                key={c.id}
                onClick={() => { setSelectedClient(c.id); setModalOpen(true); }}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-amber-200 text-sm font-medium text-stone-700 hover:border-[#B8960C] hover:text-[#B8960C] transition-colors"
              >
                <span className={cn("h-2 w-2 rounded-full", c.stage === "legal_process" ? "bg-red-400" : "bg-emerald-400")} />
                {c.firstName} {c.lastName}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Contract list */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="h-7 w-7 rounded-full border-2 border-[#B8960C] border-t-transparent animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-stone-400">
          <FileSignature size={40} strokeWidth={1} className="mx-auto mb-3 opacity-40" />
          <p className="text-sm font-medium">No contracts yet</p>
          <button onClick={() => setModalOpen(true)} className="mt-3 text-[#B8960C] text-sm font-semibold hover:underline">Create your first contract</button>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(contract => {
            const sc = STAGE_CONFIG[contract.stage];
            const done  = contract.followUpItems.filter(f => f.done).length;
            const total = contract.followUpItems.length;
            return (
              <div
                key={contract.id}
                onClick={() => router.push(`/contracts/${contract.id}`)}
                className="w-full bg-white rounded-xl border border-stone-200 shadow-sm px-6 py-4 flex items-center gap-4 hover:border-stone-300 hover:shadow-md transition-all cursor-pointer"
              >
                {/* Stage icon */}
                <div className={cn("h-10 w-10 rounded-full flex items-center justify-center shrink-0", sc.bg)}>
                  {contract.stage === "signed_closed"
                    ? <CheckCircle2 size={18} className={sc.text} strokeWidth={2} />
                    : <Clock size={18} className={sc.text} strokeWidth={2} />
                  }
                </div>

                {/* Main info */}
                <div className="flex-1 min-w-0">
                  {/* Row 1: names + stage */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold", sc.bg, sc.text)}>
                      <span className={cn("h-1.5 w-1.5 rounded-full", sc.dot)} />
                      {sc.label}
                    </span>
                  </div>
                  {/* Row 2: buyer / seller */}
                  <div className="flex items-center gap-4 mt-1.5 flex-wrap">
                    <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-stone-900">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-stone-400">Buyer</span>
                      {contract.buyerName || "—"}
                    </span>
                    {contract.sellerName && (
                      <span className="inline-flex items-center gap-1.5 text-sm text-stone-600">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-stone-400">Seller</span>
                        {contract.sellerName}
                      </span>
                    )}
                  </div>
                  {/* Row 3: property link + agent + price */}
                  <div className="flex items-center gap-3 mt-1 flex-wrap">
                    {contract.propertyRef && (
                      <Link
                        href={`/properties?ref=${encodeURIComponent(contract.propertyRef)}`}
                        onClick={e => e.stopPropagation()}
                        className="inline-flex items-center gap-1.5 text-xs text-[#B8960C] hover:underline font-medium"
                      >
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-stone-400">Property</span>
                        <Home size={11} />
                        {contract.propertyRef}{contract.propertyTitle ? ` · ${contract.propertyTitle}` : ""}
                      </Link>
                    )}
                    {contract.agentName && (
                      <span className="inline-flex items-center gap-1.5 text-xs text-stone-500">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-stone-400">Agent</span>
                        <Briefcase size={11} />
                        {contract.agentName}
                      </span>
                    )}
                    {contract.agreedPrice && <span className="text-xs font-semibold text-[#B8960C]">{formatPrice(contract.agreedPrice)}</span>}
                    {contract.notaryDate  && <span className="text-xs text-stone-400">Notary: {formatDate(contract.notaryDate)}</span>}
                  </div>
                </div>

                {/* Follow-up progress */}
                {total > 0 && (
                  <div className="shrink-0 text-right">
                    <p className="text-xs font-semibold text-stone-700">{done}/{total}</p>
                    <p className="text-[10px] text-stone-400">follow-ups</p>
                  </div>
                )}

                <ChevronRight size={16} className="text-stone-300 shrink-0" />
              </div>
            );
          })}
        </div>
      )}

      {/* New Contract Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(28,20,10,0.5)", backdropFilter: "blur(4px)" }}
          onClick={e => { if (e.target === e.currentTarget) { setModalOpen(false); setSelectedClient(""); } }}
        >
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 bg-gradient-to-r from-stone-50 to-white">
              <h2 className="font-serif text-lg font-semibold text-stone-900">New Contract</h2>
              <button onClick={() => { setModalOpen(false); setSelectedClient(""); }} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-stone-100 text-stone-400 text-xl">×</button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] uppercase tracking-wider font-semibold text-stone-400">Link to pipeline client</span>
                <select
                  value={selectedClient}
                  onChange={e => setSelectedClient(e.target.value)}
                  className="rounded-xl border border-stone-200 px-3 py-2.5 text-sm text-stone-800 focus:outline-none focus:ring-1 focus:ring-[#B8960C]/40"
                >
                  <option value="">— Select client —</option>
                  {clients.filter(c => c.stage === "legal_process").map(c => (
                    <option key={c.id} value={c.id}>
                      {c.firstName} {c.lastName} · {c.stage === "legal_process" ? "Legal Process" : "Signed & Closed"}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2 text-stone-400">
                <div className="h-px flex-1 bg-stone-200" />
                <span className="text-xs">or</span>
                <div className="h-px flex-1 bg-stone-200" />
              </div>
              <button
                onClick={handleCreateBlank}
                disabled={creating}
                className="w-full py-2.5 rounded-xl border border-stone-200 text-sm font-medium text-stone-600 hover:bg-stone-50 transition-colors"
              >
                Create blank contract
              </button>
            </div>
            <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-stone-100 bg-stone-50/50">
              <button onClick={() => { setModalOpen(false); setSelectedClient(""); }} className="px-4 py-2 text-[12px] font-semibold text-stone-500 hover:text-stone-700">Cancel</button>
              <button
                onClick={handleCreateFromClient}
                disabled={!selectedClient || creating}
                className={cn(
                  "px-5 py-2.5 rounded-xl text-[13px] font-semibold transition-all",
                  selectedClient && !creating ? "bg-[#B8960C] text-white hover:bg-[#9a7a0a]" : "bg-stone-200 text-stone-400 cursor-not-allowed"
                )}
              >
                {creating ? "Creating…" : "Create Contract"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
