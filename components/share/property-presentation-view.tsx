"use client";

import { useState, useEffect } from "react";
import type { Property } from "@/types";

interface Props {
  token: string;
  clientName: string;
  acceptedName: string;
  agentName: string;
  agentEmail?: string;
  agentPhone?: string;
}

function formatPrice(n?: number): string {
  if (!n) return "Price on request";
  return "€" + n.toLocaleString("de-DE");
}

function StatCard({ label, value }: { label: string; value: string | number | undefined }) {
  if (value === undefined || value === null || value === "") return null;
  return (
    <div className="bg-white rounded-xl border border-stone-200 px-4 py-4 text-center shadow-sm">
      <p className="text-xl font-bold text-stone-800">{value}</p>
      <p className="text-[10px] uppercase tracking-wider text-stone-400 mt-1">{label}</p>
    </div>
  );
}

export function PropertyPresentationView({ token, clientName, acceptedName, agentName, agentEmail, agentPhone }: Props) {
  const [property,     setProperty]     = useState<Property | null>(null);
  const [photos,       setPhotos]       = useState<string[]>([]);
  const [activePhoto,  setActivePhoto]  = useState(0);
  const [lightbox,     setLightbox]     = useState<number | null>(null);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState(false);

  useEffect(() => {
    fetch(`/api/presentations/${token}/property`)
      .then(r => r.json())
      .then((data: { property?: Property; photos?: string[]; error?: string }) => {
        if (data.property) {
          setProperty(data.property);
          setPhotos(data.photos ?? []);
        } else {
          setError(true);
        }
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#faf8f4] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 rounded-full border-2 border-[#B8960C] border-t-transparent animate-spin" />
          <p className="text-sm text-stone-400">Loading property details…</p>
        </div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="min-h-screen bg-[#faf8f4] flex items-center justify-center">
        <p className="text-stone-500">Property details could not be loaded. Please contact your agent.</p>
      </div>
    );
  }

  const title    = property.title?.["en"] ?? property.title?.["de"] ?? "Property";
  const location = [property.area, property.island].filter(Boolean).join(", ");

  const features: string[] = [];
  if (property.seafront) features.push("Seafront");
  if (property.seaView)  features.push("Sea View");
  if (property.pool)     features.push("Swimming Pool");
  if (property.features) features.push(...property.features);

  const mapsUrl = property.lat && property.lng
    ? `https://www.google.com/maps?q=${property.lat},${property.lng}`
    : null;

  const conditionLabel: Record<string, string> = {
    planned: "Planned", in_good_condition: "Good Condition",
    needs_renovation: "Needs Renovation", under_construction: "Under Construction",
  };

  return (
    <div className="min-h-screen bg-[#faf8f4]">
      {/* Gold top bar */}
      <div className="h-1.5 bg-gradient-to-r from-[#B8960C] via-[#e6c84a] to-[#B8960C]" />

      {/* Header */}
      <div className="border-b border-stone-200 bg-white px-6 py-5 flex items-center justify-between">
        <div>
          <p className="font-serif text-[18px] font-semibold text-[#B8960C] tracking-wide">CRM - Real Estate</p>
          <p className="text-[11px] text-stone-400 uppercase tracking-[0.15em] mt-0.5">Premium Real Estate · Paros, Greece</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-stone-400 uppercase tracking-wider">Presented to</p>
          <p className="text-sm font-semibold text-stone-700">{clientName}</p>
          <p className="text-[10px] text-emerald-600 mt-0.5">✓ Terms accepted by {acceptedName}</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-10 space-y-6">

        {/* ── Photo Gallery ── */}
        {photos.length > 0 && (
          <div className="space-y-2">
            {/* Main photo */}
            <div
              className="relative w-full h-80 rounded-2xl overflow-hidden shadow-md cursor-zoom-in"
              onClick={() => setLightbox(activePhoto)}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photos[activePhoto]} alt={title} className="w-full h-full object-cover" />
              <div className="absolute bottom-3 right-3 bg-black/50 text-white text-[11px] px-2 py-1 rounded-full">
                {activePhoto + 1} / {photos.length}
              </div>
            </div>

            {/* Thumbnails */}
            {photos.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {photos.map((url, i) => (
                  <button
                    key={i}
                    onClick={() => setActivePhoto(i)}
                    className={`shrink-0 w-20 h-14 rounded-lg overflow-hidden border-2 transition-all ${i === activePhoto ? "border-[#B8960C]" : "border-transparent opacity-60 hover:opacity-90"}`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Placeholder if no photos */}
        {photos.length === 0 && (
          <div className="w-full h-64 rounded-2xl bg-gradient-to-br from-stone-100 to-stone-200 flex items-center justify-center">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#B8960C" strokeWidth="1">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
          </div>
        )}

        {/* ── Title + Price ── */}
        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm px-8 py-6">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-stone-400 font-semibold mb-1">{property.reference}</p>
              <h1 className="font-serif text-2xl font-bold text-stone-900 leading-tight">{title}</h1>
              {location && (
                <div className="mt-2">
                  <p className="text-[10px] uppercase tracking-wider text-stone-400 font-semibold mb-0.5">Location</p>
                  {mapsUrl
                    ? <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="text-stone-600 hover:text-[#B8960C] hover:underline flex items-center gap-1 text-sm">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                        {location}
                      </a>
                    : <p className="text-stone-600 text-sm">{location}</p>
                  }
                  {property.address && <p className="text-stone-400 text-xs mt-0.5">{property.address}</p>}
                </div>
              )}
            </div>
            <div className="text-right shrink-0">
              <p className="text-[10px] uppercase tracking-wider text-stone-400">Asking Price</p>
              <p className="font-serif text-3xl font-bold text-[#B8960C]">{formatPrice(property.askingPrice)}</p>
              {property.buyerCommission && (
                <p className="text-[11px] text-stone-400 mt-1">Buyer&apos;s commission: {property.buyerCommission}%</p>
              )}
            </div>
          </div>
        </div>

        {/* ── Key Stats ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard label="Bedrooms"   value={property.bedrooms} />
          <StatCard label="Bathrooms"  value={property.bathrooms} />
          <StatCard label="Build Area" value={property.buildArea ? `${property.buildArea} m²` : undefined} />
          <StatCard label="Plot Area"  value={property.plotArea  ? `${property.plotArea} m²`  : undefined} />
          <StatCard label="Floors"     value={property.floors} />
          <StatCard label="Rooms"      value={property.rooms} />
          <StatCard label="Balconies"  value={property.balconies} />
          <StatCard label="Terraces"   value={property.terraces} />
          {property.yearOfConstruction && <StatCard label="Year Built" value={property.yearOfConstruction} />}
          {property.condition && <StatCard label="Condition" value={conditionLabel[property.condition] ?? property.condition} />}
          {property.energyClass && <StatCard label="Energy Class" value={property.energyClass} />}
          {property.distanceFromSea !== undefined && property.distanceFromSea > 0 && (
            <StatCard label="Distance from Sea" value={`${property.distanceFromSea} m`} />
          )}
        </div>

        {/* ── Description ── */}
        {property.description && (
          <div className="bg-white rounded-2xl border border-stone-200 shadow-sm px-8 py-6">
            <p className="text-[10px] uppercase tracking-wider font-semibold text-stone-400 mb-3">Description</p>
            <p className="text-sm text-stone-700 leading-relaxed whitespace-pre-wrap">
              {typeof property.description === "string"
                ? property.description
                : (property.description as Record<string, string>)["en"] ?? ""}
            </p>
          </div>
        )}

        {/* ── Features ── */}
        {features.length > 0 && (
          <div className="bg-white rounded-2xl border border-stone-200 shadow-sm px-8 py-6">
            <p className="text-[10px] uppercase tracking-wider font-semibold text-stone-400 mb-3">Features & Highlights</p>
            <div className="flex flex-wrap gap-2">
              {features.map((f, i) => (
                <span key={i} className="px-3 py-1.5 rounded-full border border-stone-200 bg-stone-50 text-[12px] text-stone-700 font-medium flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#B8960C]" />
                  {f}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* ── Heating ── */}
        {property.heatingTypes && property.heatingTypes.length > 0 && (
          <div className="bg-white rounded-2xl border border-stone-200 shadow-sm px-8 py-6">
            <p className="text-[10px] uppercase tracking-wider font-semibold text-stone-400 mb-3">Heating</p>
            <div className="flex flex-wrap gap-2">
              {property.heatingTypes.map((h, i) => (
                <span key={i} className="px-3 py-1.5 rounded-full border border-stone-200 bg-stone-50 text-[12px] text-stone-700 font-medium">{h}</span>
              ))}
            </div>
          </div>
        )}

        {/* ── Legal Checklist ── */}
        {property.legalChecklist && property.legalChecklist.length > 0 && (
          <div className="bg-white rounded-2xl border border-stone-200 shadow-sm px-8 py-6">
            <p className="text-[10px] uppercase tracking-wider font-semibold text-stone-400 mb-4">Legal Checklist</p>
            <div className="space-y-2.5">
              {property.legalChecklist.map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className={`h-5 w-5 rounded flex items-center justify-center shrink-0 ${item.checked ? "bg-emerald-100 border border-emerald-300" : "bg-stone-100 border border-stone-200"}`}>
                    {item.checked && (
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                    )}
                  </div>
                  <span className={`text-sm ${item.checked ? "text-stone-700" : "text-stone-400"}`}>{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Agent Contact ── */}
        <div className="bg-[#B8960C]/5 rounded-2xl border border-[#B8960C]/20 px-8 py-6">
          <p className="text-[10px] uppercase tracking-wider font-semibold text-[#B8960C] mb-3">Your Agent</p>
          <p className="font-semibold text-stone-800">{agentName}</p>
          <p className="text-[12px] text-stone-500 mt-0.5">CRM - Real Estate</p>
          <div className="flex gap-4 mt-3 flex-wrap">
            {agentPhone && (
              <a href={`tel:${agentPhone}`} className="flex items-center gap-2 text-[13px] font-semibold text-[#B8960C] hover:underline">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.63A2 2 0 012 1h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.09 8.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/></svg>
                {agentPhone}
              </a>
            )}
            {agentEmail && (
              <a href={`mailto:${agentEmail}`} className="flex items-center gap-2 text-[13px] font-semibold text-[#B8960C] hover:underline">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                {agentEmail}
              </a>
            )}
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-[11px] text-stone-400 pb-6">
          This presentation is confidential and provided exclusively to {clientName} · CRM - Real Estate
        </p>
      </div>

      {/* ── Lightbox ── */}
      {lightbox !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
          onClick={() => setLightbox(null)}
        >
          <button
            onClick={(e) => { e.stopPropagation(); setLightbox(l => l !== null && l > 0 ? l - 1 : photos.length - 1); }}
            className="absolute left-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={photos[lightbox]}
            alt=""
            className="max-h-[90vh] max-w-[90vw] object-contain rounded-lg"
            onClick={e => e.stopPropagation()}
          />
          <button
            onClick={(e) => { e.stopPropagation(); setLightbox(l => l !== null && l < photos.length - 1 ? l + 1 : 0); }}
            className="absolute right-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
          <button
            onClick={() => setLightbox(null)}
            className="absolute top-4 right-4 h-8 w-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white text-lg"
          >×</button>
          <div className="absolute bottom-4 text-white/50 text-sm">{lightbox + 1} / {photos.length}</div>
        </div>
      )}
    </div>
  );
}
