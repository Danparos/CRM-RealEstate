"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { upsertVendor, generateVendorId } from "@/lib/db/vendors";
import { getAllAgents } from "@/lib/db/agents";
import { getAllProperties } from "@/lib/db/properties";
import type { Vendor, VendorStage, Agent } from "@/types";
import type { Property } from "@/types";

const inp = "h-10 w-full rounded-xl border border-stone-200 bg-white px-3 text-sm text-stone-800 outline-none focus:border-[#B8960C] focus:ring-2 focus:ring-[#B8960C]/20 transition-all";
const sel = inp + " appearance-none cursor-pointer";

const STAGE_OPTIONS: { value: VendorStage; label: string }[] = [
  { value: "owner_inquiry",     label: "Owner Inquiry" },
  { value: "valuation",         label: "Valuation" },
  { value: "listing_agreement", label: "Listing Agreement" },
  { value: "listed",            label: "Listed" },
  { value: "under_offer",       label: "Under Offer" },
  { value: "legal_process",     label: "Legal Process" },
];

export default function NewVendorPage() {
  const router = useRouter();
  const [agents,     setAgents]     = useState<Agent[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [saving,     setSaving]     = useState(false);
  const [saveError,  setSaveError]  = useState("");
  const [form, setForm] = useState({
    firstName:        "",
    lastName:         "",
    email:            "",
    phone:            "",
    nationality:      "",
    stage:            "owner_inquiry" as VendorStage,
    primaryAgentId:   "",
    propertyId:       "",
    askingPrice:      "",
    valuationPrice:   "",
    listingCommission: "",
    contractType:     "" as "" | "exclusive" | "open",
    exclusiveUntil:   "",
    notes:            "",
  });

  useEffect(() => {
    Promise.all([getAllAgents(), getAllProperties()]).then(([a, p]) => {
      setAgents(a.filter(ag => ag.active !== false));
      setProperties(p.filter(pr => pr.status !== "sold" && pr.status !== "archived"));
    });
  }, []);

  const set = <K extends keyof typeof form>(k: K, v: typeof form[K]) =>
    setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.firstName || !form.lastName) return;
    setSaving(true);

    const agent    = agents.find(a => a.id === form.primaryAgentId);
    const property = properties.find(p => p.id === form.propertyId);
    const now      = new Date().toISOString();

    const vendor: Vendor = {
      id:               generateVendorId(),
      firstName:        form.firstName,
      lastName:         form.lastName,
      email:            form.email            || undefined,
      phone:            form.phone            || undefined,
      nationality:      form.nationality      || undefined,
      stage:            form.stage,
      primaryAgentId:   form.primaryAgentId   || undefined,
      primaryAgent:     agent?.name,
      propertyId:       form.propertyId       || undefined,
      propertyRef:      property?.reference,
      askingPrice:      form.askingPrice      ? Number(form.askingPrice)      : undefined,
      valuationPrice:   form.valuationPrice   ? Number(form.valuationPrice)   : undefined,
      listingCommission: form.listingCommission ? Number(form.listingCommission) : undefined,
      contractType:     form.contractType     || undefined,
      exclusiveUntil:   form.exclusiveUntil   || undefined,
      notes:            form.notes            || undefined,
      stageEnteredAt:   now,
      createdAt:        now,
      updatedAt:        now,
    };

    const ok = await upsertVendor(vendor);
    if (!ok) {
      setSaveError("Could not save vendor — the vendors table may not exist yet. Run the SQL migration in Supabase first.");
      setSaving(false);
      return;
    }
    router.push(`/vendors/${vendor.id}`);
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/vendors" className="h-8 w-8 flex items-center justify-center rounded-full border border-stone-200 bg-white text-stone-400 hover:text-stone-700 hover:border-stone-300 transition-colors">
          <ArrowLeft size={14} strokeWidth={2} />
        </Link>
        <div>
          <h1 className="font-serif text-2xl font-semibold text-stone-900">Add Vendor</h1>
          <p className="text-sm text-stone-400 mt-0.5">New seller / property owner</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-stone-200 shadow-sm p-7 space-y-5">

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-stone-400 mb-1.5">First Name *</label>
            <input required value={form.firstName} onChange={e => set("firstName", e.target.value)} className={inp} placeholder="Maria" />
          </div>
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-stone-400 mb-1.5">Last Name *</label>
            <input required value={form.lastName} onChange={e => set("lastName", e.target.value)} className={inp} placeholder="Papadopoulos" />
          </div>
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-stone-400 mb-1.5">Email</label>
            <input type="email" value={form.email} onChange={e => set("email", e.target.value)} className={inp} placeholder="owner@email.com" />
          </div>
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-stone-400 mb-1.5">Phone / WhatsApp</label>
            <input type="tel" value={form.phone} onChange={e => set("phone", e.target.value)} className={inp} placeholder="+30 694 …" />
          </div>
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-stone-400 mb-1.5">Nationality</label>
            <input value={form.nationality} onChange={e => set("nationality", e.target.value)} className={inp} placeholder="e.g. GR, DE" />
          </div>
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-stone-400 mb-1.5">Stage</label>
            <select value={form.stage} onChange={e => set("stage", e.target.value as VendorStage)} className={sel}>
              {STAGE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-stone-400 mb-1.5">Assigned Agent</label>
            <select value={form.primaryAgentId} onChange={e => set("primaryAgentId", e.target.value)} className={sel}>
              <option value="">— Select agent —</option>
              {agents.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-stone-400 mb-1.5">Link to Property</label>
            <select value={form.propertyId} onChange={e => set("propertyId", e.target.value)} className={sel}>
              <option value="">— Select property —</option>
              {properties.map(p => (
                <option key={p.id} value={p.id}>{p.reference} · {Object.values(p.title)[0] ?? ""}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="border-t border-stone-100 pt-5">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-stone-400 mb-4">Property & Commission</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-stone-400 mb-1.5">Asking Price (€)</label>
              <input type="number" value={form.askingPrice} onChange={e => set("askingPrice", e.target.value)} className={inp} placeholder="1500000" />
            </div>
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-stone-400 mb-1.5">Valuation Price (€)</label>
              <input type="number" value={form.valuationPrice} onChange={e => set("valuationPrice", e.target.value)} className={inp} placeholder="1400000" />
            </div>
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-stone-400 mb-1.5">Listing Commission (%)</label>
              <input type="number" step="0.1" value={form.listingCommission} onChange={e => set("listingCommission", e.target.value)} className={inp} placeholder="2" />
            </div>
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-stone-400 mb-1.5">Contract Type</label>
              <select value={form.contractType} onChange={e => set("contractType", e.target.value as typeof form.contractType)} className={sel}>
                <option value="">— Select —</option>
                <option value="exclusive">Exclusive</option>
                <option value="open">Open</option>
              </select>
            </div>
            {form.contractType === "exclusive" && (
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-stone-400 mb-1.5">Exclusive Until</label>
                <input type="date" value={form.exclusiveUntil} onChange={e => set("exclusiveUntil", e.target.value)} className={inp} />
              </div>
            )}
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-stone-400 mb-1.5">Notes</label>
          <textarea value={form.notes} onChange={e => set("notes", e.target.value)}
            rows={3} className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm text-stone-800 outline-none focus:border-[#B8960C] focus:ring-2 focus:ring-[#B8960C]/20 transition-all resize-none placeholder:text-stone-400"
            placeholder="Any notes about this vendor…" />
        </div>

        {saveError && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {saveError}
          </div>
        )}

        <div className="flex gap-3 pt-2 border-t border-stone-100">
          <button type="submit" disabled={saving}
            className="inline-flex items-center gap-2 h-10 px-6 rounded-lg bg-[#B8960C] text-white text-sm font-semibold hover:bg-[#9e7f0a] transition-colors shadow-sm disabled:opacity-60">
            {saving ? "Saving…" : "Add Vendor"}
          </button>
          <Link href="/vendors" className="h-10 px-5 inline-flex items-center rounded-lg text-sm font-medium text-stone-500 hover:text-stone-700 border border-stone-200 hover:border-stone-300 transition-colors">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
