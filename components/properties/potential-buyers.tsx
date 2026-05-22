"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { getAllClients } from "@/lib/db/clients";
import { mockClients } from "@/lib/mock-data";
import { computeClientClass } from "@/lib/classification";
import { ClientClassBadge } from "@/components/crm/client-class-badge";
import type { Property, Client } from "@/types";

const NATIONALITY_FLAGS: Record<string, string> = {
  DE: "🇩🇪", FR: "🇫🇷", GB: "🇬🇧", GR: "🇬🇷",
  IL: "🇮🇱", US: "🇺🇸", NL: "🇳🇱", CH: "🇨🇭",
};

const STAGE_LABEL: Record<string, string> = {
  new_inquiry:           "New Inquiry",
  qualified:             "Qualified",
  property_presentation: "Presentation",
  offer_submitted:       "Offer Submitted",
  negotiation:           "Negotiation",
  legal_process:         "Legal Process",
  signed_closed:         "Closed",
};

const STAGE_DOT: Record<string, string> = {
  new_inquiry:           "bg-sky-400",
  qualified:             "bg-violet-500",
  property_presentation: "bg-indigo-500",
  offer_submitted:       "bg-[#B8960C]",
  negotiation:           "bg-orange-500",
  legal_process:         "bg-[#CD853F]",
  signed_closed:         "bg-emerald-500",
};

function formatBudget(value: number): string {
  if (value >= 1_000_000) return `€${(value / 1_000_000).toFixed(1)}M`;
  return `€${(value / 1_000).toFixed(0)}K`;
}

function clientMatchesProperty(client: Client, property: Property): boolean {
  if (client.stage === "signed_closed" || client.archived) return false;
  if (client.budgetMax != null && property.askingPrice > client.budgetMax) return false;
  if (client.budgetMin != null && property.askingPrice < client.budgetMin) return false;
  if (client.propertyLocations && client.propertyLocations.length > 0) {
    const areaLower = property.area.toLowerCase();
    const hit = client.propertyLocations.some(l => l.toLowerCase() === areaLower);
    if (!hit) return false;
  }
  if (client.propertyTypes && client.propertyTypes.length > 0) {
    if (!client.propertyTypes.includes(property.type)) return false;
  }
  if (client.propertyBedroomsMin) {
    const min = parseInt(client.propertyBedroomsMin, 10);
    if (!isNaN(min) && property.bedrooms < min) return false;
  }
  if (client.propertyPool === "yes" && !property.pool) return false;
  if (client.propertyViews?.includes("sea_view") && !property.seaView) return false;
  if (client.propertyViews?.includes("seafront") && !property.seafront) return false;
  return true;
}

interface Props {
  property: Property;
}

export function PotentialBuyers({ property }: Props) {
  const [matches, setMatches] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllClients().then(all => {
      const list = all.length > 0 ? all : mockClients;
      setMatches(list.filter(c => clientMatchesProperty(c, property)));
    }).finally(() => setLoading(false));
  }, [property]);

  // Sort: A (hot) first, then B, then C
  const sorted = [...matches].sort((a, b) => {
    const order = { A: 0, B: 1, C: 2 };
    const ca = computeClientClass(a.lastActivityAt);
    const cb = computeClientClass(b.lastActivityAt);
    return (order[ca] ?? 2) - (order[cb] ?? 2);
  });

  return (
    <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-stone-100 flex items-center gap-3">
        <h2 className="font-serif text-xl font-bold text-stone-900">Potential Buyers</h2>
        {!loading && (
          <span className="inline-flex items-center justify-center h-5 min-w-[20px] px-1.5 rounded-full text-[11px] font-bold bg-[#B8960C]/10 text-[#B8960C]">
            {matches.length}
          </span>
        )}
        {!loading && matches.length > 0 && (
          <span className="ml-auto text-[11px] text-stone-400">sorted by activity</span>
        )}
      </div>

      <div className="divide-y divide-stone-100">
        {loading ? (
          <div className="px-6 py-8 flex items-center justify-center">
            <div className="h-6 w-6 rounded-full border-2 border-[#B8960C] border-t-transparent animate-spin" />
          </div>
        ) : sorted.length === 0 ? (
          <div className="px-6 py-10 flex flex-col items-center text-center">
            <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center mb-3">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5">
                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
              </svg>
            </div>
            <p className="text-sm font-medium text-stone-400">No matching clients</p>
            <p className="text-[11px] text-stone-300 mt-1">No active clients match this property's price, location, and features</p>
          </div>
        ) : (
          sorted.map((client) => {
            const flag        = client.nationality ? (NATIONALITY_FLAGS[client.nationality] ?? "") : "";
            const computedCls = computeClientClass(client.lastActivityAt);
            const stageDot    = STAGE_DOT[client.stage] ?? "bg-stone-300";
            const stageLabel  = STAGE_LABEL[client.stage] ?? client.stage;

            return (
              <Link
                key={client.id}
                href={`/clients/${client.id}`}
                className="flex items-center gap-4 px-6 py-3.5 hover:bg-stone-50 transition-colors group"
              >
                {/* Avatar initial */}
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-stone-100 to-stone-200 flex items-center justify-center shrink-0 text-sm font-semibold text-stone-600 group-hover:from-[#B8960C]/10 group-hover:to-[#B8960C]/20 transition-all">
                  {client.firstName[0]}{client.lastName[0]}
                </div>

                {/* Main info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-stone-800 group-hover:text-[#B8960C] transition-colors truncate">
                      {client.firstName} {client.lastName}
                    </span>
                    {flag && <span className="text-sm leading-none">{flag}</span>}
                    <ClientClassBadge clientClass={computedCls} />
                  </div>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    {client.budgetMin != null && client.budgetMax != null && (
                      <span className="text-[11px] font-semibold text-[#B8960C]">
                        {formatBudget(client.budgetMin)} – {formatBudget(client.budgetMax)}
                      </span>
                    )}
                    {client.propertyInterest && (
                      <span className="text-[11px] text-stone-400 italic truncate max-w-[200px]">
                        {client.propertyInterest}
                      </span>
                    )}
                  </div>
                </div>

                {/* Stage + agent */}
                <div className="text-right shrink-0">
                  <div className="flex items-center gap-1.5 justify-end mb-0.5">
                    <span className={cn("w-1.5 h-1.5 rounded-full", stageDot)} />
                    <span className="text-[11px] text-stone-500 font-medium">{stageLabel}</span>
                  </div>
                  {client.primaryAgent && (
                    <span className="text-[10px] text-stone-400">{client.primaryAgent}</span>
                  )}
                </div>

                {/* Chevron */}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-stone-300 group-hover:text-[#B8960C] shrink-0 transition-colors">
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
