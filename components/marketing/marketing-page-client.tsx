"use client";

import { useState, useEffect, useRef } from "react";
import { BrochureBuilder } from "./brochure-builder";
import { BrochureTemplate } from "./brochure-template";
import { EmailComposer } from "./email-composer";
import { SendHistory } from "./send-history";
import { getSendHistory, addSendRecord, type BrochureLang, type BrochureSendRecord } from "@/lib/brochure-translations";
import { getAllProperties } from "@/lib/db/properties";
import { getAllClients } from "@/lib/db/clients";
import { mockProperties } from "@/lib/mock-data";
import type { Property, Client } from "@/types";

export function MarketingPageClient() {
  const [properties,     setProperties]     = useState<Property[]>([]);
  const [clients,        setClients]        = useState<Client[]>([]);
  const [loading,        setLoading]        = useState(true);
  const [selectedPropId, setSelectedPropId] = useState<string | null>(null);
  const [selectedLang,   setSelectedLang]   = useState<BrochureLang>("en");
  const [selectedClient, setSelectedClient] = useState<string | null>(null);
  const [emailOpen,      setEmailOpen]      = useState(false);
  const [history,        setHistory]        = useState<BrochureSendRecord[]>([]);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    Promise.all([getAllProperties(), getAllClients()]).then(([props, cls]) => {
      setProperties(props.length > 0 ? props : mockProperties);
      setClients(cls);
    }).finally(() => setLoading(false));
    setHistory(getSendHistory());
  }, []);

  const selectedProperty = properties.find(p => p.id === selectedPropId) ?? null;
  const selectedClientObj = clients.find(c => c.id === selectedClient) ?? null;

  function handlePrint() {
    if (!selectedProperty) return;
    window.print();
    const record = addSendRecord({
      propertyId:    selectedProperty.id,
      propertyTitle: selectedProperty.title?.["en"] ?? "Property",
      propertyRef:   selectedProperty.reference,
      clientName:    selectedClientObj ? `${selectedClientObj.firstName} ${selectedClientObj.lastName}` : "",
      clientEmail:   selectedClientObj?.email ?? "",
      lang:          selectedLang,
      sentAt:        new Date().toISOString(),
      agentName:     "Agent",
      method:        "download",
    });
    setHistory(prev => [record, ...prev]);
  }

  function handleSendWhatsApp() {
    if (!selectedProperty) return;
    const title = selectedProperty.title?.["en"] ?? "Property";
    const price = "€" + selectedProperty.askingPrice.toLocaleString("de-DE");
    const msg   = `${title} · ${selectedProperty.area} · ${price} · Ref: ${selectedProperty.reference}`;
    const phone = selectedClientObj?.phone?.replace(/\D/g, "") ?? "";
    const url   = phone
      ? `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`
      : `https://wa.me/?text=${encodeURIComponent(msg)}`;
    window.open(url, "_blank");

    const record = addSendRecord({
      propertyId:    selectedProperty.id,
      propertyTitle: title,
      propertyRef:   selectedProperty.reference,
      clientName:    selectedClientObj ? `${selectedClientObj.firstName} ${selectedClientObj.lastName}` : "",
      clientEmail:   selectedClientObj?.email ?? "",
      lang:          selectedLang,
      sentAt:        new Date().toISOString(),
      agentName:     "Agent",
      method:        "whatsapp",
    });
    setHistory(prev => [record, ...prev]);
  }

  function handleEmailSent() {
    if (!selectedProperty) return;
    const record = addSendRecord({
      propertyId:    selectedProperty.id,
      propertyTitle: selectedProperty.title?.["en"] ?? "Property",
      propertyRef:   selectedProperty.reference,
      clientName:    selectedClientObj ? `${selectedClientObj.firstName} ${selectedClientObj.lastName}` : "",
      clientEmail:   selectedClientObj?.email ?? "",
      lang:          selectedLang,
      sentAt:        new Date().toISOString(),
      agentName:     "Agent",
      method:        "email",
    });
    setHistory(prev => [record, ...prev]);
    setEmailOpen(false);
  }

  return (
    <>
      {/* Print styles — hide everything except brochure */}
      <style>{`
        @media print {
          body > * { display: none !important; }
          #brochure-print-root { display: block !important; position: fixed !important; top: 0; left: 0; width: 210mm; }
        }
      `}</style>

      <div className="flex flex-col gap-6 pb-8">
        {/* Page header */}
        <div className="flex items-end justify-between px-1 pb-2 border-b border-stone-100">
          <div>
            <h1 className="font-serif text-[36px] font-semibold leading-none tracking-wide text-stone-900">Marketing</h1>
            <p className="mt-2 text-[13px] uppercase tracking-[0.2em] text-stone-400 font-medium">Brochures &amp; Client Outreach</p>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-stone-400">
            <span className="font-semibold text-stone-600">{history.length}</span> brochures sent
          </div>
        </div>

        {/* Main: builder + preview */}
        <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6 items-start">
          {/* Left: builder */}
          <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
            <p className="text-[11px] uppercase tracking-wider font-semibold text-stone-400 mb-4">Build Brochure</p>
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="h-6 w-6 rounded-full border-2 border-[#B8960C] border-t-transparent animate-spin" />
              </div>
            ) : (
              <BrochureBuilder
                properties={properties}
                clients={clients}
                selectedPropertyId={selectedPropId}
                selectedLang={selectedLang}
                selectedClientId={selectedClient}
                onPropertyChange={setSelectedPropId}
                onLangChange={setSelectedLang}
                onClientChange={setSelectedClient}
                onPrint={handlePrint}
                onSendEmail={() => setEmailOpen(true)}
                onSendWhatsApp={handleSendWhatsApp}
              />
            )}
          </div>

          {/* Right: live preview */}
          <div className="rounded-2xl border border-stone-200 overflow-hidden shadow-sm">
            <div className="px-4 py-2.5 border-b border-stone-100 bg-stone-50 flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-wider font-semibold text-stone-400">Live Preview</span>
              {selectedProperty && (
                <span className="text-[11px] text-stone-500">{selectedProperty.reference} · {selectedProperty.area}</span>
              )}
            </div>
            <div
              ref={printRef}
              className="overflow-auto bg-stone-100 p-4 flex justify-center"
              style={{ minHeight: 400 }}
            >
              {selectedProperty ? (
                <div style={{ transform: "scale(0.72)", transformOrigin: "top center", width: "210mm" }}>
                  <BrochureTemplate
                    property={selectedProperty}
                    lang={selectedLang}
                    agentName="CRM - Real Estate"
                    agentPhone="+30 22840 00000"
                    agentEmail="info@errikoskohls.com"
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                  <div className="w-12 h-12 rounded-full bg-stone-200 flex items-center justify-center mb-3">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5">
                      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
                      <polyline points="9 22 9 12 15 12 15 22"/>
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-stone-400">Select a property to preview the brochure</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Send History */}
        <div>
          <p className="text-[11px] uppercase tracking-wider font-semibold text-stone-400 mb-3">Send History</p>
          <SendHistory records={history} />
        </div>
      </div>

      <EmailComposer
        open={emailOpen}
        property={selectedProperty}
        client={selectedClientObj}
        lang={selectedLang}
        agentName="CRM - Real Estate"
        onClose={() => setEmailOpen(false)}
        onSent={handleEmailSent}
      />
    </>
  );
}
