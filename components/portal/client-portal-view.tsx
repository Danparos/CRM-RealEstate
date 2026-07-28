"use client";

import type { PipelineStage } from "@/types";

interface PortalClient {
  id: string;
  first_name: string;
  last_name: string;
  client_class: string;
  stage: PipelineStage;
  primary_agent?: string;
  email?: string;
  phone?: string;
  language?: string;
}

interface PortalProperty {
  id: string;
  property_ref: string;
  property_title: string;
  sent_at: string;
  thumbnail: string | null;
  token?: string;
}

interface PortalDocument {
  id: string;
  file_name: string;
  file_size?: number;
  storage_path: string;
  created_at: string;
}

interface Props {
  client: PortalClient;
  properties: PortalProperty[];
  documents: PortalDocument[];
}

const STAGES: { key: PipelineStage; label: string }[] = [
  { key: "new_inquiry",          label: "New Inquiry" },
  { key: "qualified",            label: "Qualified" },
  { key: "property_presentation", label: "Property Presentation" },
  { key: "offer_submitted",      label: "Offer Submitted" },
  { key: "negotiation",          label: "Negotiation" },
  { key: "legal_process",        label: "Legal Process" },
  { key: "signed_closed",        label: "Signed & Closed" },
];

function formatFileSize(bytes?: number): string {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function buildDocUrl(storagePath: string): string {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  return `${base}/storage/v1/object/public/documents/${storagePath}`;
}

export function ClientPortalView({ client, properties, documents }: Props) {
  const currentStageIndex = STAGES.findIndex((s) => s.key === client.stage);

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <div className="h-1.5 bg-gradient-to-r from-[#B8960C] via-[#e6c84a] to-[#B8960C]" />

      <div className="border-b border-[#E8E2D9] bg-white px-6 py-5 flex items-center justify-between">
        <div>
          <p className="font-serif text-[18px] font-semibold text-[#B8960C] tracking-wide">
            Errikos Kohls Immobilien
          </p>
          <p className="text-[11px] text-stone-400 uppercase tracking-[0.15em] mt-0.5">
            Premium Real Estate · Paros, Greece
          </p>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-stone-400 uppercase tracking-wider">Client Portal</p>
          <p className="text-sm font-semibold text-stone-700">
            {client.first_name} {client.last_name}
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-10 space-y-8">

        <div>
          <p className="text-[10px] uppercase tracking-wider text-stone-400 font-semibold mb-1">
            Welcome back
          </p>
          <h1 className="font-serif text-3xl font-semibold text-stone-900">
            Your Property Journey
          </h1>
          <p className="text-stone-500 text-sm mt-2">
            Hello {client.first_name}, here is an overview of your current status and everything we have prepared for you.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-[#E8E2D9] shadow-sm px-6 py-6">
          <p className="text-[10px] uppercase tracking-wider font-semibold text-stone-400 mb-6">
            Journey Progress
          </p>
          <div className="overflow-x-auto pb-2">
            <div className="flex items-start gap-0 min-w-max">
              {STAGES.map((stage, i) => {
                const isCompleted = i < currentStageIndex;
                const isCurrent   = i === currentStageIndex;
                const isPending   = i > currentStageIndex;
                return (
                  <div key={stage.key} className="flex items-start">
                    <div className="flex flex-col items-center" style={{ width: 88 }}>
                      <div
                        className={`h-8 w-8 rounded-full flex items-center justify-center border-2 transition-all ${
                          isCompleted
                            ? "bg-[#B8960C] border-[#B8960C]"
                            : isCurrent
                            ? "bg-white border-[#B8960C] shadow-[0_0_0_3px_rgba(184,150,12,0.15)]"
                            : "bg-white border-stone-200"
                        }`}
                      >
                        {isCompleted ? (
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        ) : isCurrent ? (
                          <div className="h-2.5 w-2.5 rounded-full bg-[#B8960C]" />
                        ) : (
                          <div className="h-2 w-2 rounded-full bg-stone-200" />
                        )}
                      </div>
                      <p
                        className={`text-center text-[10px] mt-2 leading-tight font-medium ${
                          isCurrent
                            ? "text-[#B8960C]"
                            : isCompleted
                            ? "text-stone-600"
                            : "text-stone-300"
                        }`}
                        style={{ maxWidth: 72 }}
                      >
                        {stage.label}
                      </p>
                    </div>
                    {i < STAGES.length - 1 && (
                      <div
                        className={`mt-4 h-0.5 flex-1 transition-colors ${
                          i < currentStageIndex ? "bg-[#B8960C]" : "bg-stone-200"
                        }`}
                        style={{ width: 24, minWidth: 24 }}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div>
          <p className="text-[10px] uppercase tracking-wider font-semibold text-stone-400 mb-4">
            Presented Properties
          </p>
          {properties.length === 0 ? (
            <div className="bg-white rounded-2xl border border-[#E8E2D9] px-8 py-12 text-center">
              <div className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center mx-auto mb-3">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#B8960C" strokeWidth="1.5">
                  <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
              </div>
              <p className="font-serif text-stone-600 text-lg">No properties presented yet</p>
              <p className="text-stone-400 text-sm mt-1">Your agent will share curated properties here soon.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {properties.map((prop) => (
                <div
                  key={prop.id}
                  className="bg-white rounded-2xl border border-[#E8E2D9] shadow-sm overflow-hidden"
                >
                  <div className="relative h-44 bg-gradient-to-br from-stone-100 to-stone-200">
                    {prop.thumbnail ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={prop.thumbnail}
                        alt={prop.property_title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#B8960C" strokeWidth="1">
                          <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                          <polyline points="9 22 9 12 15 12 15 22" />
                        </svg>
                      </div>
                    )}
                    <div className="absolute top-2 left-2 bg-black/50 text-white text-[10px] font-mono px-2 py-0.5 rounded-full">
                      {prop.property_ref}
                    </div>
                  </div>
                  <div className="px-4 py-4">
                    <p className="font-serif text-stone-900 font-semibold leading-snug line-clamp-2">
                      {prop.property_title}
                    </p>
                    <p className="text-[11px] text-stone-400 mt-1.5">
                      Sent on {formatDate(prop.sent_at)}
                    </p>
                    {prop.token && (
                      <a
                        href={`/p/${prop.token}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-3 inline-flex items-center gap-1.5 text-[12px] font-semibold text-[#B8960C] hover:underline"
                      >
                        View Presentation
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
                          <polyline points="15 3 21 3 21 9" />
                          <line x1="10" y1="14" x2="21" y2="3" />
                        </svg>
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <p className="text-[10px] uppercase tracking-wider font-semibold text-stone-400 mb-4">
            Your Documents
          </p>
          {documents.length === 0 ? (
            <div className="bg-white rounded-2xl border border-[#E8E2D9] px-8 py-12 text-center">
              <div className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center mx-auto mb-3">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#B8960C" strokeWidth="1.5">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
              </div>
              <p className="font-serif text-stone-600 text-lg">No documents yet</p>
              <p className="text-stone-400 text-sm mt-1">Documents shared by your agent will appear here.</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-[#E8E2D9] shadow-sm divide-y divide-[#E8E2D9] overflow-hidden">
              {documents.map((doc) => (
                <div key={doc.id} className="flex items-center gap-4 px-5 py-4">
                  <div className="h-9 w-9 rounded-lg bg-[#B8960C]/10 flex items-center justify-center shrink-0">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#B8960C" strokeWidth="1.5">
                      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-stone-800 truncate">{doc.file_name}</p>
                    <p className="text-[11px] text-stone-400 mt-0.5">
                      {formatFileSize(doc.file_size)}
                      {doc.file_size ? " · " : ""}
                      {formatDate(doc.created_at)}
                    </p>
                  </div>
                  <a
                    href={buildDocUrl(doc.storage_path)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 flex items-center gap-1.5 text-[12px] font-semibold text-[#B8960C] hover:underline"
                  >
                    Download
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>

        <p className="text-center text-[11px] text-stone-400 pb-4">
          Powered by Paros CRM
        </p>
      </div>
    </div>
  );
}
