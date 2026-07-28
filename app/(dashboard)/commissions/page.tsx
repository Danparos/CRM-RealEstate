"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { TrendingUp, Clock, CheckCircle2, Euro, ChevronRight, Filter } from "lucide-react";
import { getAllContracts, updateContract } from "@/lib/db/contracts";
import { getAllAgents } from "@/lib/db/agents";
import type { Contract } from "@/lib/db/contracts";
import type { Agent } from "@/types";
import { cn } from "@/lib/utils";

function fmt(n: number) {
  return "€" + Math.round(n).toLocaleString("de-DE");
}

function calcCommission(c: Contract) {
  const price  = c.agreedPrice ?? 0;
  const buyFee = price * ((c.buyerCommission  ?? 0) / 100);
  const selFee = price * ((c.sellerCommission ?? 0) / 100);
  const total  = buyFee + selFee;
  const split  = c.agentSplitPercent ?? 100;
  const primaryShare  = total * (split / 100);
  const coAgentShare  = total * ((100 - split) / 100);
  return { buyFee, selFee, total, primaryShare, coAgentShare };
}

const STATUS_CONFIG = {
  pending:  { label: "Pending",  dot: "bg-amber-400",   badge: "bg-amber-50 text-amber-700 border-amber-200"   },
  invoiced: { label: "Invoiced", dot: "bg-blue-400",    badge: "bg-blue-50 text-blue-700 border-blue-200"      },
  received: { label: "Received", dot: "bg-emerald-400", badge: "bg-emerald-50 text-emerald-700 border-emerald-200" },
};

export default function CommissionsPage() {
  const router = useRouter();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [agents,    setAgents]    = useState<Agent[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [filterAgent,  setFilterAgent]  = useState("");
  const [filterStatus, setFilterStatus] = useState<"" | "pending" | "invoiced" | "received">("");
  const [filterYear,   setFilterYear]   = useState("");
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([getAllContracts(), getAllAgents()]).then(([cs, as_]) => {
      setContracts(cs);
      setAgents(as_);
      setLoading(false);
    });
  }, []);

  const years = useMemo(() => {
    const ys = new Set(contracts.map(c => new Date(c.createdAt).getFullYear().toString()));
    return Array.from(ys).sort().reverse();
  }, [contracts]);

  const filtered = useMemo(() => {
    return contracts
      .filter(c => c.stage === "signed_closed" || c.agreedPrice)
      .filter(c => !filterAgent  || c.agentId === filterAgent || c.agentName === agents.find(a => a.id === filterAgent)?.name)
      .filter(c => !filterStatus || (c.commissionStatus ?? "pending") === filterStatus)
      .filter(c => !filterYear   || new Date(c.createdAt).getFullYear().toString() === filterYear);
  }, [contracts, filterAgent, filterStatus, filterYear, agents]);

  // Summary stats
  const stats = useMemo(() => {
    let totalValue = 0, totalExpected = 0, totalReceived = 0, totalPending = 0;
    for (const c of filtered) {
      const { total } = calcCommission(c);
      totalValue    += c.agreedPrice ?? 0;
      totalExpected += total;
      if ((c.commissionStatus ?? "pending") === "received") totalReceived += total;
      else totalPending += total;
    }
    return { totalValue, totalExpected, totalReceived, totalPending };
  }, [filtered]);

  // Per-agent breakdown
  const agentBreakdown = useMemo(() => {
    const map: Record<string, { name: string; expected: number; received: number; count: number }> = {};
    for (const c of filtered) {
      const key  = c.agentId ?? c.agentName ?? "unknown";
      const name = c.agentName ?? agents.find(a => a.id === c.agentId)?.name ?? "Unknown";
      const { primaryShare } = calcCommission(c);
      if (!map[key]) map[key] = { name, expected: 0, received: 0, count: 0 };
      map[key].expected += primaryShare;
      map[key].count    += 1;
      if ((c.commissionStatus ?? "pending") === "received") map[key].received += primaryShare;
    }
    return Object.values(map).sort((a, b) => b.expected - a.expected);
  }, [filtered, agents]);

  async function markStatus(contract: Contract, status: Contract["commissionStatus"]) {
    setUpdating(contract.id);
    const patch: Partial<Contract> = {
      commissionStatus: status,
      commissionReceivedAt: status === "received" ? new Date().toISOString().slice(0, 10) : contract.commissionReceivedAt,
    };
    const updated = { ...contract, ...patch };
    await updateContract(contract.id, updated);
    setContracts(prev => prev.map(c => c.id === contract.id ? updated : c));
    setUpdating(null);
  }

  if (loading) return (
    <div className="flex items-center justify-center py-24">
      <div className="h-7 w-7 rounded-full border-2 border-[#B8960C] border-t-transparent animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6 max-w-5xl">

      {/* Header */}
      <div className="flex items-end justify-between gap-4 pb-2 border-b border-stone-100">
        <div>
          <h1 className="font-serif text-[36px] font-semibold leading-none tracking-wide text-stone-900">Commissions</h1>
          <p className="mt-2 text-[13px] uppercase tracking-[0.2em] text-stone-400 font-medium">Revenue & agent earnings tracker</p>
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Closed Value",       value: fmt(stats.totalValue),    icon: Euro,         bg: "bg-stone-50",    text: "text-stone-700" },
          { label: "Commission Expected", value: fmt(stats.totalExpected), icon: TrendingUp,   bg: "bg-amber-50",   text: "text-amber-700" },
          { label: "Received",           value: fmt(stats.totalReceived),  icon: CheckCircle2, bg: "bg-emerald-50", text: "text-emerald-700" },
          { label: "Pending",            value: fmt(stats.totalPending),   icon: Clock,        bg: "bg-blue-50",    text: "text-blue-700" },
        ].map(({ label, value, icon: Icon, bg, text }) => (
          <div key={label} className={cn("rounded-2xl border border-stone-200 shadow-sm px-5 py-4", bg)}>
            <div className="flex items-center gap-2 mb-2">
              <Icon size={14} className={text} />
              <p className="text-[10px] uppercase tracking-wider font-semibold text-stone-400">{label}</p>
            </div>
            <p className={cn("text-2xl font-bold font-serif", text)}>{value}</p>
          </div>
        ))}
      </div>

      {/* Agent breakdown */}
      {agentBreakdown.length > 0 && (
        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-stone-100">
            <h2 className="font-semibold text-stone-800 text-sm">By Agent</h2>
          </div>
          <div className="divide-y divide-stone-100">
            {agentBreakdown.map(a => {
              const pct = a.expected > 0 ? (a.received / a.expected) * 100 : 0;
              return (
                <div key={a.name} className="flex items-center gap-4 px-6 py-3">
                  <div className="h-8 w-8 rounded-full bg-[#B8960C]/10 flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-[#B8960C]">{a.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-stone-800">{a.name}</span>
                      <span className="text-xs text-stone-400">{a.count} deal{a.count !== 1 ? "s" : ""}</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-stone-100 overflow-hidden">
                      <div className="h-full rounded-full bg-emerald-400 transition-all" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-stone-900">{fmt(a.expected)}</p>
                    <p className="text-[11px] text-stone-400">{fmt(a.received)} received</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center">
        <Filter size={13} className="text-stone-400" />
        <select value={filterAgent} onChange={e => setFilterAgent(e.target.value)}
          className="h-8 rounded-lg border border-stone-200 bg-white px-2.5 text-xs text-stone-700 focus:outline-none focus:border-[#B8960C]">
          <option value="">All agents</option>
          {agents.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value as typeof filterStatus)}
          className="h-8 rounded-lg border border-stone-200 bg-white px-2.5 text-xs text-stone-700 focus:outline-none focus:border-[#B8960C]">
          <option value="">All statuses</option>
          <option value="pending">Pending</option>
          <option value="invoiced">Invoiced</option>
          <option value="received">Received</option>
        </select>
        {years.length > 1 && (
          <select value={filterYear} onChange={e => setFilterYear(e.target.value)}
            className="h-8 rounded-lg border border-stone-200 bg-white px-2.5 text-xs text-stone-700 focus:outline-none focus:border-[#B8960C]">
            <option value="">All years</option>
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        )}
        {(filterAgent || filterStatus || filterYear) && (
          <button onClick={() => { setFilterAgent(""); setFilterStatus(""); setFilterYear(""); }}
            className="h-8 px-3 rounded-lg text-xs font-medium text-stone-400 hover:text-stone-600 border border-stone-200 hover:border-stone-300 transition-colors">
            Clear
          </button>
        )}
      </div>

      {/* Commission table */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-stone-400">
          <TrendingUp size={40} strokeWidth={1} className="mx-auto mb-3 opacity-40" />
          <p className="text-sm">No deals match the current filters</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stone-100 bg-stone-50/60">
                  <th className="text-left px-5 py-3 text-[10px] font-semibold uppercase tracking-wider text-stone-400">Deal</th>
                  <th className="text-right px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-stone-400">Price</th>
                  <th className="text-right px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-stone-400">Total Fee</th>
                  <th className="text-right px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-stone-400">Agent Share</th>
                  <th className="text-center px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-stone-400">Status</th>
                  <th className="text-center px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-stone-400">Action</th>
                  <th className="w-8" />
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filtered.map(c => {
                  const { total, primaryShare } = calcCommission(c);
                  const status = c.commissionStatus ?? "pending";
                  const sc     = STATUS_CONFIG[status];
                  const isUpdating = updating === c.id;
                  return (
                    <tr key={c.id} className="hover:bg-stone-50/50 transition-colors">
                      <td className="px-5 py-3">
                        <p className="font-medium text-stone-900 truncate max-w-[180px]">{c.buyerName || "—"}</p>
                        <p className="text-[11px] text-stone-400 mt-0.5">{c.propertyRef ?? ""} {c.agentName ? `· ${c.agentName}` : ""}</p>
                        {c.invoiceNumber && <p className="text-[10px] text-stone-300 mt-0.5">INV {c.invoiceNumber}</p>}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-stone-700 whitespace-nowrap">
                        {c.agreedPrice ? fmt(c.agreedPrice) : "—"}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-[#B8960C] whitespace-nowrap">
                        {total > 0 ? fmt(total) : "—"}
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <span className="font-bold text-stone-900">{primaryShare > 0 ? fmt(primaryShare) : "—"}</span>
                        {(c.agentSplitPercent ?? 100) < 100 && (
                          <span className="text-[10px] text-stone-400 block">{c.agentSplitPercent}% split</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border", sc.badge)}>
                          <span className={cn("h-1.5 w-1.5 rounded-full", sc.dot)} />
                          {sc.label}
                        </span>
                        {c.commissionReceivedAt && (
                          <p className="text-[10px] text-stone-400 mt-0.5">
                            {new Date(c.commissionReceivedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {status !== "received" && (
                          <div className="flex items-center justify-center gap-1">
                            {status === "pending" && (
                              <button onClick={() => markStatus(c, "invoiced")} disabled={isUpdating}
                                className="px-2 py-1 rounded-lg text-[10px] font-semibold bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors disabled:opacity-50 whitespace-nowrap">
                                Mark Invoiced
                              </button>
                            )}
                            <button onClick={() => markStatus(c, "received")} disabled={isUpdating}
                              className="px-2 py-1 rounded-lg text-[10px] font-semibold bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors disabled:opacity-50 whitespace-nowrap">
                              Mark Received
                            </button>
                          </div>
                        )}
                      </td>
                      <td className="pr-3">
                        <button onClick={() => router.push(`/contracts/${c.id}`)}
                          className="p-1 rounded text-stone-300 hover:text-stone-500 transition-colors">
                          <ChevronRight size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
