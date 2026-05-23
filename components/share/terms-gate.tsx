"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface TermsGateProps {
  token: string;
  clientName: string;
  agentName: string;
  agentEmail?: string;
  agentPhone?: string;
  propertyRef: string;
  message?: string;
  onAccepted: () => void;
}

export function TermsGate({
  token, clientName, agentName, agentEmail, agentPhone, propertyRef, message, onAccepted
}: TermsGateProps) {
  const [name,    setName]    = useState(clientName || "");
  const [agreed,  setAgreed]  = useState(false);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  async function handleAccept() {
    if (!agreed || name.trim().length < 2) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/presentations/${token}/accept`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });
      const data = await res.json() as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        return;
      }
      onAccepted();
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#faf8f4] flex flex-col">
      {/* Gold top bar */}
      <div className="h-1.5 bg-gradient-to-r from-[#B8960C] via-[#e6c84a] to-[#B8960C]" />

      {/* Header */}
      <div className="border-b border-stone-200 bg-white px-6 py-5 flex items-center justify-between">
        <div>
          <p className="font-serif text-[18px] font-semibold text-[#B8960C] tracking-wide">
            CRM - Real Estate
          </p>
          <p className="text-[11px] text-stone-400 uppercase tracking-[0.15em] mt-0.5">
            Premium Real Estate · Paros, Greece
          </p>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-stone-400 uppercase tracking-wider">Property Reference</p>
          <p className="text-sm font-bold text-stone-700 font-mono">{propertyRef}</p>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg">

          {/* Welcome box */}
          <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden mb-5">
            <div className="px-8 pt-8 pb-6 border-b border-stone-100 text-center">
              <div className="w-12 h-12 rounded-full bg-[#B8960C]/10 flex items-center justify-center mx-auto mb-4">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#B8960C" strokeWidth="1.5">
                  <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
                  <polyline points="9 22 9 12 15 12 15 22"/>
                </svg>
              </div>
              <h1 className="font-serif text-2xl font-semibold text-stone-900 mb-2">
                Property Presentation
              </h1>
              <p className="text-stone-500 text-sm leading-relaxed">
                Dear <strong>{clientName}</strong>, a property has been selected for you
                by <strong>{agentName}</strong>. Please review and accept the terms below to access the full presentation.
              </p>
              {message && (
                <div className="mt-4 px-4 py-3 rounded-xl bg-stone-50 border border-stone-200 text-left">
                  <p className="text-[11px] uppercase tracking-wider text-stone-400 font-semibold mb-1">Message from {agentName}</p>
                  <p className="text-sm text-stone-600 italic leading-relaxed">"{message}"</p>
                </div>
              )}
            </div>

            {/* Terms */}
            <div className="px-8 py-6">
              <p className="text-[10px] uppercase tracking-wider font-semibold text-stone-400 mb-3">
                Terms of Engagement
              </p>
              <div className="text-[12px] text-stone-600 leading-relaxed space-y-2.5 max-h-52 overflow-y-auto pr-2">
                <p><strong>1. Exclusive Introduction.</strong> The property information presented herein is provided exclusively to you by CRM - Real Estate ("the Agency"). By accepting, you confirm that you have not been previously introduced to this property by any other agent or party.</p>
                <p><strong>2. Agency Commission.</strong> Should you proceed to purchase this property, the Agency's buyer commission shall apply as stated in the property details. This commission is payable upon successful completion of the transaction.</p>
                <p><strong>3. Confidentiality.</strong> All information contained in this presentation — including price, reference numbers, photos, and location details — is strictly confidential and provided for your personal use only. It may not be shared with third parties without the Agency's written consent.</p>
                <p><strong>4. No Binding Offer.</strong> Viewing this presentation does not constitute a binding offer or obligation to purchase. All transactions remain subject to separate contractual agreement.</p>
                <p><strong>5. Data Protection.</strong> Your personal data is processed in accordance with GDPR and Greek data protection law solely for the purpose of facilitating this property introduction.</p>
              </div>
            </div>
          </div>

          {/* Acceptance form */}
          <div className="bg-white rounded-2xl border border-stone-200 shadow-sm px-8 py-6 space-y-4">
            <label className="flex flex-col gap-1.5">
              <span className="text-[10px] uppercase tracking-wider font-semibold text-stone-400">
                Your Full Name <span className="text-red-400">*</span>
              </span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name to sign"
                className="rounded-xl border border-stone-200 px-4 py-3 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#B8960C]/30 focus:border-[#B8960C]/50"
              />
            </label>

            <label className="flex items-start gap-3 cursor-pointer group">
              <div className="relative mt-0.5 shrink-0">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="sr-only"
                />
                <div className={cn(
                  "w-5 h-5 rounded border-2 flex items-center justify-center transition-colors",
                  agreed ? "bg-[#B8960C] border-[#B8960C]" : "border-stone-300 group-hover:border-[#B8960C]/50"
                )}>
                  {agreed && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5"><polyline points="20 6 9 17 4 12"/></svg>}
                </div>
              </div>
              <span className="text-[12px] text-stone-600 leading-relaxed">
                I have read and agree to the Terms of Engagement above. I confirm this is an exclusive introduction and I understand the agency commission terms.
              </span>
            </label>

            {error && (
              <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-[12px] text-red-600">
                {error}
              </div>
            )}

            <button
              type="button"
              onClick={handleAccept}
              disabled={!agreed || name.trim().length < 2 || loading}
              className={cn(
                "w-full py-3.5 rounded-xl text-[13px] font-semibold transition-all",
                agreed && name.trim().length >= 2 && !loading
                  ? "bg-[#B8960C] text-white hover:bg-[#9a7a0a] shadow-sm"
                  : "bg-stone-100 text-stone-300 cursor-not-allowed"
              )}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  Recording acceptance…
                </span>
              ) : (
                "I Accept — View Property"
              )}
            </button>

            <p className="text-center text-[10px] text-stone-400">
              Your acceptance is recorded with a timestamp and IP address for legal purposes.
            </p>
          </div>

          {/* Agent contact footer */}
          <div className="mt-5 text-center">
            <p className="text-[11px] text-stone-400">Questions? Contact your agent</p>
            <p className="text-[13px] font-semibold text-stone-700 mt-1">{agentName}</p>
            <div className="flex items-center justify-center gap-4 mt-1">
              {agentPhone && <a href={`tel:${agentPhone}`} className="text-[12px] text-[#B8960C] hover:underline">{agentPhone}</a>}
              {agentEmail && <a href={`mailto:${agentEmail}`} className="text-[12px] text-[#B8960C] hover:underline">{agentEmail}</a>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
