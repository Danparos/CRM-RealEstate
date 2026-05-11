"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Waves, Droplets, Eye, ArrowRight } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { getAllProperties } from "@/lib/db/properties";
import type { Property, PropertyStatus, PropertyType } from "@/types";

const STATUS_CONFIG: Record<PropertyStatus, { label: string; dotClass: string; badgeClass: string }> = {
  available:      { label: "Available",      dotClass: "bg-emerald-400", badgeClass: "bg-emerald-50  text-emerald-700  border-emerald-200"  },
  under_offer:    { label: "Under Offer",    dotClass: "bg-amber-400",   badgeClass: "bg-amber-50    text-amber-700    border-amber-200"    },
  under_contract: { label: "Under Contract", dotClass: "bg-orange-400",  badgeClass: "bg-orange-50   text-orange-700   border-orange-200"   },
  sold:           { label: "Sold",           dotClass: "bg-stone-400",   badgeClass: "bg-stone-100   text-stone-600    border-stone-300"    },
  off_market:     { label: "Off Market",     dotClass: "bg-slate-400",   badgeClass: "bg-slate-50    text-slate-600    border-slate-300"    },
  draft:          { label: "Draft",          dotClass: "bg-gray-300",    badgeClass: "bg-gray-50     text-gray-500     border-gray-200"     },
  rented:         { label: "Rented",         dotClass: "bg-sky-400",     badgeClass: "bg-sky-50      text-sky-700      border-sky-200"      },
  withdrawn:      { label: "Withdrawn",      dotClass: "bg-red-400",     badgeClass: "bg-red-50      text-red-600      border-red-200"      },
  archived:       { label: "Archived",       dotClass: "bg-neutral-300", badgeClass: "bg-neutral-50  text-neutral-500  border-neutral-200"  },
};

const TYPE_LABELS: Record<PropertyType, string> = {
  villa: "Villa", apartment: "Apartment", house: "House", plot: "Plot",
  investment: "Investment", renovation_project: "Renovation Project",
  new_project: "New Project", opportunity: "Opportunity",
  cycladic: "Cycladic", maisonette: "Maisonette", studio: "Studio",
  land: "Land", commercial: "Commercial", hotel: "Hotel",
};

interface Props {
  serverProperties?: Property[];
  statusFilter?: PropertyStatus;
}

function PropertyCard({ property }: { property: Property }) {
  const statusCfg = STATUS_CONFIG[property.status] ?? STATUS_CONFIG.draft;
  const typeLabel = TYPE_LABELS[property.type] ?? property.type;
  return (
    <Link href={`/properties/${property.id}`}
      className="relative flex flex-col rounded-xl bg-white border border-stone-200 shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-150 ease-out overflow-hidden group">
      <div className="h-44 w-full shrink-0 relative overflow-hidden bg-gradient-to-br from-warm-100 via-warm-200 to-stone-200">
        {property.coverImage && (
          <img src={property.coverImage} alt={property.title.en} className="absolute inset-0 w-full h-full object-cover" />
        )}
        <span className="absolute bottom-3 left-3 inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-wide bg-white/90 text-stone-700 shadow-sm border border-stone-200">
          {property.area}
        </span>
        <span className="absolute top-3 left-3 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold tracking-widest bg-[#B8960C] text-white shadow-sm">
          {property.reference}
        </span>
        <div className="absolute top-3 right-3 flex items-center gap-1.5">
          {property.seafront && <span title="Seafront" className="flex items-center justify-center h-6 w-6 rounded-full bg-sky-500/90 shadow-sm"><Waves size={13} strokeWidth={2} className="text-white" /></span>}
          {property.pool && <span title="Pool" className="flex items-center justify-center h-6 w-6 rounded-full bg-[#B8960C]/90 shadow-sm"><Droplets size={13} strokeWidth={2} className="text-white" /></span>}
          {property.seaView && !property.seafront && <span title="Sea View" className="flex items-center justify-center h-6 w-6 rounded-full bg-slate-600/80 shadow-sm"><Eye size={13} strokeWidth={2} className="text-white" /></span>}
        </div>
      </div>
      <div className="flex flex-col gap-2.5 px-4 py-3.5">
        <h2 className="font-serif text-xl font-bold text-stone-900 leading-snug truncate">{property.title.en}</h2>
        <p className="text-[22px] font-semibold tracking-tight text-[#B8960C] leading-none">{formatCurrency(property.askingPrice)}</p>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-stone-100 text-stone-600 border border-stone-200 tracking-wide">{typeLabel}</span>
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium border tracking-wide ${statusCfg.badgeClass}`}>
            <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${statusCfg.dotClass}`} />
            {statusCfg.label}
          </span>
        </div>
        <div className="flex items-center justify-between gap-2 border-t border-stone-100 pt-2.5">
          <div className="flex items-center gap-3 text-[12px] text-stone-500">
            <span className="flex items-center gap-1">
              <svg className="h-3.5 w-3.5 text-stone-400 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v8.25" /></svg>
              <span className="font-medium text-stone-700">{property.bedrooms}</span><span>bed</span>
            </span>
            <span className="text-stone-300">·</span>
            <span className="flex items-center gap-1">
              <svg className="h-3.5 w-3.5 text-stone-400 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /></svg>
              <span className="font-medium text-stone-700">{property.bathrooms}</span><span>bath</span>
            </span>
            <span className="text-stone-300">·</span>
            <span className="flex items-center gap-1">
              <svg className="h-3.5 w-3.5 text-stone-400 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" /></svg>
              <span className="font-medium text-stone-700">{property.buildArea.toLocaleString("en-DE")} m²</span>
            </span>
          </div>
          <ArrowRight size={14} className="text-stone-300 group-hover:text-[#B8960C] transition-colors shrink-0" />
        </div>
      </div>
    </Link>
  );
}

export function PropertyGridClient({ serverProperties = [], statusFilter }: Props) {
  const [allProperties, setAllProperties] = useState<Property[]>(serverProperties);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllProperties()
      .then(setAllProperties)
      .finally(() => setLoading(false));
  }, []);

  const filtered = statusFilter
    ? allProperties.filter(p => p.status === statusFilter)
    : allProperties;

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-64 rounded-xl bg-stone-100 animate-pulse" />
        ))}
      </div>
    );
  }

  if (filtered.length === 0) {
    return <div className="py-16 text-center text-stone-400 text-sm">No properties match this filter.</div>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {filtered.map(property => <PropertyCard key={property.id} property={property} />)}
    </div>
  );
}
