import type { ClientClass, PipelineStage } from "@/types";

// A = Hot  : last activity ≤ 90 days
// B = Warm : last activity 91-365 days
// C = Cold : last activity > 365 days  OR no activity recorded
export function computeClientClass(lastActivityAt?: string): ClientClass {
  if (!lastActivityAt) return "C";
  const days = Math.floor((Date.now() - new Date(lastActivityAt).getTime()) / 86_400_000);
  if (days <= 90)  return "A";
  if (days <= 365) return "B";
  return "C";
}

export function getClassLabel(c: ClientClass): string {
  return { A: "Hot", B: "Warm", C: "Cold" }[c];
}

export function daysInStage(stageEnteredAt?: string): number | null {
  if (!stageEnteredAt) return null;
  return Math.floor((Date.now() - new Date(stageEnteredAt).getTime()) / 86_400_000);
}

// Returns true when a client's days in stage exceed the configured SLA threshold
export function daysInStageWarning(days: number, threshold: number): boolean {
  return days > threshold;
}

export interface StageRule {
  id: PipelineStage;
  enterTrigger: string;
  exitTrigger: string;
  slaWarningDays: number;
}

export const STAGE_RULES: StageRule[] = [
  {
    id: "new_inquiry",
    enterTrigger: "Website form, portal lead, referral, cold outreach, or manual entry",
    exitTrigger: "Budget, intent & timeline confirmed in qualification call",
    slaWarningDays: 7,
  },
  {
    id: "qualified",
    enterTrigger: "Qualification call completed — budget, intent & timeline confirmed",
    exitTrigger: "At least one matching property sent / property shortlist shared",
    slaWarningDays: 14,
  },
  {
    id: "property_presentation",
    enterTrigger: "Curated shortlist sent (PDF, virtual tour, or in-person viewing booked)",
    exitTrigger: "Client confirms interest in specific property — formal offer prepared",
    slaWarningDays: 21,
  },
  {
    id: "offer_submitted",
    enterTrigger: "Written offer submitted to seller (via agent or notary)",
    exitTrigger: "Offer accepted, countered, or rejected → negotiation or back to presentation",
    slaWarningDays: 5,
  },
  {
    id: "negotiation",
    enterTrigger: "Seller counter-offer received — price or terms under active discussion",
    exitTrigger: "Price & terms agreed in writing → legal process begins",
    slaWarningDays: 10,
  },
  {
    id: "legal_process",
    enterTrigger: "Heads of terms signed — notary, title search & tax clearance initiated",
    exitTrigger: "Final contract (συμβόλαιο) signed and keys transferred",
    slaWarningDays: 30,
  },
  {
    id: "signed_closed",
    enterTrigger: "Final contract signed by both parties — deal officially closed",
    exitTrigger: "N/A — terminal stage. Archive after post-sale follow-up complete.",
    slaWarningDays: 9999,
  },
];
