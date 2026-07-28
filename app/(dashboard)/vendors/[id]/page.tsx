"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Save, Check, Phone, Mail, Globe, Home,
  Building2, ChevronDown, ChevronUp, Loader2, CalendarDays, BadgePercent
} from "lucide-react";
import { getVendor, upsertVendor } from "@/lib/db/vendors";
import { getAllAgents } from "@/lib/db/agents";
import { getAllProperties } from "@/lib/db/properties";
import { getActivitiesForVendor, createActivity } from "@/lib/db/activities";
import { createClient } from "@/lib/supabase/client";
import { ActivityTimeline } from "@/components/clients/activity-timeline";
import type { Vendor, VendorStage, Agent, Activity, ActivityType } from "@/types";
import type { Property } from "@/types";
import { cn } from "@/lib/utils";

const STAGE_CONFIG: Record<VendorStage, { label: string; dot: string; badge: string }> = {
  owner_inquiry:     { label: "Owner Inquiry",     dot: "bg-sky-400",     badge: "bg-sky-50 text-sky-700 border-sky-200"         },
  valuation:         { label: "Valuation",         dot: "bg-violet-400",  badge: "bg-violet-50 text-violet-700 border-violet-200" },
  listing_agreement: { label: "Listing Agreement", dot: "bg-amber-400",   badge: "bg-amber-50 text-amber-700 border-amber-200"    },
  listed:            { label: "Listed",            dot: "bg-emerald-400", badge: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  under_offer:       { label: "Under Offer",       dot: "bg-orange-400",  badge: "bg-orange-50 text-orange-700 border-orange-200"  },
  legal_process:     { label: "Legal Process",     dot: "bg-red-400",     badge: "bg-red-50 text-red-700 border-red-200"           },
  sold:              { label: "Sold",              dot: "bg-stone-400",   badge: "bg-stone-100 text-stone-600 border-stone-200"    },
  withdrawn:         { label: "Withdrawn",         dot: "bg-stone-300",   badge: "bg-stone-50 text-stone-400 border-stone-200"     },
};

const STAGE_OPTIONS: VendorStage[] = [
  "owner_inquiry", "valuation", "listing_agreement", "listed",
  "under_offer", "legal_process", "sold", "withdrawn",
];

const ACTIVITY_TYPES: { value: ActivityType; label: string }[] = [
  { value: "phone_call", label: "Phone Call" },
  { value: "whatsapp",   label: "WhatsApp"   },
  { value: "email",      label: "Email"      },
  { value: "meeting",    label: "Meeting"    },
  { value: "note",       label: "Note"       },
  { value: "document",   label: "Document"   },
];

const inp = "h-10 w-full rounded-xl border border-stone-200 bg-white px-3 text-sm text-stone-800 outline-none focus:border-[#B8960C] focus:ring-2 focus:ring-[#B8960C]/20 transition-all";

function fmt(n?: number) {
  if (!n) return "—";
  return "€" + n.toLocaleString("de-DE");
}

function Section({ title, icon: Icon, open, onToggle, children }: {
  title: string; icon?: React.ElementType; open: boolean; onToggle: () => void; children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
      <button type="button" onClick={onToggle}
        className="w-full flex items-center justify-between px-6 py-4 hover:bg-stone-50 transition-colors">
        <div className="flex items-center gap-2.5">
          {Icon && <Icon size={15} className="text-stone-400" />}
          <span className="font-semibold text-stone-800 text-[15px]">{title}</span>
        </div>
        {open ? <ChevronUp size={15} className="text-stone-400" /> : <ChevronDown size={15} className="text-stone-400" />}
      </button>
      {open && <div className="px-6 pb-6 pt-2 border-t border-stone-100">{children}</div>}
    </div>
  );
}

export default function VendorDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [vendor,     setVendor]     = useState<Vendor | null>(null);
  const [agents,     setAgents]     = useState<Agent[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [currentAgentName, setCurrentAgentName] = useState("Agent");
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);
  const [saved,    setSaved]    = useState(false);
  const [sections, setSections] = useState({ contact: true, property: true, activity: true });
  const [actType,  setActType]  = useState<ActivityType>("phone_call");
  const [actNote,  setActNote]  = useState("");
  const [logging,  setLogging]  = useState(false);

  useEffect(() => {
    Promise.all([
      getVendor(params.id),
      getAllAgents(),
      getAllProperties(),
      getActivitiesForVendor(params.id),
      createClient().auth.getUser(),
    ]).then(([v, a, p, acts, { data: { user } }]) => {
      setVendor(v);
      setAgents(a.filter(ag => ag.active !== false));
      setProperties(p.filter(pr => pr.status !== "sold" && pr.status !== "archived"));
      setActivities(acts);
      if (user?.email) {
        const me = a.find(ag => ag.email === user.email);
        if (me) setCurrentAgentName(me.name);
      }
      setLoading(false);
    });
  }, [params.id]);

  const update = useCallback((patch: Partial<Vendor>) => {
    setVendor(prev => prev ? { ...prev, ...patch } : prev);
  }, []);

  const handleSave = async () => {
    if (!vendor) return;
    setSaving(true);
    const now = new Date().toISOString();
    const updated = { ...vendor, updatedAt: now };
    await upsertVendor(updated);
    setVendor(updated);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleStageChange = async (newStage: VendorStage) => {
    if (!vendor || newStage === vendor.stage) return;
    const oldLabel = STAGE_CONFIG[vendor.stage].label;
    const newLabel = STAGE_CONFIG[newStage].label;
    const now = new Date().toISOString();
    update({ stage: newStage, stageEnteredAt: now });
    const act = await createActivity({
      vendorId:  vendor.id,
      type:      "stage_change",
      note:      `Stage changed: ${oldLabel} → ${newLabel}`,
      agentName: currentAgentName,
    });
    if (act) setActivities(prev => [act, ...prev]);
  };

  const logActivity = async () => {
    if (!vendor || !actNote.trim()) return;
    setLogging(true);
    const now = new Date().toISOString();
    const act = await createActivity({
      vendorId:  vendor.id,
      type:      actType,
      note:      actNote.trim(),
      agentName: currentAgentName,
    });
    if (act) {
      setActivities(prev => [act, ...prev]);
      update({ lastActivityAt: now, lastActivityNote: actNote.trim() });
      await upsertVendor({ ...vendor, lastActivityAt: now, lastActivityNote: actNote.trim() });
    }
    setActNote("");
    setLogging(false);
  };

  if (loading) return (
    <div className="flex items-center justify-center py-24">
      <div className="h-7 w-7 rounded-full border-2 border-[#B8960C] border-t-transparent animate-spin" />
    </div>
  );

  if (!vendor) return (
    <div className="text-center py-24 text-stone-400">
      <p>Vendor not found.</p>
      <Link href="/vendors" className="text-[#B8960C] text-sm font-semibold hover:underline mt-2 block">Back to vendors</Link>
    </div>
  );

  const cfg = STAGE_CONFIG[vendor.stage];
  const linkedProperty = properties.find(p => p.id === vendor.propertyId);

  return (
    <div className="max-w-3xl space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <Link href="/vendors" className="h-8 w-8 flex items-center justify-center rounded-full border border-stone-200 bg-white text-stone-400 hover:text-stone-700 hover:border-stone-300 transition-colors">
            <ArrowLeft size={14} strokeWidth={2} />
          </Link>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="font-serif text-2xl font-semibold text-stone-900">
                {vendor.firstName} {vendor.lastName}
              </h1>
              <span className={cn("inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold border", cfg.badge)}>
                <span className={cn("h-1.5 w-1.5 rounded-full", cfg.dot)} />
                {cfg.label}
              </span>
            </div>
            {vendor.createdAt && (
              <p className="text-[11px] text-stone-400 mt-0.5">
                Added {new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(vendor.createdAt))}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Stage selector */}
          <select
            value={vendor.stage}
            onChange={e => handleStageChange(e.target.value as VendorStage)}
            className={cn("px-3 py-1.5 rounded-lg text-xs font-semibold border focus:outline-none appearance-none cursor-pointer", cfg.badge)}
          >
            {STAGE_OPTIONS.map(s => (
              <option key={s} value={s}>{STAGE_CONFIG[s].label}</option>
            ))}
          </select>
          <button onClick={handleSave} disabled={saving}
            className={cn("inline-flex items-center gap-2 h-9 px-4 rounded-lg text-sm font-semibold transition-all",
              saved ? "bg-emerald-500 text-white" : "bg-[#B8960C] text-white hover:bg-[#9e7f0a]")}>
            {saved ? <><Check size={14} /> Saved</> : saving ? "Saving…" : <><Save size={14} /> Save</>}
          </button>
        </div>
      </div>

      {/* Contact section */}
      <Section title="Contact Details" icon={Phone} open={sections.contact} onToggle={() => setSections(s => ({ ...s, contact: !s.contact }))}>
        <div className="grid grid-cols-2 gap-4 pt-4">
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-stone-400 mb-1.5">First Name</label>
            <input value={vendor.firstName} onChange={e => update({ firstName: e.target.value })} className={inp} />
          </div>
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-stone-400 mb-1.5">Last Name</label>
            <input value={vendor.lastName} onChange={e => update({ lastName: e.target.value })} className={inp} />
          </div>
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-stone-400 mb-1.5">Email</label>
            <input type="email" value={vendor.email ?? ""} onChange={e => update({ email: e.target.value || undefined })} className={inp} placeholder="owner@email.com" />
          </div>
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-stone-400 mb-1.5">Phone / WhatsApp</label>
            <input type="tel" value={vendor.phone ?? ""} onChange={e => update({ phone: e.target.value || undefined })} className={inp} placeholder="+30 694 …" />
          </div>
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-stone-400 mb-1.5">Nationality</label>
            <input value={vendor.nationality ?? ""} onChange={e => update({ nationality: e.target.value || undefined })} className={inp} placeholder="e.g. GR, DE" />
          </div>
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-stone-400 mb-1.5">Assigned Agent</label>
            <select
              value={vendor.primaryAgentId ?? ""}
              onChange={e => {
                const a = agents.find(ag => ag.id === e.target.value);
                update({ primaryAgentId: e.target.value || undefined, primaryAgent: a?.name });
              }}
              className={inp + " appearance-none cursor-pointer"}
            >
              <option value="">— Select agent —</option>
              {agents.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          </div>
        </div>
      </Section>

      {/* Property & financials */}
      <Section title="Property & Deal Terms" icon={Home} open={sections.property} onToggle={() => setSections(s => ({ ...s, property: !s.property }))}>
        <div className="grid grid-cols-2 gap-4 pt-4">
          <div className="col-span-2">
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-stone-400 mb-1.5">Linked Property</label>
            <select
              value={vendor.propertyId ?? ""}
              onChange={e => {
                const p = properties.find(pr => pr.id === e.target.value);
                update({ propertyId: e.target.value || undefined, propertyRef: p?.reference });
              }}
              className={inp + " appearance-none cursor-pointer"}
            >
              <option value="">— No property linked —</option>
              {properties.map(p => (
                <option key={p.id} value={p.id}>{p.reference} · {Object.values(p.title)[0] ?? ""}</option>
              ))}
            </select>
            {linkedProperty && (
              <Link href={`/properties/${linkedProperty.id}`}
                className="inline-flex items-center gap-1.5 mt-2 text-xs text-[#B8960C] hover:underline font-medium">
                <Building2 size={11} /> View property {linkedProperty.reference}
              </Link>
            )}
          </div>
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-stone-400 mb-1.5">Asking Price (€)</label>
            <input type="number" value={vendor.askingPrice?.toString() ?? ""} onChange={e => update({ askingPrice: e.target.value ? Number(e.target.value) : undefined })} className={inp} placeholder="1500000" />
          </div>
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-stone-400 mb-1.5">Valuation Price (€)</label>
            <input type="number" value={vendor.valuationPrice?.toString() ?? ""} onChange={e => update({ valuationPrice: e.target.value ? Number(e.target.value) : undefined })} className={inp} placeholder="1400000" />
          </div>
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-stone-400 mb-1.5">Listing Commission (%)</label>
            <input type="number" step="0.1" value={vendor.listingCommission?.toString() ?? ""} onChange={e => update({ listingCommission: e.target.value ? Number(e.target.value) : undefined })} className={inp} placeholder="2" />
          </div>
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-stone-400 mb-1.5">Contract Type</label>
            <select value={vendor.contractType ?? ""} onChange={e => update({ contractType: (e.target.value as Vendor["contractType"]) || undefined })} className={inp + " appearance-none cursor-pointer"}>
              <option value="">— Select —</option>
              <option value="exclusive">Exclusive</option>
              <option value="open">Open</option>
            </select>
          </div>
          {vendor.contractType === "exclusive" && (
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-stone-400 mb-1.5">Exclusive Until</label>
              <input type="date" value={vendor.exclusiveUntil ?? ""} onChange={e => update({ exclusiveUntil: e.target.value || undefined })} className={inp} />
            </div>
          )}
        </div>

        {/* Commission preview */}
        {vendor.askingPrice && vendor.listingCommission && (
          <div className="mt-4 rounded-xl border border-[#B8960C]/20 bg-amber-50/60 px-5 py-4">
            <p className="text-[10px] uppercase tracking-wider font-semibold text-stone-400 mb-2">Expected Seller Commission</p>
            <div className="flex items-center justify-between">
              <span className="text-sm text-stone-600">
                {fmt(vendor.askingPrice)} × {vendor.listingCommission}%
              </span>
              <span className="text-lg font-bold text-[#B8960C]">
                {fmt((vendor.askingPrice * vendor.listingCommission) / 100)}
              </span>
            </div>
          </div>
        )}

        <div className="mt-4">
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-stone-400 mb-1.5">Notes</label>
          <textarea value={vendor.notes ?? ""} onChange={e => update({ notes: e.target.value || undefined })}
            rows={3} className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm text-stone-800 outline-none focus:border-[#B8960C] focus:ring-2 focus:ring-[#B8960C]/20 transition-all resize-none placeholder:text-stone-400"
            placeholder="Notes about this vendor relationship…" />
        </div>
      </Section>

      {/* Activity section */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
        <button type="button" onClick={() => setSections(s => ({ ...s, activity: !s.activity }))}
          className="w-full flex items-center justify-between px-6 py-4 hover:bg-stone-50 transition-colors">
          <div className="flex items-center gap-2.5">
            <CalendarDays size={15} className="text-stone-400" />
            <span className="font-semibold text-stone-800 text-[15px]">Activity History</span>
            {activities.length > 0 && (
              <span className="h-5 px-1.5 rounded-full bg-stone-100 text-[11px] font-semibold text-stone-500 flex items-center">{activities.length}</span>
            )}
          </div>
          {sections.activity ? <ChevronUp size={15} className="text-stone-400" /> : <ChevronDown size={15} className="text-stone-400" />}
        </button>
        {sections.activity && (
          <div className="px-6 pb-6 pt-2 border-t border-stone-100">
            {/* Log activity */}
            <div className="flex gap-2 mb-6 mt-2">
              <select value={actType} onChange={e => setActType(e.target.value as ActivityType)}
                className="h-9 rounded-lg border border-stone-200 bg-white px-2.5 text-xs text-stone-700 focus:outline-none focus:border-[#B8960C] shrink-0">
                {ACTIVITY_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
              <input
                value={actNote}
                onChange={e => setActNote(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); logActivity(); }}}
                placeholder="Add a note…"
                className="flex-1 h-9 rounded-lg border border-stone-200 bg-white px-3 text-sm text-stone-800 outline-none focus:border-[#B8960C] focus:ring-2 focus:ring-[#B8960C]/20 transition-all"
              />
              <button onClick={logActivity} disabled={logging || !actNote.trim()}
                className="h-9 px-4 rounded-lg bg-[#B8960C] text-white text-xs font-semibold hover:bg-[#9e7f0a] transition-colors disabled:opacity-40 shrink-0 flex items-center gap-1.5">
                {logging ? <Loader2 size={12} className="animate-spin" /> : null}
                Log
              </button>
            </div>
            <ActivityTimeline activities={activities} />
          </div>
        )}
      </div>
    </div>
  );
}
