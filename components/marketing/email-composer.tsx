"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { T, type BrochureLang } from "@/lib/brochure-translations";
import type { Property } from "@/types";
import type { Client } from "@/types";

interface EmailComposerProps {
  open: boolean;
  property: Property | null;
  client: Client | null;
  lang: BrochureLang;
  agentName: string;
  onClose: () => void;
  onSent: (method: "email") => void;
}

function buildDefaultSubject(property: Property | null, lang: BrochureLang): string {
  if (!property) return "";
  const t = T[lang];
  const title = property.title?.[lang] ?? property.title?.["en"] ?? "Property";
  return `${t.agencyName} · ${title} (${property.reference})`;
}

function buildDefaultBody(property: Property | null, lang: BrochureLang, agentName: string): string {
  if (!property) return "";
  const t     = T[lang];
  const title = property.title?.[lang] ?? property.title?.["en"] ?? "Property";
  const price = "€" + property.askingPrice.toLocaleString("de-DE");

  const intros: Record<BrochureLang, string> = {
    en: `Dear Client,\n\nPlease find attached the brochure for the following property:\n\n📍 ${title} · ${property.area}\n💶 ${price} (${t.forSale})\n🔑 Ref: ${property.reference}\n\nPlease do not hesitate to contact me for further information or to arrange a viewing.\n\nKind regards,\n${agentName}\n${t.agencyName}`,
    de: `Sehr geehrte/r Interessent/in,\n\nanbei finden Sie die Broschüre für folgendes Objekt:\n\n📍 ${title} · ${property.area}\n💶 ${price} (${t.forSale})\n🔑 Ref.: ${property.reference}\n\nFür weitere Informationen oder zur Vereinbarung eines Besichtigungstermins stehe ich Ihnen gerne zur Verfügung.\n\nFreundliche Grüße,\n${agentName}\n${t.agencyName}`,
    fr: `Chère cliente / Cher client,\n\nVeuillez trouver ci-joint la brochure pour le bien suivant :\n\n📍 ${title} · ${property.area}\n💶 ${price} (${t.forSale})\n🔑 Réf. : ${property.reference}\n\nN'hésitez pas à me contacter pour tout renseignement ou pour organiser une visite.\n\nCordialement,\n${agentName}\n${t.agencyName}`,
    gr: `Αγαπητέ/ή πελάτη,\n\nΣας αποστέλλω το ενημερωτικό φυλλάδιο για το παρακάτω ακίνητο:\n\n📍 ${title} · ${property.area}\n💶 ${price} (${t.forSale})\n🔑 Κωδ.: ${property.reference}\n\nΓια περισσότερες πληροφορίες ή για να κανονίσουμε μια επίσκεψη, παρακαλώ επικοινωνήστε μαζί μου.\n\nΦιλικά,\n${agentName}\n${t.agencyName}`,
  };

  return intros[lang];
}

export function EmailComposer({ open, property, client, lang, agentName, onClose, onSent }: EmailComposerProps) {
  const [to,      setTo]      = useState("");
  const [subject, setSubject] = useState("");
  const [body,    setBody]    = useState("");
  const [sent,    setSent]    = useState(false);

  useEffect(() => {
    if (!open) { setSent(false); return; }
    setTo(client?.email ?? "");
    setSubject(buildDefaultSubject(property, lang));
    setBody(buildDefaultBody(property, lang, agentName));
  }, [open, property, client, lang, agentName]);

  if (!open) return null;

  function handleSend() {
    const mailtoUrl = `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoUrl, "_blank");
    setSent(true);
    setTimeout(() => { onSent("email"); onClose(); }, 1200);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(28,20,10,0.45)", backdropFilter: "blur(4px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-lg flex flex-col rounded-2xl bg-white shadow-2xl border border-stone-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 bg-gradient-to-r from-stone-50 to-white">
          <div>
            <h2 className="font-serif text-lg font-semibold text-stone-900 leading-none">Send Brochure by Email</h2>
            <p className="text-[11px] text-stone-400 mt-1">{property?.reference} · {property?.title?.["en"]}</p>
          </div>
          <button type="button" onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-stone-100 text-stone-400 text-lg">×</button>
        </div>

        {/* Form */}
        <div className="px-6 py-4 flex flex-col gap-3">
          <label className="flex flex-col gap-1">
            <span className="text-[10px] uppercase tracking-wider font-semibold text-stone-400">To</span>
            <input
              type="email"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              placeholder="client@email.com"
              className="rounded-lg border border-stone-200 px-3 py-2 text-sm text-stone-800 focus:outline-none focus:ring-1 focus:ring-[#B8960C]/40"
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-[10px] uppercase tracking-wider font-semibold text-stone-400">Subject</span>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="rounded-lg border border-stone-200 px-3 py-2 text-sm text-stone-800 focus:outline-none focus:ring-1 focus:ring-[#B8960C]/40"
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-[10px] uppercase tracking-wider font-semibold text-stone-400">Message</span>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={8}
              className="rounded-lg border border-stone-200 px-3 py-2 text-sm text-stone-800 focus:outline-none focus:ring-1 focus:ring-[#B8960C]/40 resize-none font-mono"
            />
          </label>

          <p className="text-[10px] text-stone-400 italic">Opens your email client with this message pre-filled. Attach the printed PDF manually.</p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-stone-100 bg-stone-50/50">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-[12px] font-semibold text-stone-500 hover:text-stone-700">Cancel</button>
          <button
            type="button"
            onClick={handleSend}
            disabled={!to || sent}
            className={cn(
              "px-5 py-2 rounded-xl text-[13px] font-semibold transition-all",
              sent
                ? "bg-emerald-500 text-white"
                : to
                  ? "bg-[#B8960C] text-white hover:bg-[#9a7a0a]"
                  : "bg-stone-200 text-stone-400 cursor-not-allowed"
            )}
          >
            {sent ? "✓ Opened" : "Open in Email Client"}
          </button>
        </div>
      </div>
    </div>
  );
}
