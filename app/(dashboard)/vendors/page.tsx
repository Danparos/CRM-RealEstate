"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Plus, Building2, Phone, Mail, ChevronRight, Home, Search, X } from "lucide-react";
import { getAllVendors } from "@/lib/db/vendors";
import type { Vendor, VendorStage } from "@/types";
import { cn } from "@/lib/utils";

const STAGE_CONFIG: Record<VendorStage, { label: string; dot: string; badge: string }> = {
  owner_inquiry:     { label: "Owner Inquiry",     dot: "bg-sky-400",     badge: "bg-sky-50 text-sky-700 border-sky-200"         },
  valuation:         { label: "Valuation",         dot: "bg-violet-400",  badge: "bg-violet-50 text-violet-700 border-violet-200" },
  listing_agreement: { label: "Listing Agreement", dot: "bg-amber-400",   badge: "bg-amber-50 text-amber-700 border-amber-200"    },
  listed:            { label: "Listed",            dot: "bg-emerald-400", badge: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  under_offer:       { label: "Under Offer",       dot: "bg-orange-400",  badge: "bg-orange-50 text-orange-700 border-orange-200"  },
  legal_process:     { label: "Legal Process",     dot: "bg-red-400",     badge: "bg-red-50 text-red-700 border-red-200"           },
  sold:              { label: "Sold",              dot: "bg-stone-400",   badge: "bg-stone-100 text-stone-600 border-stone-200"    },
  withdrawn:         { label: "Withdrawn",         dot: "bg-stone-300",   badge: "bg-stone-50 text-stone-400 border-stone-200"     },
};

const ACTIVE_STAGES: VendorStage[] = ["owner_inquiry", "valuation", "listing_agreement", "listed", "under_offer", "legal_process"];
const ALL_STAGES: VendorStage[]    = [...ACTIVE_STAGES, "sold", "withdrawn"];

function fmt(n?: number) {
  if (!n) return null;
  return "€" + n.toLocaleString("de-DE");
}

function timeAgo(iso?: string) {
  if (!iso) return null;
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7)  return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

export default function VendorsPage() {
  const router = useRouter();
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<VendorStage | "all">("all");
  const [search, setSearch] = useState("");
  const [agentFilter, setAgentFilter] = useState("");

  useEffect(() => {
    getAllVendors().then(v => { setVendors(v); setLoading(false); });
  }, []);

  const agents = useMemo(() => {
    const names = vendors.map(v => v.primaryAgent).filter(Boolean) as string[];
    return Array.from(new Set(names)).sort();
  }, [vendors]);

  const stageCounts = ALL_STAGES.reduce<Record<string, number>>((acc, s) => {
    acc[s] = vendors.filter(v => v.stage === s).length;
    return acc;
  }, {});

  const q = search.trim().toLowerCase();
  const filtered = vendors
    .filter(v => activeTab === "all" ? ACTIVE_STAGES.includes(v.stage as VendorStage) : v.stage === activeTab)
    .filter(v => !agentFilter || v.primaryAgent === agentFilter)
    .filter(v => !q || [v.firstName, v.lastName, v.email, v.phone, v.propertyRef, v.primaryAgent, v.nationality]
      .some(f => f?.toLowerCase().includes(q)));

  const hasFilter = !!q || !!agentFilter;

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-end justify-between gap-4 pb-2 border-b border-stone-100">
        <div>
          <h1 className="font-serif text-[36px] font-semibold leading-none tracking-wide text-stone-900">Vendors</h1>
          <p className="mt-2 text-[13px] uppercase tracking-[0.2em] text-stone-400 font-medium">Seller pipeline</p>
        </div>
        <button
          onClick={() => router.push("/vendors/new")}
          className="inline-flex items-center gap-2 h-9 px-4 rounded-lg bg-[#B8960C] text-white text-sm font-semibold hover:bg-[#9e7f0a] transition-colors shadow-sm"
        >
          <Plus size={14} strokeWidth={2.5} /> Add Vendor
        </button>
      </div>

      {/* Stage summary strip */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
        {ACTIVE_STAGES.map(s => {
          const cfg = STAGE_CONFIG[s];
          return (
            <button
              key={s}
              onClick={() => setActiveTab(activeTab === s ? "all" : s)}
              className={cn(
                "rounded-xl border px-3 py-2.5 text-left transition-all",
                activeTab === s ? "border-[#B8960C] bg-[#B8960C]/5" : "border-stone-200 bg-white hover:border-stone-300"
              )}
            >
              <div className="flex items-center gap-1.5 mb-1">
                <span className={cn("h-2 w-2 rounded-full shrink-0", cfg.dot)} />
                <span className="text-[9px] font-semibold uppercase tracking-wider text-stone-400 truncate">{cfg.label}</span>
              </div>
              <p className={cn("text-xl font-bold", activeTab === s ? "text-[#B8960C]" : "text-stone-900")}>{stageCounts[s] ?? 0}</p>
            </button>
          );
        })}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setActiveTab("all")}
          className={cn("h-8 px-4 rounded-lg text-xs font-semibold transition-colors",
            activeTab === "all" ? "bg-stone-900 text-white" : "bg-white border border-stone-200 text-stone-500 hover:bg-stone-50")}
        >
          Active ({vendors.filter(v => ACTIVE_STAGES.includes(v.stage as VendorStage)).length})
        </button>
        {ALL_STAGES.map(s => (
          <button
            key={s}
            onClick={() => setActiveTab(s)}
            className={cn("h-8 px-3 rounded-lg text-xs font-semibold transition-colors",
              activeTab === s ? "bg-stone-900 text-white" : "bg-white border border-stone-200 text-stone-500 hover:bg-stone-50")}
          >
            <span className={cn("inline-block h-1.5 w-1.5 rounded-full mr-1.5", STAGE_CONFIG[s].dot)} />
            {STAGE_CONFIG[s].label} {stageCounts[s] ? `(${stageCounts[s]})` : ""}
          </button>
        ))}
      </div>

      {/* Search & filter bar */}
      <div className="flex gap-2 flex-wrap items-center">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search size={13} strokeWidth={2} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search name, email, phone, property…"
            className="w-full h-9 pl-8 pr-8 rounded-lg border border-stone-200 bg-white text-sm text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-1 focus:ring-[#B8960C] focus:border-[#B8960C] transition-colors"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors">
              <X size={12} strokeWidth={2.5} />
            </button>
          )}
        </div>

        {agents.length > 0 && (
          <select
            value={agentFilter}
            onChange={e => setAgentFilter(e.target.value)}
            className={cn(
              "h-9 rounded-lg border px-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#B8960C] focus:border-[#B8960C] transition-colors appearance-none cursor-pointer",
              agentFilter ? "border-[#B8960C] bg-[#B8960C]/5 text-[#B8960C] font-semibold" : "border-stone-200 bg-white text-stone-500"
            )}
          >
            <option value="">All agents</option>
            {agents.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
        )}

        {hasFilter && (
          <button
            onClick={() => { setSearch(""); setAgentFilter(""); }}
            className="h-9 px-3 rounded-lg border border-stone-200 text-xs font-medium text-stone-400 hover:text-stone-600 hover:border-stone-300 transition-colors"
          >
            Clear filters
          </button>
        )}

        {hasFilter && (
          <span className="text-xs text-stone-400 ml-1">
            {filtered.length} result{filtered.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="h-7 w-7 rounded-full border-2 border-[#B8960C] border-t-transparent animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-stone-400">
          <Building2 size={40} strokeWidth={1} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm font-medium">No vendors in this stage</p>
          <button onClick={() => router.push("/vendors/new")} className="mt-3 text-[#B8960C] text-sm font-semibold hover:underline">
            Add your first vendor
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(vendor => {
            const cfg = STAGE_CONFIG[vendor.stage];
            return (
              <div
                key={vendor.id}
                onClick={() => router.push(`/vendors/${vendor.id}`)}
                className="bg-white rounded-xl border border-stone-200 shadow-sm px-5 py-4 flex items-center gap-4 hover:border-stone-300 hover:shadow-md transition-all cursor-pointer"
              >
                {/* Avatar */}
                <div className="h-10 w-10 rounded-full bg-[#B8960C]/10 flex items-center justify-center shrink-0 border border-[#B8960C]/20">
                  <span className="text-sm font-bold text-[#B8960C]">
                    {vendor.firstName[0]}{vendor.lastName[0]}
                  </span>
                </div>

                {/* Main info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-0.5">
                    <span className="font-semibold text-stone-900 text-sm">{vendor.firstName} {vendor.lastName}</span>
                    <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border", cfg.badge)}>
                      <span className={cn("h-1.5 w-1.5 rounded-full", cfg.dot)} />
                      {cfg.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 flex-wrap text-xs text-stone-400">
                    {vendor.propertyRef && (
                      <span className="inline-flex items-center gap-1">
                        <Home size={10} /> {vendor.propertyRef}
                      </span>
                    )}
                    {vendor.email && (
                      <span className="inline-flex items-center gap-1">
                        <Mail size={10} /> {vendor.email}
                      </span>
                    )}
                    {vendor.phone && (
                      <span className="inline-flex items-center gap-1">
                        <Phone size={10} /> {vendor.phone}
                      </span>
                    )}
                    {vendor.primaryAgent && (
                      <span className="text-stone-300">· {vendor.primaryAgent}</span>
                    )}
                  </div>
                </div>

                {/* Right side */}
                <div className="text-right shrink-0 space-y-0.5">
                  {vendor.askingPrice && (
                    <p className="text-sm font-bold text-[#B8960C]">{fmt(vendor.askingPrice)}</p>
                  )}
                  {vendor.lastActivityAt && (
                    <p className="text-[11px] text-stone-400">{timeAgo(vendor.lastActivityAt)}</p>
                  )}
                </div>

                <ChevronRight size={15} className="text-stone-300 shrink-0" />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
