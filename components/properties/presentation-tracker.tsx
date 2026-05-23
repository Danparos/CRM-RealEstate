"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { getPresentationsByProperty } from "@/lib/db/presentations";
import type { Presentation } from "@/lib/db/presentations";

interface Props {
  propertyId: string;
}

function formatDate(iso?: string): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export function PresentationTracker({ propertyId }: Props) {
  const [records, setRecords] = useState<Presentation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPresentationsByProperty(propertyId)
      .then(setRecords)
      .finally(() => setLoading(false));
  }, [propertyId]);

  if (loading) return null;
  if (records.length === 0) return null;

  return (
    <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between">
        <h2 className="font-serif text-xl font-bold text-stone-900">Sent Presentations</h2>
        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-stone-100 text-stone-500">{records.length}</span>
      </div>
      <div className="divide-y divide-stone-100">
        {records.map((r) => {
          const status = r.acceptedAt ? "accepted" : r.openedAt ? "opened" : "sent";
          return (
            <div key={r.id} className="px-6 py-4 flex items-center gap-4">
              {/* Status dot */}
              <div className={cn(
                "w-2.5 h-2.5 rounded-full shrink-0",
                status === "accepted" ? "bg-emerald-400" : status === "opened" ? "bg-amber-400" : "bg-stone-300"
              )} />

              {/* Client info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-stone-800">{r.clientName}</p>
                <p className="text-[11px] text-stone-400">{r.clientEmail}</p>
              </div>

              {/* Timeline */}
              <div className="text-right shrink-0 space-y-0.5">
                <p className="text-[10px] text-stone-400">Sent: <span className="text-stone-600">{formatDate(r.sentAt)}</span></p>
                {r.openedAt && <p className="text-[10px] text-stone-400">Opened: <span className="text-amber-600">{formatDate(r.openedAt)}</span></p>}
                {r.acceptedAt && (
                  <p className="text-[10px] text-stone-400">
                    Accepted: <span className="text-emerald-600 font-semibold">{formatDate(r.acceptedAt)}</span>
                    {r.acceptedName && <span className="text-stone-400"> by {r.acceptedName}</span>}
                  </p>
                )}
              </div>

              {/* Status badge */}
              <span className={cn(
                "shrink-0 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full",
                status === "accepted" ? "bg-emerald-100 text-emerald-700" :
                status === "opened"   ? "bg-amber-100 text-amber-700" :
                                        "bg-stone-100 text-stone-500"
              )}>
                {status === "accepted" ? "✓ Accepted" : status === "opened" ? "Opened" : "Sent"}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
