"use client";

import { useState, useMemo } from "react";
import { X, Copy, Check, ExternalLink, MessageCircle, Mail, MessageSquare, ChevronLeft, ChevronRight } from "lucide-react";
import { mockProperties } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/utils";
import type { Client, Property } from "@/types";

interface Props {
  client: Client;
  onClose: () => void;
}

type Channel = "whatsapp" | "email" | "sms";

const CHANNEL_TABS: { id: Channel; label: string; icon: React.ReactNode }[] = [
  { id: "whatsapp", label: "WhatsApp", icon: <MessageCircle className="h-4 w-4" /> },
  { id: "email",    label: "Email",    icon: <Mail className="h-4 w-4" /> },
  { id: "sms",      label: "SMS",      icon: <MessageSquare className="h-4 w-4" /> },
];

function buildFeatures(p: Property): string {
  const f: string[] = [];
  if (p.seafront)   f.push("Seafront");
  else if (p.seaView) f.push("Sea View");
  if (p.pool)       f.push("Pool");
  return f.join(" · ") || "—";
}

function buildWhatsApp(client: Client, p: Property): string {
  const features = buildFeatures(p);
  return `Hi ${client.firstName} 👋

I thought of you when I saw this property — it matches your search perfectly.

🏡 *${p.title.en}*
📍 ${p.area}, Paros
💶 ${formatCurrency(p.askingPrice)}
🛏 ${p.bedrooms} bed${p.bedrooms !== 1 ? "s" : ""} · 🚿 ${p.bathrooms} bath${p.bathrooms !== 1 ? "s" : ""} · ${p.buildArea}m²${p.plotArea ? ` · Plot ${p.plotArea}m²` : ""}${features !== "—" ? `\n✨ ${features}` : ""}

Reference: _${p.reference}_

Would you like to arrange a private viewing? I'm available this week.

Best regards,
${client.primaryAgent ?? "Errikos Kohls"}
Errikos Kohls Immobilien Consulting`;
}

function buildEmail(client: Client, p: Property): string {
  const features = buildFeatures(p);
  return `Subject: Property Suggestion — ${p.title.en}, ${p.area}

Dear ${client.firstName},

I hope this message finds you well. I am pleased to present a property that I believe aligns perfectly with your requirements in Paros.

— ${p.title.en} —
${p.area}, Paros, Greece

Asking Price:  ${formatCurrency(p.askingPrice)}
Bedrooms:      ${p.bedrooms}  |  Bathrooms: ${p.bathrooms}
Build Area:    ${p.buildArea}m²${p.plotArea ? `  |  Plot: ${p.plotArea}m²` : ""}
Features:      ${features}
Reference:     ${p.reference}

I would be delighted to arrange a private viewing at your convenience. Please feel free to contact me directly or reply to this email.

Kind regards,

${client.primaryAgent ?? "Errikos Kohls"}
Errikos Kohls Immobilien Consulting
Paros, Greece`;
}

function buildSMS(client: Client, p: Property): string {
  const beds = `${p.bedrooms}bd`;
  const price = formatCurrency(p.askingPrice);
  const agent = (client.primaryAgent ?? "Errikos Kohls").split(" ")[0];
  return `Hi ${client.firstName}, ${agent} here from Errikos Kohls. I found a property matching your search: ${p.title.en}, ${p.area} — ${price}, ${beds}${p.pool ? ", pool" : ""}${p.seaView ? ", sea view" : ""}. Ref: ${p.reference}. Interested in a viewing?`;
}

function WhatsAppPreview({ text }: { text: string }) {
  const lines = text.split("\n");
  return (
    <div className="bg-[#e5ddd5] rounded-xl overflow-hidden">
      {/* WhatsApp header */}
      <div className="bg-[#128C7E] px-4 py-3 flex items-center gap-3">
        <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center text-white text-xs font-bold">EK</div>
        <div>
          <p className="text-white text-sm font-semibold leading-none">Errikos Kohls</p>
          <p className="text-white/70 text-[10px] mt-0.5">online</p>
        </div>
      </div>
      {/* Chat area */}
      <div className="p-4 min-h-[180px] flex items-end justify-end">
        <div className="bg-[#dcf8c6] rounded-lg rounded-tr-none px-3 py-2 max-w-[85%] shadow-sm relative">
          <div className="absolute -top-0 -right-2 w-0 h-0 border-l-8 border-b-8 border-l-[#dcf8c6] border-b-transparent" />
          <div className="text-[12.5px] text-stone-800 whitespace-pre-wrap leading-relaxed">
            {lines.map((line, i) => {
              const bold = line.replace(/\*(.*?)\*/g, "");
              const hasBold = /\*(.*?)\*/.test(line);
              const italic = line.replace(/_(.*?)_/g, "");
              const hasItalic = /_(.*?)_/.test(line);
              return (
                <span key={i}>
                  {hasBold ? (
                    <>{line.split(/\*(.*?)\*/).map((part, j) => j % 2 === 1 ? <strong key={j}>{part}</strong> : part)}</>
                  ) : hasItalic ? (
                    <>{line.split(/_(.*?)_/).map((part, j) => j % 2 === 1 ? <em key={j}>{part}</em> : part)}</>
                  ) : line}
                  {i < lines.length - 1 && "\n"}
                </span>
              );
            })}
          </div>
          <p className="text-[10px] text-stone-400 text-right mt-1 leading-none">
            {new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })} ✓✓
          </p>
        </div>
      </div>
    </div>
  );
}

function EmailPreview({ text }: { text: string }) {
  const lines = text.split("\n");
  const subjectLine = lines[0]?.replace("Subject: ", "") ?? "";
  const body = lines.slice(2).join("\n");
  return (
    <div className="bg-white rounded-xl border border-stone-200 overflow-hidden text-sm">
      <div className="bg-stone-50 border-b border-stone-200 px-4 py-3 space-y-1.5">
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-stone-400 uppercase tracking-wider w-12">From</span>
          <span className="text-stone-700 text-xs">{(text.match(/Kind regards,\n\n(.*)/)?.[1] ?? "Errikos Kohls")} &lt;info@errikos-kohls.com&gt;</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-stone-400 uppercase tracking-wider w-12">To</span>
          <span className="text-stone-700 text-xs">{text.split("Dear ")[1]?.split(",")[0] ?? "Client"}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-stone-400 uppercase tracking-wider w-12">Subject</span>
          <span className="text-stone-900 text-xs font-semibold">{subjectLine}</span>
        </div>
      </div>
      <div className="px-4 py-4 text-[12.5px] text-stone-700 whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
        {body}
      </div>
    </div>
  );
}

function SMSPreview({ text }: { text: string }) {
  return (
    <div className="bg-stone-100 rounded-xl overflow-hidden">
      <div className="bg-stone-800 px-4 py-3 flex items-center justify-center">
        <p className="text-white text-sm font-semibold">Messages</p>
      </div>
      <div className="p-4 min-h-[100px] flex items-end">
        <div className="bg-[#3B82F6] rounded-2xl rounded-bl-sm px-4 py-2.5 max-w-[85%] shadow-sm">
          <p className="text-white text-[12.5px] leading-relaxed whitespace-pre-wrap">{text}</p>
          <p className="text-blue-200 text-[10px] mt-1">Delivered</p>
        </div>
      </div>
    </div>
  );
}

const AVAILABLE = mockProperties.filter(p => p.status === "available");

export function SendPropertyModal({ client, onClose }: Props) {
  const [propIdx,  setPropIdx]  = useState(0);
  const [channel,  setChannel]  = useState<Channel>("whatsapp");
  const [copied,   setCopied]   = useState(false);
  const [editMode, setEditMode] = useState(false);

  const property = AVAILABLE[propIdx];

  const defaultText = useMemo(() => {
    if (!property) return "";
    if (channel === "whatsapp") return buildWhatsApp(client, property);
    if (channel === "email")    return buildEmail(client, property);
    return buildSMS(client, property);
  }, [channel, property, client]);

  const [edited, setEdited] = useState<Partial<Record<string, string>>>({});
  const key = `${channel}-${property?.id}`;
  const text = edited[key] ?? defaultText;

  const handleEdit = (v: string) => setEdited(p => ({ ...p, [key]: v }));
  const handleReset = () => setEdited(p => { const n = { ...p }; delete n[key]; return n; });

  const copy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const openAction = () => {
    if (channel === "whatsapp") {
      const phone = client.phone?.replace(/\D/g, "") ?? "";
      window.open(`https://wa.me/${phone}?text=${encodeURIComponent(text)}`, "_blank");
    } else if (channel === "email") {
      const subject = text.split("\n")[0].replace("Subject: ", "");
      const body = text.split("\n").slice(2).join("\n");
      const params = new URLSearchParams({
        to: client.email ?? "",
        subject,
        body,
      });
      window.open(`https://outlook.office.com/mail/deeplink/compose?${params.toString()}`, "_blank");
    } else {
      const phone = client.phone?.replace(/\D/g, "") ?? "";
      window.open(`sms:${phone}?body=${encodeURIComponent(text)}`, "_blank");
    }
  };

  if (!property) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-2xl max-h-[92vh] bg-[#faf8f5] rounded-2xl shadow-2xl overflow-hidden flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 bg-white shrink-0">
          <div>
            <h2 className="font-serif text-lg font-semibold text-stone-900">Send Property Info</h2>
            <p className="text-xs text-stone-400 mt-0.5">to {client.firstName} {client.lastName}</p>
          </div>
          <button onClick={onClose}
            className="h-8 w-8 flex items-center justify-center rounded-lg text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-5 space-y-5">

          {/* Property selector */}
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-stone-400 mb-2">Select Property</p>
            <div className="flex items-center gap-2">
              <button onClick={() => setPropIdx(i => Math.max(0, i - 1))} disabled={propIdx === 0}
                className="h-8 w-8 flex items-center justify-center rounded-lg border border-stone-200 text-stone-500 hover:border-stone-300 disabled:opacity-30 transition-colors bg-white">
                <ChevronLeft className="h-4 w-4" />
              </button>

              <div className="flex-1 bg-white rounded-xl border border-stone-200 px-4 py-3 flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-mono text-stone-400">{property.reference}</span>
                    <span className="text-sm font-semibold text-stone-900 truncate">{property.title.en}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className="text-xs text-stone-500">{property.area}</span>
                    <span className="text-stone-200">·</span>
                    <span className="text-xs text-stone-500">{property.bedrooms} bed{property.bedrooms !== 1 ? "s" : ""}</span>
                    {property.pool && <><span className="text-stone-200">·</span><span className="text-xs text-stone-500">Pool</span></>}
                    {property.seaView && <><span className="text-stone-200">·</span><span className="text-xs text-stone-500">Sea view</span></>}
                    {property.seafront && <><span className="text-stone-200">·</span><span className="text-xs text-blue-500 font-medium">Seafront</span></>}
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-sm font-bold text-[#B8960C]">{formatCurrency(property.askingPrice)}</p>
                  <p className="text-[10px] text-stone-400 mt-0.5">{propIdx + 1} of {AVAILABLE.length}</p>
                </div>
              </div>

              <button onClick={() => setPropIdx(i => Math.min(AVAILABLE.length - 1, i + 1))} disabled={propIdx === AVAILABLE.length - 1}
                className="h-8 w-8 flex items-center justify-center rounded-lg border border-stone-200 text-stone-500 hover:border-stone-300 disabled:opacity-30 transition-colors bg-white">
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            {/* Property dots */}
            <div className="flex justify-center gap-1.5 mt-2">
              {AVAILABLE.map((_, i) => (
                <button key={i} onClick={() => setPropIdx(i)}
                  className={`h-1.5 rounded-full transition-all ${i === propIdx ? "w-4 bg-[#B8960C]" : "w-1.5 bg-stone-300 hover:bg-stone-400"}`} />
              ))}
            </div>
          </div>

          {/* Channel tabs */}
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-stone-400 mb-2">Channel</p>
            <div className="flex gap-2">
              {CHANNEL_TABS.map(tab => (
                <button key={tab.id} onClick={() => setChannel(tab.id)}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
                    channel === tab.id
                      ? tab.id === "whatsapp" ? "bg-[#128C7E] border-[#128C7E] text-white"
                        : tab.id === "email"  ? "bg-[#B8960C] border-[#B8960C] text-white"
                        :                       "bg-stone-700 border-stone-700 text-white"
                      : "bg-white border-stone-200 text-stone-600 hover:border-stone-300"
                  }`}>
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Preview */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-stone-400">Preview</p>
              <button onClick={() => setEditMode(p => !p)}
                className="text-xs text-[#B8960C] hover:text-[#9e7f0a] font-medium transition-colors">
                {editMode ? "Show preview" : "Edit message"}
              </button>
            </div>

            {editMode ? (
              <div className="space-y-2">
                <textarea
                  value={text}
                  onChange={e => handleEdit(e.target.value)}
                  rows={12}
                  className="w-full bg-white text-stone-800 rounded-xl border border-stone-200 py-3 px-4 text-[12.5px] leading-relaxed resize-none outline-none transition-all focus:border-[#B8960C] focus:ring-2 focus:ring-[#B8960C]/20 font-mono"
                />
                {edited[key] && (
                  <button onClick={handleReset} className="text-xs text-stone-400 hover:text-stone-600 transition-colors">
                    Reset to default
                  </button>
                )}
              </div>
            ) : (
              channel === "whatsapp" ? <WhatsAppPreview text={text} />
            : channel === "email"    ? <EmailPreview text={text} />
            :                          <SMSPreview text={text} />
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-stone-200 bg-white shrink-0 flex items-center justify-between gap-3">
          <button onClick={copy}
            className="inline-flex items-center gap-2 px-4 h-9 rounded-lg border border-stone-200 text-sm text-stone-600 hover:border-stone-300 hover:text-stone-800 transition-colors">
            {copied ? <><Check className="h-3.5 w-3.5 text-emerald-500" /> Copied!</> : <><Copy className="h-3.5 w-3.5" /> Copy</>}
          </button>
          <button onClick={openAction}
            className={`inline-flex items-center gap-2 px-5 h-9 rounded-lg text-sm font-medium text-white transition-colors ${
              channel === "whatsapp" ? "bg-[#128C7E] hover:bg-[#0e6b60]"
            : channel === "email"   ? "bg-[#B8960C] hover:bg-[#9e7f0a]"
            :                         "bg-stone-700 hover:bg-stone-800"
            }`}>
            <ExternalLink className="h-3.5 w-3.5" />
            {channel === "whatsapp" ? "Open in WhatsApp"
           : channel === "email"    ? "Open in Outlook"
           :                          "Open in Messages"}
          </button>
        </div>
      </div>
    </div>
  );
}
