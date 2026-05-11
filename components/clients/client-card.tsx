"use client";

import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { ClientClassBadge } from "@/components/crm/client-class-badge";
import { PriceGroupBadge } from "@/components/crm/price-group-badge";
import { PipelineStageBadge } from "@/components/crm/pipeline-stage-badge";
import { Avatar } from "@/components/ui/avatar";
import type { Client } from "@/types";

const FLAGS: Record<string, string> = {
  DE: "🇩🇪", FR: "🇫🇷", GB: "🇬🇧", GR: "🇬🇷",
  IL: "🇮🇱", US: "🇺🇸", NL: "🇳🇱", CH: "🇨🇭",
};

function fmt(v: number) {
  if (v >= 1_000_000) { const m = v / 1_000_000; return `€${m % 1 === 0 ? m.toFixed(0) : m.toFixed(1)}M`; }
  const k = v / 1_000; return `€${k % 1 === 0 ? k.toFixed(0) : k.toFixed(1)}K`;
}

function budgetRange(min?: number, max?: number) {
  if (!min && !max) return null;
  if (min && max) return `${fmt(min)} – ${fmt(max)}`;
  return min ? `from ${fmt(min)}` : `up to ${fmt(max!)}`;
}

function relTime(d: string) {
  const m = Math.floor((Date.now() - +new Date(d)) / 60000);
  if (m < 1) return "just now"; if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60); if (h < 24) return `${h}h ago`;
  const days = Math.floor(h / 24); if (days < 7) return `${days}d ago`;
  return `${Math.floor(days / 7)}w ago`;
}

const BORDER: Record<string, string> = {
  A: "border-l-[3px] border-l-[#B8960C]",
  B: "border-l-[3px] border-l-[#CD853F]",
  C: "border-l-[3px] border-l-stone-200",
};

export function ClientCard({ client }: { client: Client }) {
  const router = useRouter();
  const range = budgetRange(client.budgetMin, client.budgetMax);
  const daysInStage = client.stageEnteredAt
    ? Math.floor((Date.now() - +new Date(client.stageEnteredAt)) / 86_400_000)
    : null;

  return (
    <div
      onClick={() => router.push(`/clients/${client.id}`)}
      className={cn(
        "relative flex flex-col gap-2 rounded-xl bg-white px-4 py-3 cursor-pointer",
        "border border-stone-200",
        BORDER[client.clientClass] ?? "",
        "shadow-sm transition-all duration-150 ease-out",
        "hover:-translate-y-0.5 hover:shadow-md"
      )}
    >
      {/* Name + class */}
      <div className="flex items-center justify-between gap-2">
        <span className="font-serif text-lg font-bold text-gray-900 leading-tight truncate">
          {client.firstName} {client.lastName}
        </span>
        <ClientClassBadge clientClass={client.clientClass} />
      </div>

      {/* Flag + language + price group */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {client.nationality && FLAGS[client.nationality] && (
          <span className="text-sm leading-none">{FLAGS[client.nationality]}</span>
        )}
        {client.language && (
          <span className="text-[11px] text-stone-400 uppercase tracking-wide">{client.language}</span>
        )}
        {client.priceGroup && (
          <div className="ml-auto shrink-0">
            <PriceGroupBadge group={client.priceGroup} />
          </div>
        )}
      </div>

      {/* Budget */}
      {range && <div className="text-xs font-semibold text-[#B8960C] tracking-wide">{range}</div>}

      {/* Stage */}
      <div><PipelineStageBadge stage={client.stage} size="sm" /></div>

      {/* Property interest */}
      {client.propertyInterest && (
        <p className="text-[11px] italic text-stone-400 leading-snug line-clamp-1">
          {client.propertyInterest}
        </p>
      )}

      {/* Agent */}
      {client.primaryAgent && (
        <div className="flex items-center gap-1.5">
          <Avatar name={client.primaryAgent} size="xs" />
          <span className="text-[11px] text-stone-500 truncate">{client.primaryAgent}</span>
        </div>
      )}

      {/* Email — stops propagation so clicking it opens mail, not the detail page */}
      {client.email && (
        <a
          href={`mailto:${client.email}`}
          onClick={(e) => e.stopPropagation()}
          className="flex items-center gap-1.5 group w-fit"
        >
          <svg className="h-3 w-3 text-stone-300 group-hover:text-[#B8960C] transition-colors shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
          </svg>
          <span className="text-[11px] text-stone-400 group-hover:text-[#B8960C] transition-colors truncate">
            {client.email}
          </span>
        </a>
      )}

      {/* Last activity */}
      {client.lastActivityAt && (
        <div className="flex items-start gap-1 border-t border-stone-100 pt-1.5 mt-0.5">
          <span className="text-[11px] text-stone-400 shrink-0 tabular-nums">
            {relTime(client.lastActivityAt)}
          </span>
          {client.lastActivityNote && (
            <>
              <span className="text-[11px] text-stone-300">·</span>
              <span className="text-[11px] text-stone-400 truncate leading-snug">
                {client.lastActivityNote}
              </span>
            </>
          )}
        </div>
      )}

      {daysInStage != null && daysInStage > 14 && (
        <span className="absolute top-3 right-3 h-2 w-2 rounded-full bg-orange-400" title={`${daysInStage} days in stage`} />
      )}
    </div>
  );
}
