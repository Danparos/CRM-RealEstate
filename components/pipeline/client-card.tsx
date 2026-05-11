"use client";

import { cn } from "@/lib/utils";
import { ClientClassBadge } from "@/components/crm/client-class-badge";
import { PriceGroupBadge } from "@/components/crm/price-group-badge";
import { Avatar } from "@/components/ui/avatar";
import type { Client } from "@/types";

interface ClientCardProps {
  client: Client;
  onClick?: () => void;
}

const NATIONALITY_FLAGS: Record<string, string> = {
  DE: "🇩🇪", FR: "🇫🇷", GB: "🇬🇧", GR: "🇬🇷",
  IL: "🇮🇱", US: "🇺🇸", NL: "🇳🇱", CH: "🇨🇭",
};

function formatBudget(value: number): string {
  if (value >= 1_000_000) {
    const m = value / 1_000_000;
    return `€${m % 1 === 0 ? m.toFixed(0) : m.toFixed(1)}M`;
  }
  const k = value / 1_000;
  return `€${k % 1 === 0 ? k.toFixed(0) : k.toFixed(1)}K`;
}

function formatBudgetRange(min?: number, max?: number): string | null {
  if (min == null && max == null) return null;
  if (min != null && max != null) return `${formatBudget(min)} – ${formatBudget(max)}`;
  if (min != null) return `from ${formatBudget(min)}`;
  return `up to ${formatBudget(max!)}`;
}

function getRelativeTime(date: string): string {
  const diffMs = Date.now() - new Date(date).getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHrs = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHrs / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);
  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHrs < 24) return `${diffHrs}h ago`;
  if (diffDays === 1) return "yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffWeeks < 5) return `${diffWeeks}w ago`;
  return `${diffMonths}mo ago`;
}

const BORDER_ACCENT: Record<string, string> = {
  A: "border-l-[3px] border-l-[#B8960C]",
  B: "border-l-[3px] border-l-[#CD853F]",
  C: "border-l-[3px] border-l-stone-200",
};

export function ClientCard({ client, onClick }: ClientCardProps) {
  const flag = client.nationality ? (NATIONALITY_FLAGS[client.nationality] ?? "") : "";
  const budgetRange = formatBudgetRange(client.budgetMin, client.budgetMax);
  const daysInStage = client.stageEnteredAt
    ? Math.floor((Date.now() - new Date(client.stageEnteredAt).getTime()) / 86_400_000)
    : null;
  const showWarning = daysInStage != null && daysInStage > 14;
  const accentBorder = BORDER_ACCENT[client.clientClass] ?? "";

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") onClick?.(); }}
      className={cn(
        "relative flex flex-col gap-2 rounded-lg bg-white px-4 py-3",
        "border border-stone-200",
        accentBorder,
        "shadow-sm cursor-pointer transition-all duration-150 ease-out",
        "hover:-translate-y-0.5 hover:shadow-md",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B8960C]/50"
      )}
    >
      {/* Name + class */}
      <div className="flex items-center justify-between gap-2">
        <span className="font-serif text-sm font-medium text-gray-900 leading-tight truncate">
          {client.firstName} {client.lastName}
        </span>
        <div className="shrink-0">
          <ClientClassBadge clientClass={client.clientClass} />
        </div>
      </div>

      {/* Flag + price group */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {flag && <span className="text-sm leading-none">{flag}</span>}
        {client.language && (
          <span className="text-[11px] text-stone-400 uppercase tracking-wide">{client.language}</span>
        )}
        {client.priceGroup && (
          <div className="ml-auto shrink-0">
            <PriceGroupBadge group={client.priceGroup} />
          </div>
        )}
      </div>

      {/* Budget range */}
      {budgetRange && (
        <div className="text-xs font-semibold text-[#B8960C] tracking-wide">
          {budgetRange}
        </div>
      )}

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

      {/* Last activity */}
      {client.lastActivityAt && (
        <div className="flex items-start gap-1 border-t border-stone-100 pt-1.5 mt-0.5">
          <span className="text-[11px] text-stone-400 shrink-0 tabular-nums">
            {getRelativeTime(client.lastActivityAt)}
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

      {/* Stale warning dot */}
      {showWarning && (
        <span
          className="absolute top-3 right-3 h-2 w-2 rounded-full bg-orange-400"
          title={`${daysInStage} days in this stage`}
        />
      )}
    </div>
  );
}
