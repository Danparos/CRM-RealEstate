"use client";

import { useState, useEffect } from "react";
import { TermsGate } from "@/components/share/terms-gate";
import { PropertyPresentationView } from "@/components/share/property-presentation-view";

interface PresentationMeta {
  token: string;
  clientName: string;
  agentName: string;
  agentEmail?: string;
  agentPhone?: string;
  propertyRef: string;
  propertyTitle: string;
  acceptedAt: string | null;
  acceptedName: string | null;
  message?: string;
}

export default function SharePage({ params }: { params: { token: string } }) {
  const { token } = params;
  const [meta,     setMeta]    = useState<PresentationMeta | null>(null);
  const [accepted, setAccepted] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    fetch(`/api/presentations/${token}`)
      .then(r => {
        if (r.status === 404) { setNotFound(true); return null; }
        return r.json() as Promise<PresentationMeta>;
      })
      .then(data => {
        if (!data) return;
        setMeta(data);
        setAccepted(!!data.acceptedAt);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#faf8f4] flex items-center justify-center">
        <div className="h-8 w-8 rounded-full border-2 border-[#B8960C] border-t-transparent animate-spin" />
      </div>
    );
  }

  if (notFound || !meta) {
    return (
      <div className="min-h-screen bg-[#faf8f4] flex flex-col items-center justify-center text-center px-4">
        <div className="h-1.5 w-full fixed top-0 left-0 bg-gradient-to-r from-[#B8960C] via-[#e6c84a] to-[#B8960C]" />
        <p className="font-serif text-xl font-semibold text-stone-700 mb-2">Presentation Not Found</p>
        <p className="text-stone-400 text-sm max-w-sm">
          This link may have expired or is invalid. Please contact your agent for a new presentation link.
        </p>
        <p className="mt-6 text-[12px] text-[#B8960C] font-semibold">CRM - Real Estate</p>
      </div>
    );
  }

  if (!accepted) {
    return (
      <TermsGate
        token={token}
        clientName={meta.clientName}
        agentName={meta.agentName}
        agentEmail={meta.agentEmail}
        agentPhone={meta.agentPhone}
        propertyRef={meta.propertyRef}
        message={meta.message}
        onAccepted={() => setAccepted(true)}
      />
    );
  }

  return (
    <PropertyPresentationView
      token={token}
      clientName={meta.clientName}
      acceptedName={meta.acceptedName ?? meta.clientName}
      agentName={meta.agentName}
      agentEmail={meta.agentEmail}
      agentPhone={meta.agentPhone}
    />
  );
}
