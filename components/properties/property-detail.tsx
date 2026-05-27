"use client";

import { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { ArrowLeft, Pencil, Waves, Droplets, Mountain, MapPin, Navigation, Check, X, Plus, ChevronUp, ChevronDown, FileDown } from "lucide-react";
import { EditPropertyForm } from "@/components/properties/edit-property-form";
import { PotentialBuyers } from "./potential-buyers";
import { PresentationTracker } from "./presentation-tracker";
import { SendPresentationModal } from "./send-presentation-modal";
import { formatCurrency } from "@/lib/utils";
import { AreaSelect } from "@/components/properties/area-select";
import { getProperty, upsertProperty } from "@/lib/db/properties";
import { getPhotosForProperty } from "@/lib/db/photos";
import { getActivitiesForProperty, createActivity } from "@/lib/db/activities";
import { getAllAgents } from "@/lib/db/agents";
import { createClient } from "@/lib/supabase/client";
import type { Property, PropertyStatus, PropertyType, Activity } from "@/types";
import { DocumentsSection } from "@/components/documents/documents-section";
import { ActivityTimeline } from "@/components/clients/activity-timeline";

const PropertyPhotoGallery = dynamic(
  () => import("@/components/properties/property-photo-gallery").then(m => ({ default: m.PropertyPhotoGallery })),
  { ssr: false, loading: () => <div className="h-40 rounded-xl bg-stone-100 animate-pulse" /> }
);

const STATUS_CONFIG: Record<PropertyStatus, { label: string; dotClass: string; badgeClass: string }> = {
  available:      { label: "Available",      dotClass: "bg-emerald-400", badgeClass: "bg-emerald-50  text-emerald-700  border-emerald-200"  },
  under_offer:    { label: "Under Offer",    dotClass: "bg-amber-400",   badgeClass: "bg-amber-50    text-amber-700    border-amber-200"    },
  under_contract: { label: "Under Contract", dotClass: "bg-orange-400",  badgeClass: "bg-orange-50   text-orange-700   border-orange-200"   },
  sold:           { label: "Sold",           dotClass: "bg-stone-400",   badgeClass: "bg-stone-100   text-stone-600    border-stone-300"    },
  off_market:     { label: "Off Market",     dotClass: "bg-slate-400",   badgeClass: "bg-slate-50    text-slate-600    border-slate-300"    },
  on_hold:        { label: "On Hold",        dotClass: "bg-amber-400",   badgeClass: "bg-amber-50    text-amber-700    border-amber-200"    },
  draft:          { label: "Draft",          dotClass: "bg-gray-300",    badgeClass: "bg-gray-50     text-gray-500     border-gray-200"     },
  rented:         { label: "Rented",         dotClass: "bg-sky-400",     badgeClass: "bg-sky-50      text-sky-700      border-sky-200"      },
  withdrawn:      { label: "Withdrawn",      dotClass: "bg-red-400",     badgeClass: "bg-red-50      text-red-600      border-red-200"      },
  archived:       { label: "Archived",       dotClass: "bg-neutral-300", badgeClass: "bg-neutral-50  text-neutral-500  border-neutral-200"  },
};

const TYPE_LABELS: Record<PropertyType, string> = {
  villa: "Villa", apartment: "Apartment", house: "House", plot: "Plot",
  investment: "Investment", renovation_project: "Renovation Project",
  new_project: "New Project", opportunity: "Opportunity",
  cycladic: "Cycladic", maisonette: "Maisonette", studio: "Studio",
  land: "Land / Plot", commercial: "Commercial", hotel: "Hotel / B&B",
};

const AGENT_NAMES: Record<string, string> = {
  errikos:         "Dan Paul",
  errikos_expose:  "Dan - Property Expose",
  klaus:           "Klaus Weber",
  anna:            "Anna Papadopoulos",
};

const ENERGY_COLORS: Record<string, string> = {
  "A+": "bg-green-600", A: "bg-green-500", B: "bg-lime-500",
  C: "bg-yellow-400", D: "bg-orange-400", E: "bg-orange-500",
  F: "bg-red-500", G: "bg-red-700", exempt: "bg-stone-400",
};

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-4 py-2.5 border-b border-stone-100 last:border-0">
      <dt className="w-44 shrink-0 text-[11px] font-semibold text-stone-400 uppercase tracking-wider pt-0.5">{label}</dt>
      <dd className="flex-1 text-sm text-stone-800">{children}</dd>
    </div>
  );
}

function Box({
  title, children, onEdit, editActive,
}: {
  title: string;
  children: React.ReactNode;
  onEdit?: () => void;
  editActive?: boolean;
}) {
  return (
    <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between">
        <h2 className="font-serif text-xl font-bold text-stone-900">{title}</h2>
        {onEdit && !editActive && (
          <button onClick={onEdit} className="p-1 rounded text-stone-300 hover:text-[#B8960C] transition-colors" title={`Edit ${title}`}>
            <Pencil size={13} strokeWidth={2} />
          </button>
        )}
      </div>
      <div className="px-6 py-4">{children}</div>
    </div>
  );
}


const inp = "w-full rounded-lg border border-stone-200 px-3 py-1.5 text-sm text-stone-800 focus:outline-none focus:ring-1 focus:ring-[#B8960C] focus:border-[#B8960C] bg-white transition-colors";
const sel = inp;

function Label({ children }: { children: React.ReactNode }) {
  return <p className="text-[10px] uppercase tracking-wider text-stone-400 font-semibold mb-1">{children}</p>;
}

function SaveCancel({ onSave, onCancel }: { onSave: () => void; onCancel: () => void }) {
  return (
    <div className="flex gap-2 mt-4 pt-3 border-t border-stone-100">
      <button onClick={onSave}
        className="inline-flex items-center gap-1.5 h-7 px-3 rounded-lg bg-[#B8960C] text-white text-xs font-semibold hover:bg-[#9e7f0a] transition-colors">
        <Check size={11} strokeWidth={2.5} /> Save
      </button>
      <button onClick={onCancel}
        className="h-7 px-3 rounded-lg text-xs font-medium text-stone-500 hover:text-stone-700 border border-stone-200 hover:border-stone-300 transition-colors">
        Cancel
      </button>
    </div>
  );
}

export function PropertyDetail({ property: initial }: { property: Property }) {
  const [property, setProperty] = useState<Property>(initial);
  const [editing, setEditing] = useState(false);
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [draft, setDraft] = useState<Property>(initial);
  const [draftCoords, setDraftCoords] = useState("");
  const [newFeature, setNewFeature] = useState("");
  const [newHeating, setNewHeating] = useState("");
  const [pdfPhotos, setPdfPhotos] = useState<string[]>([]);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [sendOpen, setSendOpen] = useState(false);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [currentAgentName, setCurrentAgentName] = useState<string>("");

  useEffect(() => {
    getProperty(initial.id).then(override => {
      if (override) setProperty(override);
    });
  }, [initial.id]);

  useEffect(() => {
    getPhotosForProperty(initial.id).then(setPdfPhotos);
  }, [initial.id]);

  useEffect(() => {
    getActivitiesForProperty(initial.id).then(setActivities);
  }, [initial.id]);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await createClient().auth.getUser();
      if (!user) return;
      const agents = await getAllAgents();
      const match = agents.find(a => a.email === user.email);
      setCurrentAgentName(match?.name ?? user.email ?? "Agent");
    })();
  }, []);

  const handleDownloadPDF = async () => {
    setPdfLoading(true);
    try {
      const { pdf } = await import("@react-pdf/renderer");
      const { PropertyPDFDocument } = await import("@/components/properties/property-pdf");
      const allPhotos = (() => {
        const extras = pdfPhotos.filter(p => p !== property.coverImage);
        return property.coverImage ? [property.coverImage, ...extras] : extras;
      })();
      const blob = await pdf(
        <PropertyPDFDocument property={property} photos={allPhotos} />
      ).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${property.reference}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setPdfLoading(false);
    }
  };

  const logActivity = useCallback((note: string, type: Activity["type"] = "note") => {
    const agentName = currentAgentName || "Agent";
    createActivity({ propertyId: initial.id, type, note, agentName })
      .then(a => { if (a) setActivities(prev => [a, ...prev]); });
  }, [currentAgentName, initial.id]);

  const handleSave = (updated: Property) => {
    upsertProperty(updated).catch(err => console.error("[PropertyDetail] handleSave:", err));
    if (updated.status !== property.status) {
      const cfg = STATUS_CONFIG[updated.status];
      logActivity(`Status changed to ${cfg?.label ?? updated.status}`, "stage_change");
    } else {
      logActivity("Property details updated");
    }
    setProperty(updated);
    setEditing(false);
  };

  const saveSection = () => {
    upsertProperty(draft).catch(err => console.error("[PropertyDetail] saveSection:", err));
    if (draft.status !== property.status) {
      const cfg = STATUS_CONFIG[draft.status];
      logActivity(`Status changed to ${cfg?.label ?? draft.status}`, "stage_change");
    } else {
      logActivity("Property details updated");
    }
    setProperty(draft);
    setEditingSection(null);
  };

  const startEdit = (section: string) => {
    setDraft({ ...property });
    setDraftCoords(
      property.lat && property.lng ? `${property.lat}, ${property.lng}` : ""
    );
    setNewFeature("");
    setNewHeating("");
    setEditingSection(section);
  };

  const cancelEdit = () => setEditingSection(null);

  const setD = (updates: Partial<Property>) =>
    setDraft(prev => ({ ...prev, ...updates }));

  const handleCoordsChange = (val: string) => {
    setDraftCoords(val);
    const parts = val.split(",").map(s => parseFloat(s.trim()));
    if (parts.length === 2 && parts.every(n => !isNaN(n))) {
      setDraft(prev => ({ ...prev, lat: parts[0], lng: parts[1] }));
    } else if (!val.trim()) {
      setDraft(prev => {
        const p = { ...prev };
        delete p.lat;
        delete p.lng;
        return p;
      });
    }
  };

  const statusCfg = STATUS_CONFIG[property.status] ?? STATUS_CONFIG.draft;
  const typeLabel = TYPE_LABELS[property.type] ?? property.type;
  const allAgentIds = [property.agentId, ...(property.coAgentIds ?? [])].filter(Boolean);

  return (
    <div className="space-y-6">

      {/* Page header */}
      <div className="flex items-end justify-between gap-4 pb-2 border-b border-stone-100">
        <div className="flex items-start gap-4">
          <Link href="/properties"
            className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-stone-200 bg-white text-stone-400 hover:text-stone-700 hover:border-stone-300 transition-colors shadow-sm">
            <ArrowLeft size={15} strokeWidth={2} />
          </Link>
          <div>
            <p className="text-[13px] uppercase tracking-[0.2em] text-stone-400 font-medium mb-1">
              Properties <span className="text-[#B8960C] mx-2 font-light">/</span>
              <span className="text-[#B8960C]">{property.reference}</span>
            </p>
            <h1 className="font-serif text-[36px] font-semibold leading-none tracking-wide text-stone-900">
              {property.title.en}
            </h1>
            {property.title.de && (
              <p className="mt-1 text-sm text-stone-400 italic">{property.title.de}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-semibold border ${statusCfg.badgeClass}`}>
            <span className={`h-2 w-2 rounded-full shrink-0 ${statusCfg.dotClass}`} />
            {statusCfg.label}
          </span>
          {property.createdAt && (
            <span className="text-[11px] text-stone-400">
              Added {new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(property.createdAt))}
            </span>
          )}
          <button
            onClick={handleDownloadPDF}
            disabled={pdfLoading}
            className="inline-flex items-center gap-2 h-10 px-4 rounded-lg border border-stone-200 bg-white text-stone-600 text-sm font-medium hover:border-stone-300 hover:text-stone-800 transition-colors shadow-sm disabled:opacity-50">
            <FileDown size={14} strokeWidth={2} />
            {pdfLoading ? "Generating…" : "Export PDF"}
          </button>
          <button
            onClick={() => setSendOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-[#B8960C] px-4 py-2.5 text-[13px] font-semibold text-white hover:bg-[#9a7a0a] transition-colors shadow-sm"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
            Send Presentation
          </button>
          <button onClick={() => { setEditingSection(null); setEditing(true); }}
            className="inline-flex items-center gap-2 h-10 px-5 rounded-lg bg-[#B8960C] text-white text-sm font-semibold hover:bg-[#9e7f0a] transition-colors shadow-sm">
            <Pencil size={14} strokeWidth={2} />
            Edit Property
          </button>
        </div>
      </div>

      {/* Edit modal */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl p-8">
            <h2 className="font-serif text-2xl font-bold text-stone-900 mb-6">Edit Property</h2>
            <EditPropertyForm property={property} onSuccess={handleSave} onCancel={() => setEditing(false)} />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* ── Left column — Property Overview + Description ── */}
        <div className="space-y-6">

          {/* Property Overview */}
          <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-stone-100">
              <h2 className="font-serif text-xl font-bold text-stone-900">Property Overview</h2>
            </div>
            <div className="grid grid-cols-[1fr_280px] divide-x divide-stone-100 items-start">
              <div className="divide-y divide-stone-100">

              {/* ── PRICING ── */}
              <div className="px-6 py-5">
                <div className="flex items-center justify-between mb-3">
                  <p className="font-serif text-xl font-bold text-stone-900">Pricing</p>
                  {editingSection !== "pricing" && (
                    <button onClick={() => startEdit("pricing")} className="p-1 rounded text-stone-300 hover:text-[#B8960C] transition-colors" title="Edit pricing">
                      <Pencil size={11} strokeWidth={2} />
                    </button>
                  )}
                </div>

                {editingSection === "pricing" ? (
                  <div className="space-y-3">
                    <div>
                      <Label>Asking Price (€)</Label>
                      <input type="number" min="0" value={draft.askingPrice}
                        onChange={e => setD({ askingPrice: parseFloat(e.target.value) || 0 })}
                        className={inp} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label>Buyer Commission %</Label>
                        <input type="number" min="0" max="100" step="0.5"
                          value={draft.buyerCommission ?? ""}
                          onChange={e => setD({ buyerCommission: e.target.value ? parseFloat(e.target.value) : undefined })}
                          placeholder="—" className={inp} />
                      </div>
                      <div>
                        <Label>Seller Commission %</Label>
                        <input type="number" min="0" max="100" step="0.5"
                          value={draft.sellerCommission ?? ""}
                          onChange={e => setD({ sellerCommission: e.target.value ? parseFloat(e.target.value) : undefined })}
                          placeholder="—" className={inp} />
                      </div>
                    </div>
                    <div>
                      <Label>Contract Type</Label>
                      <select value={draft.contractType ?? ""} onChange={e => setD({ contractType: (e.target.value as "exclusive" | "open") || undefined })} className={sel}>
                        <option value="">— None —</option>
                        <option value="exclusive">Exclusive</option>
                        <option value="open">Open</option>
                      </select>
                    </div>
                    <SaveCancel onSave={saveSection} onCancel={cancelEdit} />
                  </div>
                ) : (
                  <div className="flex items-end gap-6 flex-wrap">
                    <div>
                      <p className="text-3xl font-bold text-[#B8960C] leading-none">{formatCurrency(property.askingPrice)}</p>
                      {property.buildArea > 0 && (
                        <p className="text-xs text-stone-400 mt-1">
                          {formatCurrency(Math.round(property.askingPrice / property.buildArea))} /m²
                        </p>
                      )}
                    </div>
                    {(property.buyerCommission !== undefined || property.sellerCommission !== undefined) && (
                      <div className="flex gap-4 text-sm">
                        {property.buyerCommission !== undefined && (
                          <div><span className="text-stone-400">Buyer </span><span className="font-semibold text-stone-700">{property.buyerCommission}%</span></div>
                        )}
                        {property.sellerCommission !== undefined && (
                          <div><span className="text-stone-400">Seller </span><span className="font-semibold text-stone-700">{property.sellerCommission}%</span></div>
                        )}
                      </div>
                    )}
                    {property.contractType && (
                      <span className="inline-flex px-2.5 py-1 rounded-full text-[11px] font-semibold border border-stone-200 text-stone-600 bg-stone-50">
                        {property.contractType.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* ── LISTING AGENT ── */}
              <div className="px-6 py-5">
                <div className="flex items-center justify-between mb-3">
                  <p className="font-serif text-xl font-bold text-stone-900">Listing Agent</p>
                  {editingSection !== "agents" && (
                    <button onClick={() => startEdit("agents")} className="p-1 rounded text-stone-300 hover:text-[#B8960C] transition-colors" title="Edit agents">
                      <Pencil size={11} strokeWidth={2} />
                    </button>
                  )}
                </div>

                {editingSection === "agents" ? (
                  <div className="space-y-3">
                    <div>
                      <Label>Primary Agent</Label>
                      <select value={draft.agentId} onChange={e => setD({ agentId: e.target.value })} className={sel}>
                        {Object.entries(AGENT_NAMES).map(([id, name]) => (
                          <option key={id} value={id}>{name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <Label>Co-Agents</Label>
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        {(draft.coAgentIds ?? []).map(id => (
                          <span key={id} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs bg-stone-100 text-stone-700 border border-stone-200">
                            {AGENT_NAMES[id] ?? id}
                            <button onClick={() => setD({ coAgentIds: (draft.coAgentIds ?? []).filter(a => a !== id) })}
                              className="ml-0.5 text-stone-400 hover:text-red-500 transition-colors">
                              <X size={10} strokeWidth={2.5} />
                            </button>
                          </span>
                        ))}
                      </div>
                      {Object.keys(AGENT_NAMES).filter(id => id !== draft.agentId && !(draft.coAgentIds ?? []).includes(id)).length > 0 && (
                        <select
                          value=""
                          onChange={e => { if (e.target.value) setD({ coAgentIds: [...(draft.coAgentIds ?? []), e.target.value] }); }}
                          className={sel}>
                          <option value="">+ Add co-agent…</option>
                          {Object.entries(AGENT_NAMES)
                            .filter(([id]) => id !== draft.agentId && !(draft.coAgentIds ?? []).includes(id))
                            .map(([id, name]) => <option key={id} value={id}>{name}</option>)}
                        </select>
                      )}
                    </div>
                    <div>
                      <Label>Ownership Group</Label>
                      <input type="text" value={draft.ownershipGroup ?? ""} onChange={e => setD({ ownershipGroup: e.target.value || undefined })} className={inp} placeholder="— None —" />
                    </div>
                    <SaveCancel onSave={saveSection} onCancel={cancelEdit} />
                  </div>
                ) : (
                  <>
                    <div className="flex flex-wrap gap-3">
                      {allAgentIds.map((id, idx) => {
                        const name = AGENT_NAMES[id] ?? id;
                        const initials = name.split(" ").map((n: string) => n[0]).join("").slice(0, 2);
                        return (
                          <div key={id} className="flex items-center gap-2.5 bg-stone-50 rounded-lg px-3 py-2 border border-stone-100">
                            <div className="h-8 w-8 rounded-full bg-[#B8960C]/10 flex items-center justify-center shrink-0">
                              <span className="text-xs font-bold text-[#B8960C]">{initials}</span>
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-stone-800 leading-none">{name}</p>
                              <p className="text-[10px] text-stone-400 mt-0.5">{idx === 0 ? "Lead" : "Co-Agent"}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    {property.ownershipGroup && (
                      <p className="mt-2 text-xs text-stone-400">Ownership: <span className="text-stone-600">{property.ownershipGroup}</span></p>
                    )}
                  </>
                )}
              </div>

              {/* ── PROPERTY DETAILS (Classification + Location) ── */}
              <div className="px-6 py-5">
                <div className="flex items-center justify-between mb-3">
                  <p className="font-serif text-xl font-bold text-stone-900">Property Details</p>
                  {editingSection !== "details" && (
                    <button onClick={() => startEdit("details")} className="p-1 rounded text-stone-300 hover:text-[#B8960C] transition-colors" title="Edit property details">
                      <Pencil size={11} strokeWidth={2} />
                    </button>
                  )}
                </div>

                {editingSection === "details" ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label>Type</Label>
                        <select value={draft.type} onChange={e => setD({ type: e.target.value as PropertyType })} className={sel}>
                          {Object.entries(TYPE_LABELS).map(([val, label]) => (
                            <option key={val} value={val}>{label}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <Label>Usage</Label>
                        <select value={draft.usage ?? ""} onChange={e => setD({ usage: (e.target.value as "residential" | "commercial") || undefined })} className={sel}>
                          <option value="">— None —</option>
                          <option value="residential">Residential</option>
                          <option value="commercial">Commercial</option>
                        </select>
                      </div>
                      <div>
                        <Label>Condition</Label>
                        <select value={draft.condition ?? ""} onChange={e => setD({ condition: (e.target.value as "planned" | "in_good_condition" | "needs_renovation" | "under_construction") || undefined })} className={sel}>
                          <option value="">— None —</option>
                          <option value="planned">Planned</option>
                          <option value="in_good_condition">In Good Condition</option>
                          <option value="needs_renovation">Needs Renovation</option>
                          <option value="under_construction">Under Construction</option>
                        </select>
                      </div>
                      <div>
                        <Label>Energy Class</Label>
                        <select value={draft.energyClass ?? ""} onChange={e => setD({ energyClass: (e.target.value as "A+" | "A" | "B" | "C" | "D" | "E" | "F" | "G" | "exempt") || undefined })} className={sel}>
                          <option value="">— None —</option>
                          {["A+","A","B","C","D","E","F","G","exempt"].map(v => <option key={v} value={v}>{v}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label>Area / Location</Label>
                        <AreaSelect value={draft.area} onChange={v => setD({ area: v })} inputClassName={inp} />
                      </div>
                      <div>
                        <Label>Island</Label>
                        <input type="text" value={draft.island ?? ""} onChange={e => setD({ island: e.target.value || undefined })} placeholder="e.g. Paros" className={inp} />
                      </div>
                    </div>
                    <div>
                      <Label>Address</Label>
                      <input type="text" value={draft.address ?? ""} onChange={e => setD({ address: e.target.value || undefined })} placeholder="— None —" className={inp} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label>Postal Code</Label>
                        <input type="text" value={draft.postalCode ?? ""} onChange={e => setD({ postalCode: e.target.value || undefined })} placeholder="—" className={inp} />
                      </div>
                      <div>
                        <Label>Scout Region</Label>
                        <input type="text" value={draft.scoutRegion ?? ""} onChange={e => setD({ scoutRegion: e.target.value || undefined })} placeholder="—" className={inp} />
                      </div>
                    </div>
                    <div>
                      <Label>GPS Coordinates (lat, lng)</Label>
                      <input type="text" value={draftCoords} onChange={e => handleCoordsChange(e.target.value)} placeholder="e.g. 37.08432, 25.15141" className={inp} />
                    </div>
                    <div>
                      <Label>Heating Types</Label>
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        {(draft.heatingTypes ?? []).map(h => (
                          <span key={h} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs bg-stone-100 text-stone-700 border border-stone-200">
                            {h}
                            <button onClick={() => setD({ heatingTypes: (draft.heatingTypes ?? []).filter(x => x !== h) })}
                              className="ml-0.5 text-stone-400 hover:text-red-500 transition-colors">
                              <X size={10} strokeWidth={2.5} />
                            </button>
                          </span>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <input type="text" value={newHeating} onChange={e => setNewHeating(e.target.value)}
                          onKeyDown={e => { if (e.key === "Enter" && newHeating.trim()) { setD({ heatingTypes: [...(draft.heatingTypes ?? []), newHeating.trim()] }); setNewHeating(""); e.preventDefault(); }}}
                          placeholder="Add heating type…" className={`${inp} flex-1`} />
                        <button
                          onClick={() => { if (newHeating.trim()) { setD({ heatingTypes: [...(draft.heatingTypes ?? []), newHeating.trim()] }); setNewHeating(""); }}}
                          className="inline-flex items-center gap-1 h-9 px-3 rounded-lg bg-stone-100 text-stone-600 text-xs font-medium hover:bg-stone-200 transition-colors border border-stone-200">
                          <Plus size={12} strokeWidth={2.5} /> Add
                        </button>
                      </div>
                    </div>
                    <SaveCancel onSave={saveSection} onCancel={cancelEdit} />
                  </div>
                ) : (
                  <dl>
                    <InfoRow label="Type">{typeLabel}</InfoRow>
                    {property.usage && (
                      <InfoRow label="Usage">{property.usage.charAt(0).toUpperCase() + property.usage.slice(1)}</InfoRow>
                    )}
                    <InfoRow label="Location">
                      <a
                        href={property.lat && property.lng
                          ? `https://www.google.com/maps?q=${property.lat},${property.lng}`
                          : `https://www.google.com/maps/search/${encodeURIComponent(`${property.area}, Paros, Greece`)}`}
                        target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-[#B8960C] hover:text-[#9e7f0a] font-medium transition-colors"
                      >
                        <MapPin size={12} strokeWidth={2} />
                        {property.area}{property.island ? `, ${property.island}` : ", Paros"}
                      </a>
                    </InfoRow>
                    {property.address     && <InfoRow label="Address">{property.address}{property.postalCode ? ` · ${property.postalCode}` : ""}</InfoRow>}
                    {property.scoutRegion && <InfoRow label="Scout Region">{property.scoutRegion}</InfoRow>}
                    {property.lat && property.lng && (
                      <InfoRow label="GPS">
                        <a href={`https://www.google.com/maps?q=${property.lat},${property.lng}`} target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[#B8960C] hover:text-[#9e7f0a] font-medium transition-colors text-xs">
                          <Navigation size={11} strokeWidth={2} />
                          {property.lat.toFixed(5)}, {property.lng.toFixed(5)}
                        </a>
                      </InfoRow>
                    )}
                    {property.yearOfConstruction && <InfoRow label="Year Built">{property.yearOfConstruction}</InfoRow>}
                    {property.condition && (
                      <InfoRow label="Condition">{property.condition.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())}</InfoRow>
                    )}
                    {property.energyClass && (
                      <InfoRow label="Energy">
                        <span className={`inline-flex items-center justify-center h-6 w-8 rounded text-white text-xs font-bold ${ENERGY_COLORS[property.energyClass] ?? "bg-stone-400"}`}>
                          {property.energyClass}
                        </span>
                      </InfoRow>
                    )}
                    {property.heatingTypes && property.heatingTypes.length > 0 && (
                      <InfoRow label="Heating">
                        <div className="flex flex-wrap gap-1">
                          {property.heatingTypes.map(h => (
                            <span key={h} className="inline-flex px-1.5 py-0.5 rounded text-[10px] font-medium bg-stone-100 text-stone-600 border border-stone-200">{h}</span>
                          ))}
                        </div>
                      </InfoRow>
                    )}
                  </dl>
                )}
              </div>
              </div>

              {/* ── QUICK FACTS (right column) ── */}
              <div className="px-6 py-5">
              <div className="flex items-center justify-between mb-3">
                <p className="font-serif text-xl font-bold text-stone-900">Quick Facts</p>
                {editingSection !== "facts" && (
                  <button onClick={() => startEdit("facts")} className="p-1 rounded text-stone-300 hover:text-[#B8960C] transition-colors" title="Edit quick facts">
                    <Pencil size={11} strokeWidth={2} />
                  </button>
                )}
              </div>

              {editingSection === "facts" ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    {([
                      ["Bedrooms",      "bedrooms",          true],
                      ["Bathrooms",     "bathrooms",         true],
                      ["Build Area m²", "buildArea",         true],
                      ["Plot Area m²",  "plotArea",          false],
                      ["Buildable m²",  "buildableArea",     false],
                      ["Rooms",         "rooms",             false],
                      ["Floors",        "floors",            false],
                      ["Balconies",     "balconies",         false],
                      ["Terraces",      "terraces",          false],
                      ["Year Built",    "yearOfConstruction",false],
                      ["Sea Distance m","distanceFromSea",   false],
                    ] as [string, keyof Property, boolean][]).map(([label, key, required]) => (
                      <div key={String(key)}>
                        <Label>{label}</Label>
                        <input type="number" min="0"
                          value={(draft[key] as number | undefined) ?? ""}
                          onChange={e => setD({ [key]: e.target.value ? parseFloat(e.target.value) : (required ? 0 : undefined) })}
                          placeholder={required ? "0" : "—"}
                          className={inp} />
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Area / Location</Label>
                      <AreaSelect value={draft.area} onChange={v => setD({ area: v })} inputClassName={inp} />
                    </div>
                    <div>
                      <Label>Island</Label>
                      <input type="text" value={draft.island ?? ""} onChange={e => setD({ island: e.target.value || undefined })} placeholder="e.g. Paros" className={inp} />
                    </div>
                  </div>
                  <SaveCancel onSave={saveSection} onCancel={cancelEdit} />
                </div>
              ) : (
                <div className="space-y-0">
                  {[
                    ["Bedrooms",   property.bedrooms],
                    ["Bathrooms",  property.bathrooms],
                    ["Build",      `${property.buildArea.toLocaleString("en-DE")} m²`],
                    ...(property.plotArea          ? [["Plot",       `${property.plotArea.toLocaleString("en-DE")} m²`]] : []),
                    ...(property.buildableArea     ? [["Buildable",  `${property.buildableArea.toLocaleString("en-DE")} m²`]] : []),
                    ...(property.rooms             ? [["Rooms",      property.rooms]] : []),
                    ...(property.floors            ? [["Floors",     property.floors]] : []),
                    ...(property.balconies         ? [["Balconies",  property.balconies]] : []),
                    ...(property.terraces          ? [["Terraces",   property.terraces]] : []),
                    ...(property.yearOfConstruction? [["Year Built", property.yearOfConstruction]] : []),
                    ...(property.distanceFromSea !== undefined ? [["Sea Distance", property.distanceFromSea === 0 ? "Seafront" : `${property.distanceFromSea}m`]] : []),
                    ["Location",   property.area],
                  ].map(([label, value]) => (
                    <div key={String(label)} className="flex items-center justify-between gap-2 py-1.5 border-b border-stone-100 last:border-0">
                      <span className="text-[11px] uppercase tracking-wider text-stone-400 font-semibold whitespace-nowrap">{label}</span>
                      <span className="text-sm font-semibold text-stone-800 text-right">{value}</span>
                    </div>
                  ))}
                </div>
              )}
              </div>
            </div>
          </div>

          {/* Description */}
          <Box title="Description" onEdit={() => startEdit("description")} editActive={editingSection === "description"}>
            {editingSection === "description" ? (
              <div className="space-y-3">
                <textarea
                  value={draft.description ?? ""}
                  onChange={e => setD({ description: e.target.value || undefined })}
                  rows={6}
                  placeholder="Property description…"
                  className={`${inp} resize-y`} />
                <SaveCancel onSave={saveSection} onCancel={cancelEdit} />
              </div>
            ) : property.description ? (
              <p className="text-sm text-stone-700 whitespace-pre-wrap leading-relaxed">{property.description}</p>
            ) : (
              <p className="text-sm text-stone-400 italic">No description added yet. Click the pencil icon to add one.</p>
            )}
          </Box>
        </div>

        {/* ── Right column — Photos · Features · Legal · Comments ── */}
        <div className="space-y-6">

          {/* Photos */}
          <Box title="Photos">
            <PropertyPhotoGallery
              propertyId={property.id}
              coverImage={property.coverImage}
              onCoverChange={(url) => handleSave({ ...property, coverImage: url || undefined })}
            />
          </Box>

          {/* Features */}
          <Box title="Features" onEdit={() => startEdit("features")} editActive={editingSection === "features"}>
            {editingSection === "features" ? (
              <div className="space-y-3">
                <div className="flex flex-wrap gap-3">
                  {[
                    { key: "seafront", label: "Seafront" },
                    { key: "seaView",  label: "Sea View" },
                    { key: "pool",     label: "Pool" },
                  ].map(({ key, label }) => (
                    <label key={key} className="flex items-center gap-2 cursor-pointer text-sm text-stone-700 select-none">
                      <input type="checkbox"
                        checked={!!draft[key as keyof Property]}
                        onChange={e => setD({ [key]: e.target.checked })}
                        className="h-4 w-4 rounded border-stone-300 accent-[#B8960C]" />
                      {label}
                    </label>
                  ))}
                </div>
                <div>
                  <Label>Additional Features</Label>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {(draft.features ?? []).map(f => (
                      <span key={f} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs bg-stone-100 text-stone-700 border border-stone-200">
                        {f}
                        <button onClick={() => setD({ features: (draft.features ?? []).filter(x => x !== f) })}
                          className="ml-0.5 text-stone-400 hover:text-red-500 transition-colors">
                          <X size={10} strokeWidth={2.5} />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input type="text" value={newFeature} onChange={e => setNewFeature(e.target.value)}
                      onKeyDown={e => { if (e.key === "Enter" && newFeature.trim()) { setD({ features: [...(draft.features ?? []), newFeature.trim()] }); setNewFeature(""); e.preventDefault(); }}}
                      placeholder="Add feature…" className={`${inp} flex-1`} />
                    <button
                      onClick={() => { if (newFeature.trim()) { setD({ features: [...(draft.features ?? []), newFeature.trim()] }); setNewFeature(""); }}}
                      className="inline-flex items-center gap-1 h-9 px-3 rounded-lg bg-stone-100 text-stone-600 text-xs font-medium hover:bg-stone-200 transition-colors border border-stone-200">
                      <Plus size={12} strokeWidth={2.5} /> Add
                    </button>
                  </div>
                </div>
                <SaveCancel onSave={saveSection} onCancel={cancelEdit} />
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {property.seafront && <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-sky-50 text-sky-700 border border-sky-200"><Waves size={11} /> Seafront</span>}
                {property.seaView  && <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-50 text-slate-600 border border-slate-200"><Mountain size={11} /> Sea View</span>}
                {property.pool     && <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-200"><Droplets size={11} /> Pool</span>}
                {property.features?.map(f => (
                  <span key={f} className="inline-flex px-2.5 py-1 rounded-full text-[11px] font-medium bg-stone-100 text-stone-700 border border-stone-200">{f}</span>
                ))}
                {!property.seafront && !property.seaView && !property.pool && (!property.features || property.features.length === 0) && (
                  <p className="text-sm text-stone-400 italic">No features added yet. Click the pencil icon to add some.</p>
                )}
              </div>
            )}
          </Box>

          {/* Legal Checklist */}
          <Box title="Legal Checklist" onEdit={() => startEdit("legal")} editActive={editingSection === "legal"}>
            {editingSection === "legal" ? (
              <div className="space-y-2">
                {(draft.legalChecklist ?? [
                  { label: "KAEK (Property Identifier)",        checked: false },
                  { label: "Energy Performance Certificate",     checked: false },
                  { label: "ENFIA (Property Tax Clearance)",     checked: false },
                  { label: "Building Permits",                   checked: false },
                  { label: "Title Search Complete",              checked: false },
                  { label: "Notary Appointed",                   checked: false },
                ]).map((item, idx) => {
                  const list = draft.legalChecklist ?? [
                    { label: "KAEK (Property Identifier)",        checked: false },
                    { label: "Energy Performance Certificate",     checked: false },
                    { label: "ENFIA (Property Tax Clearance)",     checked: false },
                    { label: "Building Permits",                   checked: false },
                    { label: "Title Search Complete",              checked: false },
                    { label: "Notary Appointed",                   checked: false },
                  ];
                  return (
                    <div key={idx} className="flex items-center gap-2">
                      <div className="flex flex-col shrink-0">
                        <button
                          disabled={idx === 0}
                          onClick={() => {
                            const updated = [...list];
                            [updated[idx - 1], updated[idx]] = [updated[idx], updated[idx - 1]];
                            setD({ legalChecklist: updated });
                          }}
                          className="text-stone-300 hover:text-stone-500 disabled:opacity-20 disabled:cursor-not-allowed transition-colors leading-none">
                          <ChevronUp size={13} strokeWidth={2.5} />
                        </button>
                        <button
                          disabled={idx === list.length - 1}
                          onClick={() => {
                            const updated = [...list];
                            [updated[idx + 1], updated[idx]] = [updated[idx], updated[idx + 1]];
                            setD({ legalChecklist: updated });
                          }}
                          className="text-stone-300 hover:text-stone-500 disabled:opacity-20 disabled:cursor-not-allowed transition-colors leading-none">
                          <ChevronDown size={13} strokeWidth={2.5} />
                        </button>
                      </div>
                      <button
                        onClick={() => {
                          const updated = list.map((it, i) => i === idx ? { ...it, checked: !it.checked } : it);
                          setD({ legalChecklist: updated });
                        }}
                        className={`h-4 w-4 rounded border-2 shrink-0 flex items-center justify-center transition-colors ${item.checked ? "bg-[#B8960C] border-[#B8960C]" : "border-stone-300 hover:border-[#B8960C]"}`}>
                        {item.checked && <span className="text-white text-[10px] font-bold leading-none">✓</span>}
                      </button>
                      <input
                        type="text"
                        value={item.label}
                        onChange={e => {
                          const updated = list.map((it, i) => i === idx ? { ...it, label: e.target.value } : it);
                          setD({ legalChecklist: updated });
                        }}
                        className={`${inp} flex-1`} />
                      <button
                        onClick={() => setD({ legalChecklist: list.filter((_, i) => i !== idx) })}
                        className="text-stone-300 hover:text-red-500 transition-colors shrink-0">
                        <X size={13} strokeWidth={2.5} />
                      </button>
                    </div>
                  );
                })}
                <button
                  onClick={() => {
                    const list = draft.legalChecklist ?? [
                      { label: "KAEK (Property Identifier)",        checked: false },
                      { label: "Energy Performance Certificate",     checked: false },
                      { label: "ENFIA (Property Tax Clearance)",     checked: false },
                      { label: "Building Permits",                   checked: false },
                      { label: "Title Search Complete",              checked: false },
                      { label: "Notary Appointed",                   checked: false },
                    ];
                    setD({ legalChecklist: [...list, { label: "", checked: false }] });
                  }}
                  className="inline-flex items-center gap-1.5 mt-1 text-xs text-stone-400 hover:text-[#B8960C] transition-colors font-medium">
                  <Plus size={12} strokeWidth={2.5} /> Add item
                </button>
                <SaveCancel onSave={saveSection} onCancel={cancelEdit} />
              </div>
            ) : (
              <div className="space-y-1">
                {(property.legalChecklist ?? [
                  { label: "KAEK (Property Identifier)",        checked: false },
                  { label: "Energy Performance Certificate",     checked: false },
                  { label: "ENFIA (Property Tax Clearance)",     checked: false },
                  { label: "Building Permits",                   checked: false },
                  { label: "Title Search Complete",              checked: false },
                  { label: "Notary Appointed",                   checked: false },
                ]).map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3 py-1.5">
                    <span className={`h-4 w-4 rounded border-2 shrink-0 flex items-center justify-center ${item.checked ? "bg-[#B8960C] border-[#B8960C]" : "border-stone-300"}`}>
                      {item.checked && <span className="text-white text-[10px] font-bold leading-none">✓</span>}
                    </span>
                    <span className={`text-sm ${item.checked ? "line-through text-stone-400" : "text-stone-700"}`}>{item.label}</span>
                  </div>
                ))}
              </div>
            )}
          </Box>

          {/* Comments */}
          {property.comments && (
            <Box title="Comments / Notes">
              <p className="text-sm text-stone-700 whitespace-pre-wrap leading-relaxed">{property.comments}</p>
            </Box>
          )}

          {/* Presentation Tracker */}
          <PresentationTracker propertyId={property.id} />

          {/* Potential Buyers */}
          <PotentialBuyers property={property} />

        </div>
      </div>

      {/* ── Documents ── */}
      <DocumentsSection
        entityType="property"
        entityId={property.id}
        onActivity={note => logActivity(note, "document")}
      />

      {/* ── Activity History ── */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-stone-100">
          <h2 className="font-serif text-xl font-bold text-stone-900">Activity History</h2>
        </div>
        <div className="px-6 py-4">
          <ActivityTimeline activities={activities} />
        </div>
      </div>

      <SendPresentationModal open={sendOpen} property={property} onClose={() => setSendOpen(false)} />
    </div>
  );
}
