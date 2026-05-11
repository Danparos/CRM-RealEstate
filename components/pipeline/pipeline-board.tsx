"use client";

import { cn, formatCurrency } from "@/lib/utils";
import { StageColumn } from "./stage-column";
import type { Client } from "@/types";

interface StageConfig {
  id: string;
  label: string;
  description: string;
  color: string;
}

interface PipelineBoardProps {
  clients: Client[];
  stages: StageConfig[];
  onClientClick?: (client: Client) => void;
}

function StatPill({
  label, value, sub, accent,
}: {
  label: string;
  value: string | number;
  sub?: string;
  accent?: "gold" | "bronze" | "neutral";
}) {
  const wrap = {
    gold:    "border-[#B8960C]/30 bg-gradient-to-br from-amber-50 to-white",
    bronze:  "border-[#CD853F]/30 bg-gradient-to-br from-orange-50 to-white",
    neutral: "border-stone-200 bg-white",
  }[accent ?? "neutral"];
  const val = {
    gold:    "text-[#B8960C]",
    bronze:  "text-[#CD853F]",
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

export function PipelineBoard({ clients, stages, onClientClick }: PipelineBoardProps) {
  const totalValue = clients.reduce((s, c) => s + (c.budgetMax ?? 0), 0);
  const byClass = { A: 0, B: 0, C: 0 };
  clients.forEach((c) => { if (c.clientClass in byClass) byClass[c.clientClass]++; });
  const active = clients.filter((c) => c.stage !== "signed_closed").length;
  const closed = clients.length - active;

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
        <StatPill label="Total Active Clients" value={clients.length} sub={`${stages.length} stages`} />
      </div>

      {/* Board */}
      <div className="flex gap-4 overflow-x-auto pb-4 flex-1 min-h-0">
        {stages.map((stage) => (
          <StageColumn
            key={stage.id}
            stage={stage}
            clients={clients.filter((c) => c.stage === stage.id)}
            onClientClick={onClientClick}
          />
        ))}
      </div>
    </div>
  );
}
