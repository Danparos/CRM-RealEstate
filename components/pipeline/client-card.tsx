"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { ClientClassBadge } from "@/components/crm/client-class-badge";
import { PriceGroupBadge } from "@/components/crm/price-group-badge";
import { Avatar } from "@/components/ui/avatar";
import { StagePicker } from "./stage-picker";
import { computeClientClass, daysInStage } from "@/lib/classification";
import type { EditableStage } from "@/hooks/use-pipeline-stages";
import type { Client } from "@/types";

interface ClientCardProps {
  client: Client;
  stages: EditableStage[];
  stageWarningDays?: number;
  onMoveStage?: (clientId: string, newStageId: string) => void;
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

export function ClientCard({ client, stages, stageWarningDays = 14, onMoveStage, onClick }: ClientCardProps) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [moved, setMoved]           = useState<string | null>(null);

  const flag         = client.nationality ? (NATIONALITY_FLAGS[client.nationality] ?? "") : "";
  const budgetRange  = formatBudgetRange(client.budgetMin, client.budgetMax);
  const stageDays    = daysInStage(client.stageEnteredAt);
  const computedCls  = computeClientClass(client.lastActivityAt);
  const mismatch     = computedCls !== client.clientClass;
  const stageWarning = stageDays != null && stageDays > stageWarningDays;
  const accentBorder = BORDER_ACCENT[client.clientClass] ?? "";

  function handleMove(newStageId: string) {
    const label = stages.find(s => s.id === newStageId)?.label ?? newStageId;
    setMoved(label);
    onMoveStage?.(client.id, newStageId);
    setTimeout(() => setMoved(null), 2000);
  }

  return (
    <div
      className={cn(
        "relative flex flex-col gap-2 rounded-lg bg-white px-4 py-3",
        "border border-stone-200",
        accentBorder,
        "shadow-sm transition-all duration-150 ease-out",
        "hover:-translate-y-0.5 hover:shadow-md",
      )}
    >
      {/* Moved confirmation flash */}
      {moved && (
        <div className="absolute inset-0 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center z-10 pointer-events-none">
          <span className="text-[12px] font-semibold text-emerald-600">→ {moved}</span>
        </div>
      )}

      {/* Clickable area (navigates to client) */}
      <div
        role="button"
        tabIndex={0}
        onClick={onClick}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") onClick?.(); }}
        className="flex flex-col gap-2 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B8960C]/50 rounded"
      >
        {/* Name + class */}
        <div className="flex items-center justify-between gap-2">
          <span className="font-serif text-sm font-medium text-gray-900 leading-tight truncate">
            {client.firstName} {client.lastName}
          </span>
          <div className="shrink-0 flex items-center gap-1">
            <ClientClassBadge clientClass={client.clientClass} />
            {mismatch && (
              <span
                className="text-[9px] text-orange-400 font-semibold leading-none"
                title={`Activity suggests class ${computedCls}`}
              >
                →{computedCls}?
              </span>
            )}
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

        {/* Agent + days in stage */}
        <div className="flex items-center justify-between gap-2">
          {client.primaryAgent && (
            <div className="flex items-center gap-1.5 min-w-0">
              <Avatar name={client.primaryAgent} size="xs" />
              <span className="text-[11px] text-stone-500 truncate">{client.primaryAgent}</span>
            </div>
          )}
          {stageDays != null && (
            <span
              className={cn(
                "text-[10px] font-semibold shrink-0 tabular-nums px-1.5 py-0.5 rounded-full",
                stageWarning ? "bg-orange-100 text-orange-500" : "bg-stone-100 text-stone-400"
              )}
              title={stageWarning ? "Overdue — consider advancing or re-engaging" : `${stageDays} days in this stage`}
            >
              {stageDays}d
            </span>
          )}
        </div>

        {/* Pipeline Stage row */}
        {stages.length > 0 && (
          <div className="border-t border-stone-100 pt-1.5 mt-0.5">
            <div className="relative flex items-center justify-between gap-2">
              <span className="text-[10px] uppercase tracking-wider font-semibold text-stone-400 shrink-0">
                Pipeline Stage
              </span>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); if (onMoveStage) setPickerOpen((p) => !p); }}
                className={cn(
                  "flex items-center gap-1.5 px-2 py-1 rounded-lg min-w-0",
                  onMoveStage
                    ? "hover:bg-stone-100 cursor-pointer transition-colors"
                    : "cursor-default"
                )}
              >
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: stages.find(s => s.id === client.stage)?.color ?? "#94a3b8" }}
                />
                <span className="text-[11px] font-semibold text-stone-700 truncate">
                  {stages.find(s => s.id === client.stage)?.label ?? client.stage}
                </span>
                {onMoveStage && (
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="shrink-0 text-stone-400">
                    <polyline points="6,9 12,15 18,9"/>
                  </svg>
                )}
              </button>

              {pickerOpen && (
                <StagePicker
                  stages={stages}
                  currentStageId={client.stage}
                  onSelect={handleMove}
                  onClose={() => setPickerOpen(false)}
                />
              )}
            </div>
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
      </div>

      {/* Stale warning dot */}
      {stageWarning && !pickerOpen && (
        <span
          className="absolute top-3 right-3 h-2 w-2 rounded-full bg-orange-400 animate-pulse"
          title={`${stageDays} days in this stage — SLA exceeded`}
        />
      )}
    </div>
  );
}
