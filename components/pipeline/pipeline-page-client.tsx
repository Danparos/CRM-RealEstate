"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PipelineBoard } from "@/components/pipeline/pipeline-board";
import { ClientCard } from "@/components/clients/client-card";
import { ManageStagesDialog } from "@/components/pipeline/manage-stages-dialog";
import { usePipelineStages } from "@/hooks/use-pipeline-stages";
import { getAllClients, updateClientStage } from "@/lib/db/clients";
import { cn } from "@/lib/utils";
import type { Client } from "@/types";

const STAGE_ACCENT: Record<string, { dot: string; border: string; bg: string }> = {
  new_inquiry:           { dot: "bg-sky-400",     border: "border-sky-400",     bg: "bg-sky-50"     },
  qualified:             { dot: "bg-violet-500",  border: "border-violet-500",  bg: "bg-violet-50"  },
  property_presentation: { dot: "bg-indigo-500",  border: "border-indigo-500",  bg: "bg-indigo-50"  },
  offer_submitted:       { dot: "bg-[#B8960C]",   border: "border-[#B8960C]",   bg: "bg-amber-50"   },
  negotiation:           { dot: "bg-orange-500",  border: "border-orange-500",  bg: "bg-orange-50"  },
  legal_process:         { dot: "bg-[#CD853F]",   border: "border-[#CD853F]",   bg: "bg-orange-50"  },
  signed_closed:         { dot: "bg-emerald-500", border: "border-emerald-500", bg: "bg-emerald-50" },
};

export function PipelinePageClient() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const activeStage  = searchParams.get("stage");

  const [allClients, setAllClients] = useState<Client[]>([]);
  const [loading, setLoading]       = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [manageOpen, setManageOpen] = useState(false);

  const {
    stages, updateStage, addStage, deleteStage, moveStage, resetToDefaults, loaded,
  } = usePipelineStages();

  useEffect(() => {
    getAllClients()
      .then((clients) => {
        setAllClients(clients.filter((c) => !c.archived));
      })
      .catch((err) => {
        setFetchError(String(err));
      })
      .finally(() => setLoading(false));
  }, []);

  const handleMoveStage = useCallback(async (clientId: string, newStageId: string) => {
    const newStage    = newStageId as Client["stage"];
    const now         = new Date().toISOString();
    const stageLabel  = stages.find(s => s.id === newStageId)?.label ?? newStageId;

    // Optimistic update
    setAllClients((prev) =>
      prev.map((c) =>
        c.id === clientId
          ? { ...c, stage: newStage, stageEnteredAt: now, lastActivityAt: now, lastActivityNote: `Moved to ${stageLabel}` }
          : c
      )
    );

    // Persist to DB — revert on failure
    try {
      await updateClientStage(clientId, newStage, `Moved to ${stageLabel}`);
    } catch {
      // Revert: reload from DB
      getAllClients().then(setAllClients);
    }
  }, [stages]);

  const clientCountByStage = allClients.reduce<Record<string, number>>((acc, c) => {
    acc[c.stage] = (acc[c.stage] ?? 0) + 1;
    return acc;
  }, {});

  if (loading || !loaded) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 rounded-full border-2 border-[#B8960C] border-t-transparent animate-spin" />
          <p className="text-sm text-stone-400">Loading pipeline…</p>
        </div>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="flex flex-col items-center gap-3 max-w-md text-center">
          <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          </div>
          <p className="text-sm font-semibold text-stone-700">Failed to load clients</p>
          <p className="text-xs text-stone-400 font-mono break-all">{fetchError}</p>
          <button
            onClick={() => { setFetchError(null); setLoading(true); getAllClients().then((c) => setAllClients(c.filter(x => !x.archived))).catch((e) => setFetchError(String(e))).finally(() => setLoading(false)); }}
            className="mt-2 px-4 py-2 rounded-lg bg-stone-100 hover:bg-stone-200 text-sm font-medium text-stone-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (activeStage) {
    const stageCfg = stages.find(s => s.id === activeStage);
    const clients  = allClients.filter(c => c.stage === activeStage);
    const accent   = STAGE_ACCENT[activeStage] ?? { dot: "bg-stone-400", border: "border-stone-300", bg: "bg-stone-50" };

    return (
      <div className="flex flex-col gap-5 pb-8">
        <div className="flex items-end justify-between gap-4 px-1 pb-2 border-b border-stone-100">
          <div>
            <h1 className="font-serif text-[36px] font-semibold leading-none tracking-wide text-stone-900">
              Pipeline
              <span className="text-stone-300 mx-3 font-light">/</span>
              <span className="text-[#B8960C]">{stageCfg?.label ?? activeStage}</span>
            </h1>
            <p className="mt-2 text-[13px] uppercase tracking-[0.2em] text-stone-400 font-medium">
              Deal flow &amp; stage tracking
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className={cn("flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold", accent.bg, accent.border)}>
              <span className={cn("w-2 h-2 rounded-full shrink-0", accent.dot)} />
              <span className="text-stone-700">{stageCfg?.label ?? activeStage}</span>
            </div>
            <div className="rounded-xl border border-stone-200 bg-white px-4 py-2.5 shadow-sm shrink-0">
              <p className="text-[10px] uppercase tracking-wider font-semibold text-stone-400 mb-0.5">Clients</p>
              <p className="text-lg font-bold leading-none text-stone-700">{clients.length}</p>
            </div>
          </div>
        </div>

        {clients.length > 0 ? (
          <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))" }}>
            {clients.map(client => (
              <ClientCard key={client.id} client={client} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 rounded-xl border-2 border-dashed border-stone-200 text-center bg-stone-50/50">
            <div className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center mb-3">
              <span className="text-stone-400 text-xl">—</span>
            </div>
            <p className="text-sm font-medium text-stone-400">No clients in this stage</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      <div className="h-full flex flex-col">
        <PipelineBoard
          clients={allClients}
          stages={stages}
          onClientClick={(c) => router.push(`/clients/${c.id}`)}
          onManageStages={() => setManageOpen(true)}
          onMoveStage={handleMoveStage}
        />
      </div>

      <ManageStagesDialog
        open={manageOpen}
        stages={stages}
        onClose={() => setManageOpen(false)}
        onUpdate={updateStage}
        onAdd={addStage}
        onDelete={deleteStage}
        onMove={moveStage}
        onReset={resetToDefaults}
        clientCountByStage={clientCountByStage}
      />
    </>
  );
}
