"use client";

import { cn } from "@/lib/utils";
import { LANG_LABELS, type BrochureSendRecord } from "@/lib/brochure-translations";

interface SendHistoryProps {
  records: BrochureSendRecord[];
}

function getRelativeTime(date: string): string {
  const diffMs   = Date.now() - new Date(date).getTime();
  const diffMin  = Math.floor(diffMs / 60000);
  const diffHrs  = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHrs / 24);
  if (diffMin < 1)  return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHrs < 24) return `${diffHrs}h ago`;
  if (diffDays === 1) return "yesterday";
  return `${diffDays} days ago`;
}

const METHOD_ICON: Record<string, JSX.Element> = {
  email: (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
      <polyline points="22,6 12,13 2,6"/>
    </svg>
  ),
  whatsapp: (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  ),
  download: (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
      <polyline points="7 10 12 15 17 10"/>
      <line x1="12" y1="15" x2="12" y2="3"/>
    </svg>
  ),
};

const METHOD_COLOR: Record<string, string> = {
  email:     "text-blue-500 bg-blue-50",
  whatsapp:  "text-emerald-500 bg-emerald-50",
  download:  "text-stone-500 bg-stone-100",
};

export function SendHistory({ records }: SendHistoryProps) {
  if (records.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 rounded-xl border-2 border-dashed border-stone-200 bg-stone-50/50 text-center">
        <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center mb-3">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
            <polyline points="22,6 12,13 2,6"/>
          </svg>
        </div>
        <p className="text-sm font-medium text-stone-400">No brochures sent yet</p>
        <p className="text-[11px] text-stone-300 mt-1">Generate and send a brochure to see it here</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {records.map((r) => (
        <div
          key={r.id}
          className="flex items-center gap-3 px-4 py-3 rounded-xl border border-stone-200 bg-white shadow-sm"
        >
          {/* Method icon */}
          <div className={cn("w-7 h-7 rounded-full flex items-center justify-center shrink-0", METHOD_COLOR[r.method] ?? "text-stone-400 bg-stone-100")}>
            {METHOD_ICON[r.method]}
          </div>

          {/* Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[12px] font-semibold text-stone-800 truncate">{r.propertyRef} · {r.propertyTitle}</span>
              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-stone-100 text-stone-500 shrink-0">{LANG_LABELS[r.lang]}</span>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[11px] text-stone-400 truncate">
                {r.clientName || "—"}{r.clientEmail ? ` · ${r.clientEmail}` : ""}
              </span>
            </div>
          </div>

          {/* Time + agent */}
          <div className="text-right shrink-0">
            <div className="text-[11px] text-stone-400 tabular-nums">{getRelativeTime(r.sentAt)}</div>
            <div className="text-[10px] text-stone-300 mt-0.5">{r.agentName}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
