"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { getAllClients } from "@/lib/db/clients";
import { getPhotosForProperty } from "@/lib/db/photos";
import type { Property, Client } from "@/types";

interface Props {
  open: boolean;
  property: Property;
  onClose: () => void;
}

export function SendPresentationModal({ open, property, onClose }: Props) {
  const [clients,      setClients]      = useState<Client[]>([]);
  const [selectedId,   setSelectedId]   = useState("");
  const [customName,   setCustomName]   = useState("");
  const [customEmail,  setCustomEmail]  = useState("");
  const [message,      setMessage]      = useState("");
  const [useCustom,    setUseCustom]    = useState(false);
  const [loading,      setLoading]      = useState(false);
  const [done,         setDone]         = useState<string | null>(null);
  const [error,        setError]        = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      getAllClients().then(setClients);
      setDone(null);
      setError(null);
      setSelectedId("");
      setCustomName("");
      setCustomEmail("");
      setMessage("");
      setUseCustom(false);
    }
  }, [open]);

  if (!open) return null;

  const selectedClient = clients.find(c => c.id === selectedId);
  const clientName  = useCustom ? customName  : (selectedClient ? `${selectedClient.firstName} ${selectedClient.lastName}` : "");
  const clientEmail = useCustom ? customEmail : (selectedClient?.email ?? "");
  const canSend     = clientName.trim().length > 1 && /\S+@\S+\.\S+/.test(clientEmail);

  async function handleSend() {
    if (!canSend) return;
    setLoading(true);
    setError(null);
    try {
      const title = property.title?.["en"] ?? property.title?.["de"] ?? "Property";

      // Fetch photos client-side (authenticated browser context) before creating presentation
      let photos: string[] = await getPhotosForProperty(property.id);
      // Merge coverImage at the front if not already included
      if (property.coverImage && !photos.includes(property.coverImage)) {
        photos = [property.coverImage, ...photos];
      }

      const res = await fetch("/api/presentations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          propertyId:    property.id,
          propertyRef:   property.reference,
          propertyTitle: title,
          clientId:      useCustom ? undefined : selectedId || undefined,
          clientName:    clientName.trim(),
          clientEmail:   clientEmail.trim(),
          agentName:     "CRM - Real Estate",
          agentEmail:    "info@errikoskohls.com",
          agentPhone:    "+30 22840 00000",
          message:       message.trim() || undefined,
          photos,
        }),
      });

      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        setError(json.error ?? "Failed to create presentation. Please try again.");
        return;
      }

      const row = await res.json();
      const link = `${window.location.origin}/p/${row.token}`;

      // Open Gmail compose
      const location = [property.area, property.island].filter(Boolean).join(", ");
      const subject  = `Property Presentation — ${property.reference} · ${title}`;
      const body     = `Dear ${clientName},\n\nI have prepared an exclusive property presentation for you.\n\nProperty: ${title}\nReference: ${property.reference}${location ? `\nLocation: ${location}` : ""}\n\nPlease click the link below to view the property details. You will be asked to accept our terms of engagement before accessing the presentation.\n\n${link}\n\n${message ? `Note: ${message}\n\n` : ""}Best regards,\nCRM - Real Estate\n+30 22840 00000`;
      const gmailUrl = `https://mail.google.com/mail/?view=cm&to=${encodeURIComponent(clientEmail)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      window.open(gmailUrl, "_blank");

      setDone(link);
    } catch {
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(28,20,10,0.5)", backdropFilter: "blur(4px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 bg-gradient-to-r from-stone-50 to-white">
          <div>
            <h2 className="font-serif text-lg font-semibold text-stone-900">Send Property Presentation</h2>
            <p className="text-[11px] text-stone-400 mt-0.5">{property.reference} · {property.title?.["en"] ?? "Property"}</p>
          </div>
          <button type="button" onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-stone-100 text-stone-400 text-xl">×</button>
        </div>

        <div className="px-6 py-5 space-y-4">
          {done ? (
            /* Success state */
            <div className="py-6 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mx-auto">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
              <div>
                <p className="font-semibold text-stone-800 text-sm">Presentation created & email opened</p>
                <p className="text-[11px] text-stone-400 mt-1">The client link has been generated</p>
              </div>
              <div className="bg-stone-50 rounded-xl border border-stone-200 px-4 py-3 text-left">
                <p className="text-[10px] uppercase tracking-wider text-stone-400 font-semibold mb-1">Client Link</p>
                <p className="text-[11px] font-mono text-stone-700 break-all">{done}</p>
              </div>
              <button
                type="button"
                onClick={() => { navigator.clipboard.writeText(done); }}
                className="text-[12px] font-semibold text-[#B8960C] hover:underline"
              >
                Copy link to clipboard
              </button>
            </div>
          ) : (
            <>
              {/* Client selector */}
              <div className="flex items-center gap-3 mb-1">
                <button
                  type="button"
                  onClick={() => setUseCustom(false)}
                  className={cn("text-[12px] font-semibold px-3 py-1.5 rounded-lg transition-colors", !useCustom ? "bg-stone-900 text-white" : "text-stone-500 hover:bg-stone-100")}
                >
                  Select Client
                </button>
                <button
                  type="button"
                  onClick={() => setUseCustom(true)}
                  className={cn("text-[12px] font-semibold px-3 py-1.5 rounded-lg transition-colors", useCustom ? "bg-stone-900 text-white" : "text-stone-500 hover:bg-stone-100")}
                >
                  Enter Manually
                </button>
              </div>

              {!useCustom ? (
                <select
                  value={selectedId}
                  onChange={(e) => setSelectedId(e.target.value)}
                  className="w-full rounded-xl border border-stone-200 px-3 py-2.5 text-sm text-stone-800 focus:outline-none focus:ring-1 focus:ring-[#B8960C]/40"
                >
                  <option value="">— Select a client —</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.firstName} {c.lastName}{c.email ? ` · ${c.email}` : " · (no email)"}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Full name"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    className="w-full rounded-xl border border-stone-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#B8960C]/40"
                  />
                  <input
                    type="email"
                    placeholder="Email address"
                    value={customEmail}
                    onChange={(e) => setCustomEmail(e.target.value)}
                    className="w-full rounded-xl border border-stone-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#B8960C]/40"
                  />
                </div>
              )}

              {/* Personal message */}
              <label className="flex flex-col gap-1.5">
                <span className="text-[10px] uppercase tracking-wider font-semibold text-stone-400">Personal Message <span className="font-normal normal-case text-stone-300">(optional)</span></span>
                <textarea
                  rows={3}
                  placeholder="Add a personal note to accompany the presentation…"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full rounded-xl border border-stone-200 px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-[#B8960C]/40"
                />
              </label>

              {error && (
                <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-[12px] text-red-600">{error}</div>
              )}

              <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                <p className="text-[11px] text-amber-700 leading-relaxed">
                  <strong>How it works:</strong> A unique link is generated and emailed to the client. They must accept the agency terms before the property details are revealed. Acceptance is recorded with timestamp and IP address.
                </p>
              </div>
            </>
          )}
        </div>

        {!done && (
          <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-stone-100 bg-stone-50/50">
            <button type="button" onClick={onClose} className="px-4 py-2 text-[12px] font-semibold text-stone-500 hover:text-stone-700">Cancel</button>
            <button
              type="button"
              onClick={handleSend}
              disabled={!canSend || loading}
              className={cn(
                "px-5 py-2.5 rounded-xl text-[13px] font-semibold transition-all",
                canSend && !loading ? "bg-[#B8960C] text-white hover:bg-[#9a7a0a]" : "bg-stone-200 text-stone-400 cursor-not-allowed"
              )}
            >
              {loading ? "Creating…" : "Generate Link & Send Email"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
