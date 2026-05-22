"use client";

import { cn } from "@/lib/utils";
import { StageColumn } from "./stage-column";
import { computeClientClass } from "@/lib/classification";
import type { EditableStage } from "@/hooks/use-pipeline-stages";
import type { Client } from "@/types";

interface PipelineBoardProps {
  clients: Client[];
  stages: EditableStage[];
  onClientClick?: (client: Client) => void;
  onManageStages?: () => void;
  onMoveStage?: (clientId: string, newStageId: string) => void;
}

function StatPill({
  label, value, sub, accent,
}: {
  label: string;
  value: string | number;
  sub?: string;
  accent?: "gold" | "bronze" | "neutral" | "green";
}) {
  const wrap = {
    gold:    "border-[#B8960C]/30 bg-gradient-to-br from-amber-50 to-white",
    bronze:  "border-[#CD853F]/30 bg-gradient-to-br from-orange-50 to-white",
    green:   "border-emerald-300/50 bg-gradient-to-br from-emerald-50 to-white",
    neutral: "border-stone-200 bg-white",
  }[accent ?? "neutral"];
  const val = {
    gold:    "text-[#B8960C]",
    bronze:  "text-[#CD853F]",
    green:   "text-emerald-600",
    neutral: "text-stone-700",
  }[accent ?? "neutral"];

  return (
    <div className={cn("rounded-xl border px-4 py-2.5 shadow-sm shrink-0", wrap)}>
      <p className="text-[10px] uppercase tracking-wider font-semibold text-stone-400 mb-0.5">{label}</p>
      <p className={cn("text-lg font-bold leading-none", val)}>{value}</p>
      {sub && <p className="text-[10px] text-stone-400 mt-0.5">{sub}</p>}
    </div>
  );
}

export function PipelineBoard({ clients, stages, onClientClick, onManageStages, onMoveStage }: PipelineBoardProps) {
  const activeClients = clients.filter((c) => c.stage !== "signed_closed");
  const closedClients = clients.filter((c) => c.stage === "signed_closed");
  const totalValue    = activeClients.reduce((s, c) => s + (c.budgetMax ?? 0), 0);

  const byClass = { A: 0, B: 0, C: 0 };
  activeClients.forEach((c) => {
    const cls = computeClientClass(c.lastActivityAt);
    byClass[cls]++;
  });

  function formatValue(n: number): string {
    if (n >= 1_000_000) return `€${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000)     return `€${(n / 1_000).toFixed(0)}K`;
    return `€${n}`;
  }

  return (
    <div className="flex flex-col gap-5 h-full min-h-0">
      {/* Page header */}
      <div className="flex items-end justify-between gap-4 px-1 pb-2 border-b border-stone-100">
        <div>
          <h1 className="font-serif text-[36px] font-semibold leading-none tracking-wide text-stone-900">
            Pipeline
          </h1>
          <p className="mt-2 text-[13px] uppercase tracking-[0.2em] text-stone-400 font-medium">
            Deal flow &amp; stage tracking
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap justify-end">
          <StatPill label="Active Clients" value={activeClients.length} sub={`${stages.length} stages`} />
          <StatPill label="Pipeline Value" value={formatValue(totalValue)} sub="sum of max budgets" accent="gold" />
          <StatPill label="Closed" value={closedClients.length} sub="signed & closed" accent="green" />
          {onManageStages && (
            <button
              type="button"
              onClick={onManageStages}
              className={cn(
                "h-full flex items-center gap-2 px-4 py-2.5 rounded-xl border border-stone-200 bg-white shadow-sm",
                "text-[12px] font-semibold text-stone-500 hover:text-stone-800 hover:border-stone-300",
                "transition-all duration-150 shrink-0"
              )}
              title="Add, edit or delete pipeline stages"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3"/>
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/>
                <path d="M12 2v2M12 20v2M2 12h2M20 12h2"/>
              </svg>
              Stages
            </button>
          )}
        </div>
      </div>

      {/* Classification legend */}
      <div className="flex items-center gap-4 px-1 flex-wrap">
        <span className="text-[10px] uppercase tracking-wider text-stone-400 font-semibold shrink-0">Client Class</span>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#B8960C] shrink-0" />
            <span className="text-[11px] font-semibold text-[#B8960C]">A — Hot</span>
            <span className="text-[11px] text-stone-400">({byClass.A} clients · ≤ 3 months active)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#CD853F] shrink-0" />
            <span className="text-[11px] font-semibold text-[#CD853F]">B — Warm</span>
            <span className="text-[11px] text-stone-400">({byClass.B} clients · 3–12 months)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-stone-400 shrink-0" />
            <span className="text-[11px] font-semibold text-stone-500">C — Cold</span>
            <span className="text-[11px] text-stone-400">({byClass.C} clients · 12+ months)</span>
          </div>
        </div>
        <span className="text-[10px] text-stone-300 italic shrink-0 hidden lg:inline">Auto-computed from last activity date</span>
      </div>

      {/* Board */}
      <div className="flex gap-4 overflow-x-auto pb-4 flex-1 min-h-0">
        {stages.map((stage) => (
          <StageColumn
            key={stage.id}
            stage={stage}
            stages={stages}
            clients={clients.filter((c) => c.stage === stage.id)}
            onClientClick={onClientClick}
            onMoveStage={onMoveStage}
          />
        ))}
      </div>
    </div>
  );
}
