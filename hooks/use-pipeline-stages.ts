"use client";

import { useState, useEffect, useCallback } from "react";
import { PIPELINE_STAGES } from "@/lib/mock-data";
import type { PipelineStage } from "@/types";

export interface EditableStage {
  id: string;           // slug e.g. "new_inquiry" — can be custom e.g. "pre_qualification"
  label: string;
  description: string;
  color: string;
  enterTrigger: string;
  exitTrigger: string;
  slaWarningDays: number;
}

const STORAGE_KEY = "paros_crm_pipeline_stages_v1";

function defaultStages(): EditableStage[] {
  return PIPELINE_STAGES.map((s) => {
    const slaMap: Record<string, number> = {
      new_inquiry: 7, qualified: 14, property_presentation: 21,
      offer_submitted: 5, negotiation: 10, legal_process: 30, signed_closed: 9999,
    };
    const triggerMap: Record<string, { enter: string; exit: string }> = {
      new_inquiry:           { enter: "Website form, portal lead, referral, cold outreach, or manual entry", exit: "Budget, intent & timeline confirmed in qualification call" },
      qualified:             { enter: "Qualification call completed — budget, intent & timeline confirmed", exit: "At least one matching property sent / property shortlist shared" },
      property_presentation: { enter: "Curated shortlist sent (PDF, virtual tour, or in-person viewing booked)", exit: "Client confirms interest in specific property — formal offer prepared" },
      offer_submitted:       { enter: "Written offer submitted to seller (via agent or notary)", exit: "Offer accepted, countered, or rejected → negotiation or back to presentation" },
      negotiation:           { enter: "Seller counter-offer received — price or terms under active discussion", exit: "Price & terms agreed in writing → legal process begins" },
      legal_process:         { enter: "Heads of terms signed — notary, title search & tax clearance initiated", exit: "Final contract (συμβόλαιο) signed and keys transferred" },
      signed_closed:         { enter: "Final contract signed by both parties — deal officially closed", exit: "N/A — terminal stage. Archive after post-sale follow-up complete." },
    };
    return {
      id: s.id,
      label: s.label,
      description: s.description,
      color: s.color,
      enterTrigger: triggerMap[s.id]?.enter ?? "",
      exitTrigger: triggerMap[s.id]?.exit ?? "",
      slaWarningDays: slaMap[s.id] ?? 14,
    };
  });
}

export function usePipelineStages() {
  const [stages, setStages] = useState<EditableStage[]>(defaultStages);
  const [loaded, setLoaded] = useState(false);

  // Load from localStorage on mount (client-only)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as EditableStage[];
        if (Array.isArray(parsed) && parsed.length > 0) setStages(parsed);
      }
    } catch {}
    setLoaded(true);
  }, []);

  // Persist whenever stages change (after initial load)
  useEffect(() => {
    if (!loaded) return;
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(stages)); } catch {}
  }, [stages, loaded]);

  const updateStage = useCallback((id: string, updates: Partial<EditableStage>) => {
    setStages((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)));
  }, []);

  const addStage = useCallback((after?: string) => {
    const newStage: EditableStage = {
      id: `stage_${Date.now()}`,
      label: "New Stage",
      description: "Describe this stage",
      color: "#8b5cf6",
      enterTrigger: "",
      exitTrigger: "",
      slaWarningDays: 14,
    };
    setStages((prev) => {
      if (!after) return [...prev, newStage];
      const idx = prev.findIndex((s) => s.id === after);
      const next = [...prev];
      next.splice(idx + 1, 0, newStage);
      return next;
    });
    return newStage.id;
  }, []);

  const deleteStage = useCallback((id: string) => {
    setStages((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const moveStage = useCallback((id: string, direction: "up" | "down") => {
    setStages((prev) => {
      const idx = prev.findIndex((s) => s.id === id);
      if (idx < 0) return prev;
      const target = direction === "up" ? idx - 1 : idx + 1;
      if (target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      [next[idx], next[target]] = [next[target], next[idx]];
      return next;
    });
  }, []);

  const resetToDefaults = useCallback(() => {
    setStages(defaultStages());
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
  }, []);

  return { stages, updateStage, addStage, deleteStage, moveStage, resetToDefaults, loaded };
}
