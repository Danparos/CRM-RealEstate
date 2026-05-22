"use client";

import { cn } from "@/lib/utils";
import { ClientCard } from "./client-card";
import type { EditableStage } from "@/hooks/use-pipeline-stages";
import type { Client } from "@/types";

interface StageColumnProps {
  stage: EditableStage;
  stages: EditableStage[];
  clients: Client[];
  onClientClick?: (client: Client) => void;
  onMoveStage?: (clientId: string, newStageId: string) => void;
}

export function StageColumn({ stage, stages, clients, onClientClick, onMoveStage }: StageColumnProps) {
  const totalVal = clients.reduce((s, c) => s + (c.budgetMax ?? 0), 0);

  function formatVal(n: number): string {
    if (n >= 1_000_000) return `€${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000)     return `€${(n / 1_000).toFixed(0)}K`;
    return n > 0 ? `€${n}` : "";
  }

  const isTerminal = stage.exitTrigger?.toLowerCase().startsWith("n/a");

  return (
    <div
      className={cn(
        "w-[272px] shrink-0 flex flex-col rounded-xl border border-stone-200",
        "bg-white/60 shadow-sm overflow-hidden border-l-4"
      )}
      style={{ borderLeftColor: stage.color }}
    >
      {/* Header */}
      <div className="px-4 pt-4 pb-3 border-b border-stone-100 bg-white/80">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span
              className="w-2 h-2 rounded-full shrink-0"
              style={{ backgroundColor: stage.color }}
            />
            <span className="text-[11px] font-bold uppercase tracking-wider text-stone-700 truncate">
              {stage.label}
            </span>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {totalVal > 0 && (
              <span className="text-[10px] font-semibold text-stone-400 tabular-nums">
                {formatVal(totalVal)}
              </span>
            )}
            <span className={cn(
              "inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[11px] font-semibold",
              clients.length > 0 ? "bg-[#B8960C] text-white" : "bg-stone-100 text-stone-400"
            )}>
              {clients.length}
            </span>
          </div>
        </div>
        <p className="mt-1 text-[10px] text-stone-400 leading-snug pl-[18px]">
          {stage.description}
        </p>
        {stage.exitTrigger && !isTerminal && (
          <p
            className="mt-1.5 text-[10px] text-stone-300 leading-snug pl-[18px] truncate"
            title={`Advance when: ${stage.exitTrigger}`}
          >
            <span className="font-semibold text-stone-400">→</span> {stage.exitTrigger}
          </p>
        )}
      </div>

      {/* Card list */}
      <div
        className="flex-1 overflow-y-auto px-3 py-3 flex flex-col gap-2.5"
        style={{ maxHeight: "calc(100vh - 240px)" }}
      >
        {clients.length > 0 ? (
          clients.map((client) => (
            <ClientCard
              key={client.id}
              client={client}
              stages={stages}
              stageWarningDays={stage.slaWarningDays}
              onMoveStage={onMoveStage}
              onClick={onClientClick ? () => onClientClick(client) : undefined}
            />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-10 rounded-lg border-2 border-dashed border-stone-200 text-center bg-stone-50/50">
            <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center mb-2">
              <span className="text-stone-400 text-sm">—</span>
            </div>
            <p className="text-[11px] font-medium text-stone-400">No clients</p>
          </div>
        )}
      </div>
    </div>
  );
}
