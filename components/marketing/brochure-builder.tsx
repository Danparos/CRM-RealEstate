"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { LANG_LABELS, type BrochureLang } from "@/lib/brochure-translations";
import type { Property } from "@/types";
import type { Client } from "@/types";

interface BrochureBuilderProps {
  properties: Property[];
  clients: Client[];
  selectedPropertyId: string | null;
  selectedLang: BrochureLang;
  selectedClientId: string | null;
  onPropertyChange: (id: string) => void;
  onLangChange: (lang: BrochureLang) => void;
  onClientChange: (id: string | null) => void;
  onPrint: () => void;
  onSendEmail: () => void;
  onSendWhatsApp: () => void;
}

const LANGS: BrochureLang[] = ["en", "de", "fr", "gr"];

export function BrochureBuilder({
  properties, clients,
  selectedPropertyId, selectedLang, selectedClientId,
  onPropertyChange, onLangChange, onClientChange,
  onPrint, onSendEmail, onSendWhatsApp,
}: BrochureBuilderProps) {
  return (
    <div className="flex flex-col gap-5 w-full">
      {/* Property selector */}
      <div className="flex flex-col gap-1.5">
        <label className="text-[10px] uppercase tracking-wider font-semibold text-stone-400">Property</label>
        <select
          value={selectedPropertyId ?? ""}
          onChange={(e) => onPropertyChange(e.target.value)}
          className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm text-stone-800 focus:outline-none focus:ring-1 focus:ring-[#B8960C]/40 shadow-sm"
        >
          <option value="">— Select a property —</option>
          {properties.map((p) => (
            <option key={p.id} value={p.id}>
              {p.reference} · {p.title?.["en"] ?? p.title?.["de"] ?? "Untitled"} · {p.area}
            </option>
          ))}
        </select>
      </div>

      {/* Language selector */}
      <div className="flex flex-col gap-1.5">
        <label className="text-[10px] uppercase tracking-wider font-semibold text-stone-400">Brochure Language</label>
        <div className="grid grid-cols-4 gap-2">
          {LANGS.map((lang) => (
            <button
              key={lang}
              type="button"
              onClick={() => onLangChange(lang)}
              className={cn(
                "py-2 rounded-xl border text-[12px] font-semibold transition-all",
                selectedLang === lang
                  ? "bg-[#B8960C] border-[#B8960C] text-white shadow-sm"
                  : "border-stone-200 text-stone-500 hover:border-[#B8960C]/40 hover:text-[#B8960C]"
              )}
            >
              {LANG_LABELS[lang]}
            </button>
          ))}
        </div>
      </div>

      {/* Client selector (optional) */}
      <div className="flex flex-col gap-1.5">
        <label className="text-[10px] uppercase tracking-wider font-semibold text-stone-400">Send To Client <span className="normal-case font-normal text-stone-300">(optional)</span></label>
        <select
          value={selectedClientId ?? ""}
          onChange={(e) => onClientChange(e.target.value || null)}
          className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm text-stone-800 focus:outline-none focus:ring-1 focus:ring-[#B8960C]/40 shadow-sm"
        >
          <option value="">— No client selected —</option>
          {clients.map((c) => (
            <option key={c.id} value={c.id}>
              {c.firstName} {c.lastName}{c.email ? ` · ${c.email}` : ""}
            </option>
          ))}
        </select>
      </div>

      {/* Divider */}
      <div className="border-t border-stone-100" />

      {/* Action buttons */}
      <div className="flex flex-col gap-2">
        <button
          type="button"
          onClick={onPrint}
          disabled={!selectedPropertyId}
          className={cn(
            "w-full flex items-center justify-center gap-2 py-3 rounded-xl",
            "text-[13px] font-semibold transition-all",
            selectedPropertyId
              ? "bg-stone-900 text-white hover:bg-stone-700"
              : "bg-stone-100 text-stone-300 cursor-not-allowed"
          )}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/>
            <rect x="6" y="14" width="12" height="8"/>
          </svg>
          Print / Download PDF
        </button>

        <button
          type="button"
          onClick={onSendEmail}
          disabled={!selectedPropertyId}
          className={cn(
            "w-full flex items-center justify-center gap-2 py-3 rounded-xl border",
            "text-[13px] font-semibold transition-all",
            selectedPropertyId
              ? "border-[#B8960C] text-[#B8960C] hover:bg-[#B8960C]/5"
              : "border-stone-200 text-stone-300 cursor-not-allowed"
          )}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
          </svg>
          Send by Email
        </button>

        <button
          type="button"
          onClick={onSendWhatsApp}
          disabled={!selectedPropertyId}
          className={cn(
            "w-full flex items-center justify-center gap-2 py-3 rounded-xl border",
            "text-[13px] font-semibold transition-all",
            selectedPropertyId
              ? "border-emerald-400 text-emerald-600 hover:bg-emerald-50"
              : "border-stone-200 text-stone-300 cursor-not-allowed"
          )}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          Send via WhatsApp
        </button>
      </div>
    </div>
  );
}
