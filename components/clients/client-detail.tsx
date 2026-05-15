"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MessageSquarePlus, Check } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { ClientClassBadge } from "@/components/crm/client-class-badge";
import { PriceGroupBadge } from "@/components/crm/price-group-badge";
import { PipelineStageBadge } from "@/components/crm/pipeline-stage-badge";
import { ActivityTimeline } from "@/components/clients/activity-timeline";
import { EditClientForm } from "@/components/clients/edit-client-form";
import { getClient, upsertClient } from "@/lib/db/clients";
import { getActivitiesForClient } from "@/lib/db/activities";
import { cn, formatCurrency } from "@/lib/utils";
import type { Client, PipelineStage, Activity } from "@/types";

const ClientDocuments = dynamic(
  () => import("@/components/clients/client-documents").then(m => ({ default: m.ClientDocuments })),
  { ssr: false, loading: () => <div className="h-24 bg-white rounded-xl border border-stone-200 animate-pulse" /> }
);

const PropertyMatches = dynamic(
  () => import("@/components/clients/property-matches").then(m => ({ default: m.PropertyMatches })),
  { ssr: false, loading: () => <div className="h-48 bg-white rounded-xl border border-stone-200 animate-pulse" /> }
);

const SendPropertyModal = dynamic(
  () => import("@/components/clients/send-property-modal").then(m => ({ default: m.SendPropertyModal })),
  { ssr: false }
);

const STAGES: { key: PipelineStage; short: string }[] = [
  { key: "new_inquiry",           short: "Inquiry"     },
  { key: "qualified",             short: "Qualified"   },
  { key: "property_presentation", short: "Showing"     },
  { key: "offer_submitted",       short: "Offer"       },
  { key: "negotiation",           short: "Negotiation" },
  { key: "legal_process",         short: "Legal"       },
  { key: "signed_closed",         short: "Closed"      },
];

const FLAGS: Record<string, string> = {
  DE: "🇩🇪", FR: "🇫🇷", GB: "🇬🇧", GR: "🇬🇷",
  IL: "🇮🇱", US: "🇺🇸", NL: "🇳🇱", CH: "🇨🇭",
};

const LANG_NAMES: Record<string, string> = {
  de: "German", fr: "French", en: "English",
  el: "Greek", he: "Hebrew", nl: "Dutch",
};

const PRICE_LABELS: Record<string, string> = {
  entry: "Entry · up to €300K",
  mid: "Mid · €300K–€750K",
  premium: "Premium · €750K–€1.5M",
  luxury: "Luxury · €1.5M–€5M",
  ultra: "Ultra · €5M+",
};

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-4 py-3 border-b border-stone-100 last:border-0">
      <dt className="w-36 shrink-0 text-[11px] font-semibold text-stone-400 uppercase tracking-wider pt-0.5">{label}</dt>
      <dd className="flex-1 text-sm text-stone-800">{children}</dd>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-stone-100">
        <h2 className="font-serif text-xl font-bold text-stone-900">{title}</h2>
      </div>
      <dl className="px-6 py-2">{children}</dl>
    </div>
  );
}

function AgentNote({ client, onSave }: { client: Client; onSave: (c: Client) => void }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft]     = useState(client.lastActivityNote ?? "");
  const [saved, setSaved]     = useState(false);
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setDraft(client.lastActivityNote ?? "");
  }, [client.lastActivityNote]);

  useEffect(() => {
    if (editing) setTimeout(() => ref.current?.focus(), 50);
  }, [editing]);

  const handleSave = () => {
    const note = draft.trim();
    onSave({ ...client, lastActivityNote: note, lastActivityAt: new Date().toISOString() });
    setEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-stone-100 flex items-center justify-between">
        <p className="text-sm font-bold text-stone-800">Agent Note</p>
        {!editing && (
          <button
            onClick={() => setEditing(true)}
            className="text-[11px] text-[#B8960C] hover:underline font-medium"
          >
            {client.lastActivityNote ? "Edit" : "Add"}
          </button>
        )}
      </div>
      <div className="px-4 py-3">
        {editing ? (
          <div className="flex flex-col gap-2">
            <textarea
              ref={ref}
              value={draft}
              onChange={e => setDraft(e.target.value)}
              onKeyDown={e => { if (e.key === "Escape") setEditing(false); }}
              placeholder="Write a note about this client…"
              rows={4}
              className="w-full resize-none rounded-lg border border-stone-200 px-3 py-2 text-sm text-stone-700 placeholder:text-stone-300 outline-none focus:border-[#B8960C] focus:ring-2 focus:ring-[#B8960C]/20 transition-all"
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setEditing(false)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-stone-400 hover:bg-stone-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!draft.trim()}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#B8960C] text-white hover:bg-[#9e7f0a] disabled:opacity-40 transition-colors"
              >
                Save Note
              </button>
            </div>
          </div>
        ) : client.lastActivityNote ? (
          <div className="space-y-1.5">
            <p className="text-sm text-stone-700 leading-relaxed whitespace-pre-wrap">{client.lastActivityNote}</p>
            {client.lastActivityAt && (
              <p className="text-[11px] text-stone-400">
                {saved ? (
                  <span className="flex items-center gap-1 text-emerald-600">
                    <Check className="h-3 w-3" /> Saved
                  </span>
                ) : (
                  `Updated ${new Date(client.lastActivityAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}`
                )}
              </p>
            )}
          </div>
        ) : (
          <button
            onClick={() => setEditing(true)}
            className="flex items-center gap-2 w-full text-left rounded-lg border-2 border-dashed border-stone-200 px-3 py-4 text-sm text-stone-300 hover:border-[#B8960C]/40 hover:text-[#B8960C]/60 transition-colors"
          >
            <MessageSquarePlus className="h-4 w-4 shrink-0" />
            Write a note about this client…
          </button>
        )}
      </div>
    </div>
  );
}

interface Props { client: Client }

export function ClientDetail({ client: initialClient }: Props) {
  const router = useRouter();
  const [client, setClient] = useState<Client>(initialClient);
  const [showEdit, setShowEdit] = useState(false);
  const [showSend, setShowSend] = useState(false);
  const [showArchiveConfirm, setShowArchiveConfirm] = useState(false);
  const [activities, setActivities] = useState<Activity[]>([]);

  useEffect(() => {
    getClient(initialClient.id).then(override => {
      if (override) setClient(override);
    });
  }, [initialClient.id]);

  useEffect(() => {
    getActivitiesForClient(initialClient.id).then(setActivities);
  }, [initialClient.id]);

  const saveOverride = useCallback((updated: Client) => {
    upsertClient(updated).catch(err => console.error("[ClientDetail] saveOverride:", err));
    setClient(updated);
  }, []);

  const handleArchive = () => {
    const updated = { ...client, archived: true, archivedAt: new Date().toISOString() };
    saveOverride(updated);
    setShowArchiveConfirm(false);
    router.push("/clients");
  };

  const handleReactivate = () => {
    const updated = { ...client, archived: false, archivedAt: undefined };
    saveOverride(updated);
  };

  const fullName    = `${client.firstName} ${client.lastName}`;
  const displayName = client.salutation ? `${client.salutation} ${fullName}` : fullName;
  const currentIdx  = STAGES.findIndex(s => s.key === client.stage);
  const daysInStage = client.stageEnteredAt
    ? Math.floor((Date.now() - new Date(client.stageEnteredAt).getTime()) / 86_400_000)
    : null;
  const flag     = client.nationality ? FLAGS[client.nationality] : null;
  const langName = client.language    ? (LANG_NAMES[client.language] ?? client.language) : null;

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      {/* Back */}
      <Link href="/clients" className="inline-flex items-center gap-1.5 text-sm text-stone-500 hover:text-[#B8960C] transition-colors">
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
        </svg>
        All Clients
      </Link>

      {/* Hero — clean: name + avatar + edit only */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-[#B8960C] to-[#CD853F]" />
        <div className="px-6 py-5 flex items-center gap-5">
          <Avatar name={fullName} size="xl" className="shrink-0" />
          <div className="flex-1 min-w-0">
            <h1 className="font-serif text-2xl font-bold text-stone-900 leading-tight">{displayName}</h1>
            {client.primaryAgent && (
              <p className="mt-1 text-sm text-stone-400">{client.primaryAgent}</p>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {client.archived && (
              <span className="inline-flex items-center gap-1.5 px-3 h-7 rounded-full text-xs font-semibold bg-stone-100 text-stone-500 border border-stone-200">
                Archived
              </span>
            )}
            <button
              onClick={() => setShowEdit(true)}
              className="inline-flex items-center gap-1.5 px-4 h-9 rounded-lg text-sm font-medium border border-stone-200 text-stone-600 hover:border-[#B8960C] hover:text-[#B8960C] transition-colors"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
              </svg>
              Edit
            </button>
            {client.archived ? (
              <button
                onClick={handleReactivate}
                className="inline-flex items-center gap-1.5 px-4 h-9 rounded-lg text-sm font-medium border border-emerald-200 text-emerald-700 hover:bg-emerald-50 transition-colors"
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                </svg>
                Reactivate
              </button>
            ) : (
              <button
                onClick={() => setShowArchiveConfirm(true)}
                className="inline-flex items-center gap-1.5 px-4 h-9 rounded-lg text-sm font-medium border border-stone-200 text-stone-400 hover:border-red-200 hover:text-red-500 transition-colors"
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                </svg>
                Archive
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-5 items-start">

        {/* ── Left column: main sections ── */}
        <div className="space-y-5">

          {/* Contact Details */}
          <Section title="Contact Details">
            <Row label="Full Name">{displayName}</Row>
            {client.phone && (
              <Row label="Phone">
                <a href={`tel:${client.phone}`} className="text-[#B8960C] hover:underline font-mono">{client.phone}</a>
              </Row>
            )}
            {client.email && (
              <Row label="Email">
                <a href={`mailto:${client.email}`} className="text-[#B8960C] hover:underline">{client.email}</a>
              </Row>
            )}
            {client.nationality && (
              <Row label="Nationality">
                <span className="flex items-center gap-1.5">
                  {flag && <span>{flag}</span>}
                  {client.nationality}
                </span>
              </Row>
            )}
            {langName && <Row label="Language">{langName}</Row>}
          </Section>

          {/* Pipeline progress */}
          <div className="bg-white rounded-xl border border-stone-200 shadow-sm px-6 py-5">
            <h2 className="font-serif text-xl font-bold text-stone-900 mb-5">Pipeline Stage</h2>
            <div className="relative flex items-start justify-between">
              <div className="absolute left-0 right-0 top-[18px] h-0.5 bg-stone-100" aria-hidden />
              {STAGES.map((stage, idx) => {
                const done    = idx < currentIdx;
                const current = idx === currentIdx;
                const future  = idx > currentIdx;
                return (
                  <div key={stage.key} className="relative flex flex-1 flex-col items-center gap-2">
                    <div className={cn(
                      "relative z-10 flex h-9 w-9 items-center justify-center rounded-full border-2 text-xs font-bold transition-all",
                      done    && "border-[#CD853F] bg-[#CD853F] text-white",
                      current && "border-[#B8960C] bg-[#B8960C] text-white shadow-[0_0_0_4px_rgba(184,150,12,0.15)]",
                      future  && "border-stone-200 bg-white text-stone-300",
                    )}>
                      {done ? (
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                          <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      ) : (
                        <span>{idx + 1}</span>
                      )}
                    </div>
                    <span className={cn(
                      "text-center text-[10px] leading-tight font-medium",
                      current ? "text-[#B8960C]" : done ? "text-[#CD853F]" : "text-stone-300"
                    )}>
                      {stage.short}
                    </span>
                  </div>
                );
              })}
            </div>
            {daysInStage !== null && (
              <p className={cn("mt-4 text-xs", daysInStage > 14 ? "text-orange-500 font-medium" : "text-stone-400")}>
                {daysInStage > 14 ? `⚠ ${daysInStage} days in this stage — follow-up recommended` : `${daysInStage} days in current stage`}
              </p>
            )}
          </div>

          {/* Financials */}
          <Section title="Financials">
            {client.priceGroup && (
              <Row label="Price Group"><PriceGroupBadge group={client.priceGroup} showRange /></Row>
            )}
            {(client.budgetMin != null || client.budgetMax != null) && (
              <Row label="Budget">
                <span className="font-semibold text-[#B8960C]">
                  {client.budgetMin != null && client.budgetMax != null
                    ? `${formatCurrency(client.budgetMin)} – ${formatCurrency(client.budgetMax)}`
                    : client.budgetMin != null
                    ? `from ${formatCurrency(client.budgetMin)}`
                    : `up to ${formatCurrency(client.budgetMax!)}`}
                </span>
              </Row>
            )}
            {client.propertyInterest && (
              <Row label="Looking for">
                <span className="italic text-stone-600">{client.propertyInterest}</span>
              </Row>
            )}
          </Section>

          {/* Matching Properties */}
          <PropertyMatches client={client} />

          {/* Documents */}
          <ClientDocuments clientId={client.id} />

          {/* Activity Timeline */}
          <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-stone-100">
              <h2 className="font-serif text-xl font-bold text-stone-900">Activity History</h2>
            </div>
            <div className="px-6 py-4">
              <ActivityTimeline
                activities={activities.slice().sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())}
              />
            </div>
          </div>
        </div>

        {/* ── Right sidebar ── */}
        <div className="space-y-4 lg:sticky lg:top-6">

          {/* Send Property CTA */}
          <button
            onClick={() => setShowSend(true)}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold bg-[#128C7E] text-white hover:bg-[#0e6b60] transition-colors shadow-sm"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
            </svg>
            Send Property Info
          </button>

          {/* Status panel */}
          <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-stone-100">
              <p className="text-sm font-bold text-stone-800">Client Status</p>
            </div>
            <div className="px-4 py-3 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-stone-500">Class</span>
                <ClientClassBadge clientClass={client.clientClass} showLabel size="sm" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-stone-500">Stage</span>
                <PipelineStageBadge stage={client.stage} size="sm" />
              </div>
              {client.priceGroup && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-stone-500">Price Group</span>
                  <PriceGroupBadge group={client.priceGroup} />
                </div>
              )}
              {client.primaryAgent && (
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs text-stone-500 shrink-0">Agent</span>
                  <span className="text-xs font-medium text-stone-700 text-right">{client.primaryAgent}</span>
                </div>
              )}
            </div>
          </div>

          {/* Agent Note */}
          <AgentNote client={client} onSave={saveOverride} />

          {/* Quick contact */}
          {(client.phone || client.email) && (
            <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-stone-100">
                <p className="text-sm font-bold text-stone-800">Quick Contact</p>
              </div>
              <div className="px-4 py-3 space-y-2">
                {client.phone && (
                  <a href={`https://wa.me/${client.phone.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg bg-[#128C7E]/10 text-[#128C7E] hover:bg-[#128C7E]/20 transition-colors text-xs font-medium">
                    <svg className="h-4 w-4 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                    WhatsApp
                  </a>
                )}
                {client.phone && (
                  <a href={`tel:${client.phone}`}
                    className="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg bg-stone-50 text-stone-600 hover:bg-stone-100 transition-colors text-xs font-medium">
                    <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                    </svg>
                    Call
                  </a>
                )}
                {client.email && (
                  <a
                    href={`https://outlook.office.com/mail/deeplink/compose?to=${encodeURIComponent(client.email)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg bg-[#0078D4]/10 text-[#0078D4] hover:bg-[#0078D4]/20 transition-colors text-xs font-medium">
                    <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                    </svg>
                    Outlook
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Archive Confirmation */}
      {showArchiveConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowArchiveConfirm(false)} />
          <div className="relative z-10 w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6 space-y-4">
            <h3 className="font-serif text-lg font-semibold text-stone-900">Archive client?</h3>
            <p className="text-sm text-stone-500">
              {client.firstName} {client.lastName} will be moved to the archive and hidden from active lists. You can reactivate them at any time.
            </p>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowArchiveConfirm(false)}
                className="flex-1 h-10 rounded-lg border border-stone-200 text-sm font-medium text-stone-600 hover:bg-stone-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleArchive}
                className="flex-1 h-10 rounded-lg bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-colors"
              >
                Archive
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Send Property Modal */}
      {showSend && (
        <SendPropertyModal client={client} onClose={() => setShowSend(false)} />
      )}

      {/* Edit Modal */}
      {showEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowEdit(false)} />
          <div className="relative z-10 w-full max-w-2xl max-h-[90vh] bg-[#faf8f5] rounded-2xl shadow-2xl overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 bg-white shrink-0">
              <div>
                <h2 className="font-serif text-lg font-semibold text-stone-900">Edit Client</h2>
                <p className="text-xs text-stone-400 mt-0.5">{fullName}</p>
              </div>
              <button onClick={() => setShowEdit(false)}
                className="h-8 w-8 flex items-center justify-center rounded-lg text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-colors">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="overflow-y-auto flex-1">
              <EditClientForm
                client={client}
                onSuccess={(updated) => { setClient(updated); setShowEdit(false); }}
                onCancel={() => setShowEdit(false)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
