"use client";

import { cn } from "@/lib/utils";
import { ClientCard } from "./client-card";
import type { Client } from "@/types";

interface StageConfig {
  id: string;
  label: string;
  description: string;
  color: string;
}

interface StageColumnProps {
  stage: StageConfig;
  clients: Client[];
  onClientClick?: (client: Client) => void;
}

const ACCENT: Record<string, { dot: string; border: string }> = {
  new_inquiry:           { dot: "bg-sky-400",     border: "border-l-sky-400"     },
  qualified:             { dot: "bg-violet-500",  border: "border-l-violet-500"  },
  property_presentation: { dot: "bg-indigo-500",  border: "border-l-indigo-500"  },
  offer_submitted:       { dot: "bg-[#B8960C]",   border: "border-l-[#B8960C]"   },
  negotiation:           { dot: "bg-orange-500",  border: "border-l-orange-500"  },
  legal_process:         { dot: "bg-[#CD853F]",   border: "border-l-[#CD853F]"   },
  signed_closed:         { dot: "bg-emerald-500", border: "border-l-emerald-500" },
};

export function StageColumn({ stage, clients, onClientClick }: StageColumnProps) {
  const accent = ACCENT[stage.id] ?? { dot: "bg-stone-400", border: "border-l-stone-400" };

  return (
    <div
      className={cn(
        "w-[272px] shrink-0 flex flex-col rounded-xl border border-stone-200",
        "bg-white/60 shadow-sm overflow-hidden border-l-4",
        accent.border
      )}
    >
      {/* Header */}
      <div className="px-4 pt-4 pb-3 border-b border-stone-100 bg-white/80">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className={cn("w-2 h-2 rounded-full shrink-0", accent.dot)} />
            <span className="text-[11px] font-bold uppercase tracking-wider text-stone-700 truncate">
              {stage.label}
            </span>
          </div>
          <span className={cn(
            "inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[11px] font-semibold shrink-0",
            clients.length > 0 ? "bg-[#B8960C] text-white" : "bg-stone-100 text-stone-400"
          )}>
            {clients.length}
          </span>
        </div>
        <p className="mt-1 text-[10px] text-stone-400 leading-snug pl-[18px]">
          {stage.description}
        </p>
      </div>

      {/* Card list */}
      <div
        className="flex-1 overflow-y-auto px-3 py-3 flex flex-col gap-2.5"
        style={{ maxHeight: "calc(100vh - 210px)" }}
      >
        {clients.length > 0 ? (
          clients.map((client) => (
            <ClientCard
              key={client.id}
              client={client}
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
