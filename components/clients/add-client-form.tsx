"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import type { Client, ClientClass, PipelineStage, PriceGroup, Salutation } from "@/types";

interface AddClientFormProps {
  onSuccess: (id: string) => void;
  onCancel: () => void;
}

const SALUTATION_OPTIONS = [
  { value: "Mr.",   label: "Mr." },
  { value: "Mrs.",  label: "Mrs." },
  { value: "Ms.",   label: "Ms." },
  { value: "Dr.",   label: "Dr." },
  { value: "Prof.", label: "Prof." },
];

const CLASS_OPTIONS    = [{ value: "A", label: "Hot" }, { value: "B", label: "Warm" }, { value: "C", label: "Cold" }];
const PRICE_OPTIONS    = [
  { value: "entry",   label: "Entry (up to €300K)" },
  { value: "mid",     label: "Mid (€300K–€750K)" },
  { value: "premium", label: "Premium (€750K–€1.5M)" },
  { value: "luxury",  label: "Luxury (€1.5M–€5M)" },
  { value: "ultra",   label: "Ultra (€5M+)" },
];
const STAGE_OPTIONS    = [
  { value: "new_inquiry",           label: "New Inquiry" },
  { value: "qualified",             label: "Qualified" },
  { value: "property_presentation", label: "Property Presentation" },
  { value: "offer_submitted",       label: "Offer Submitted" },
  { value: "negotiation",           label: "Negotiation" },
  { value: "legal_process",         label: "Legal Process" },
  { value: "signed_closed",         label: "Signed & Closed" },
];
const NATIONALITY_OPTIONS = [
  { value: "DE", label: "🇩🇪 Germany" }, { value: "FR", label: "🇫🇷 France" },
  { value: "GB", label: "🇬🇧 United Kingdom" }, { value: "GR", label: "🇬🇷 Greece" },
  { value: "IL", label: "🇮🇱 Israel" }, { value: "NL", label: "🇳🇱 Netherlands" },
  { value: "CH", label: "🇨🇭 Switzerland" }, { value: "US", label: "🇺🇸 United States" },
  { value: "IT", label: "🇮🇹 Italy" }, { value: "AU", label: "🇦🇺 Australia" },
];
const AGENT_OPTIONS = [
  { value: "Errikos Kohls",      label: "Errikos Kohls" },
  { value: "Klaus Weber",        label: "Klaus Weber" },
  { value: "Anna Papadopoulos",  label: "Anna Papadopoulos" },
];
const LANG_OPTIONS = [
  { value: "en", label: "English" }, { value: "de", label: "German" },
  { value: "fr", label: "French" },  { value: "el", label: "Greek" },
  { value: "he", label: "Hebrew" },  { value: "nl", label: "Dutch" },
];

const LOCATION_OPTIONS = [
  "Naoussa", "Parikia", "Lefkes", "Alyki", "Golden Beach",
  "Marpissa", "Santa Maria", "Kolymbithres", "Prodromos", "Ambelas",
  "Kamares", "Piso Livadi",
];

const PROPERTY_TYPE_OPTIONS = [
  { value: "villa",      label: "Villa" },
  { value: "cycladic",   label: "Cycladic" },
  { value: "house",      label: "House" },
  { value: "apartment",  label: "Apartment" },
  { value: "maisonette", label: "Maisonette" },
  { value: "studio",     label: "Studio" },
  { value: "land",       label: "Land / Plot" },
  { value: "hotel",      label: "Hotel / B&B" },
];

const BEDROOM_OPTIONS = [
  { value: "",  label: "Any" },
  { value: "1", label: "1" },
  { value: "2", label: "2" },
  { value: "3", label: "3" },
  { value: "4", label: "4" },
  { value: "5", label: "5" },
  { value: "6", label: "6+" },
];

const VIEW_OPTIONS = ["Sea View", "Seafront", "Sunset View", "Garden View", "Mountain / Valley", "Village View", "Panoramic"];

function FieldSet({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="space-y-4">
      <legend className="w-full pb-1.5 mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-400 border-b border-stone-100">
        {title}
      </legend>
      {children}
    </fieldset>
  );
}

function ChipGroup({
  label, options, selected, onToggle,
}: {
  label: string;
  options: string[];
  selected: string[];
  onToggle: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[11px] font-semibold uppercase tracking-widest text-warm-700">{label}</span>
      <div className="flex flex-wrap gap-1.5">
        {options.map((opt) => {
          const active = selected.includes(opt);
          return (
            <button
              key={opt}
              type="button"
              onClick={() => onToggle(opt)}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                active
                  ? "bg-[#B8960C] border-[#B8960C] text-white shadow-sm"
                  : "bg-white border-warm-300 text-warm-700 hover:border-[#B8960C] hover:text-[#B8960C]"
              }`}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function TypeChipGroup({
  label, options, selected, onToggle,
}: {
  label: string;
  options: { value: string; label: string }[];
  selected: string[];
  onToggle: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[11px] font-semibold uppercase tracking-widest text-warm-700">{label}</span>
      <div className="flex flex-wrap gap-1.5">
        {options.map((opt) => {
          const active = selected.includes(opt.value);
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onToggle(opt.value)}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                active
                  ? "bg-[#B8960C] border-[#B8960C] text-white shadow-sm"
                  : "bg-white border-warm-300 text-warm-700 hover:border-[#B8960C] hover:text-[#B8960C]"
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

interface Errors { firstName?: string; lastName?: string; email?: string }

export function AddClientForm({ onSuccess, onCancel }: AddClientFormProps) {
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [form, setForm] = useState({
    salutation: "",
    firstName: "", lastName: "", email: "", phone: "",
    nationality: "", language: "",
    clientClass: "B" as ClientClass,
    priceGroup: "" as PriceGroup | "",
    budgetMin: "", budgetMax: "",
    stage: "new_inquiry" as PipelineStage,
    primaryAgent: "",
    propertyNotes: "",
  });

  const [locations, setLocations]       = useState<string[]>([]);
  const [propertyTypes, setPropertyTypes] = useState<string[]>([]);
  const [bedroomsMin, setBedroomsMin]   = useState("");
  const [bedroomsMax, setBedroomsMax]   = useState("");
  const [pool, setPool]                 = useState<"any" | "yes" | "no">("any");
  const [views, setViews]               = useState<string[]>([]);

  const set = (k: string, v: string) => {
    setForm(p => ({ ...p, [k]: v }));
    if (errors[k as keyof Errors]) setErrors(p => ({ ...p, [k]: undefined }));
  };

  const toggleList = (setter: React.Dispatch<React.SetStateAction<string[]>>, val: string) => {
    setter(prev => prev.includes(val) ? prev.filter(x => x !== val) : [...prev, val]);
  };

  const validate = () => {
    const e: Errors = {};
    if (!form.firstName.trim()) e.firstName = "Required";
    if (!form.lastName.trim())  e.lastName  = "Required";
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Invalid email";
    setErrors(e);
    return !Object.keys(e).length;
  };

  const buildPropertyInterest = () => {
    const parts: string[] = [];
    if (propertyTypes.length) {
      const labels = propertyTypes.map(v => PROPERTY_TYPE_OPTIONS.find(o => o.value === v)?.label ?? v);
      parts.push(labels.join(" / "));
    }
    if (locations.length) parts.push(locations.join(", "));
    if (bedroomsMin && bedroomsMax && bedroomsMin !== bedroomsMax) {
      parts.push(`${bedroomsMin}–${bedroomsMax} beds`);
    } else if (bedroomsMin) {
      parts.push(`${bedroomsMin}+ beds`);
    } else if (bedroomsMax) {
      parts.push(`up to ${bedroomsMax} beds`);
    }
    if (pool === "yes") parts.push("Pool required");
    if (pool === "no")  parts.push("No pool");
    if (views.length) parts.push(views.join(", "));
    if (form.propertyNotes.trim()) parts.push(form.propertyNotes.trim());
    return parts.join(" · ");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setBusy(true);
    const now = new Date().toISOString();
    const client: Client = {
      id: `local-${Date.now()}`,
      salutation: (form.salutation as Salutation) || undefined,
      firstName: form.firstName.trim(), lastName: form.lastName.trim(),
      email: form.email.trim() || undefined, phone: form.phone.trim() || undefined,
      nationality: form.nationality || undefined, language: form.language || undefined,
      clientClass: form.clientClass,
      priceGroup: (form.priceGroup as PriceGroup) || undefined,
      budgetMin: form.budgetMin ? Number(form.budgetMin) : undefined,
      budgetMax: form.budgetMax ? Number(form.budgetMax) : undefined,
      stage: form.stage,
      primaryAgent: form.primaryAgent || undefined,
      propertyInterest: buildPropertyInterest() || undefined,
      propertyLocations: locations.length ? locations : undefined,
      propertyTypes: propertyTypes.length ? propertyTypes : undefined,
      propertyBedroomsMin: bedroomsMin || undefined,
      propertyBedroomsMax: bedroomsMax || undefined,
      propertyPool: pool !== "any" ? pool : undefined,
      propertyViews: views.length ? views : undefined,
      lastActivityAt: now, lastActivityNote: "Client created",
      stageEnteredAt: now, createdAt: now, updatedAt: now,
    };
    try {
      const existing = JSON.parse(localStorage.getItem("crm-extra-clients") ?? "[]") as Client[];
      localStorage.setItem("crm-extra-clients", JSON.stringify([...existing, client]));
    } catch {}
    setBusy(false);
    onSuccess(client.id);
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="px-6 py-5 space-y-6">
      <FieldSet title="Identity">
        <div className="grid grid-cols-[120px_1fr_1fr] gap-4">
          <Select label="Salutation" value={form.salutation}
            onChange={e => set("salutation", e.target.value)}
            options={SALUTATION_OPTIONS} placeholder="—" />
          <Input label="First Name" placeholder="Sophie" value={form.firstName}
            onChange={e => set("firstName", e.target.value)} error={errors.firstName} required />
          <Input label="Last Name" placeholder="Marchand" value={form.lastName}
            onChange={e => set("lastName", e.target.value)} error={errors.lastName} required />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Input label="Email" type="email" placeholder="client@example.com" value={form.email}
            onChange={e => set("email", e.target.value)} error={errors.email} />
          <Input label="Phone" type="tel" placeholder="+33 6 12 34 56 78" value={form.phone}
            onChange={e => set("phone", e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Select label="Nationality" value={form.nationality}
            onChange={e => set("nationality", e.target.value)}
            options={NATIONALITY_OPTIONS} placeholder="Select country…" />
          <Select label="Language" value={form.language}
            onChange={e => set("language", e.target.value)}
            options={LANG_OPTIONS} placeholder="Select language…" />
        </div>
      </FieldSet>

      <FieldSet title="Classification">
        <div className="grid grid-cols-2 gap-4">
          <Select label="Client Class" value={form.clientClass}
            onChange={e => set("clientClass", e.target.value)} options={CLASS_OPTIONS} />
          <Select label="Pipeline Stage" value={form.stage}
            onChange={e => set("stage", e.target.value)} options={STAGE_OPTIONS} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Select label="Price Group" value={form.priceGroup}
            onChange={e => set("priceGroup", e.target.value)}
            options={PRICE_OPTIONS} placeholder="Select group…" />
          <Select label="Assigned Agent" value={form.primaryAgent}
            onChange={e => set("primaryAgent", e.target.value)}
            options={AGENT_OPTIONS} placeholder="Select agent…" />
        </div>
      </FieldSet>

      <FieldSet title="Budget">
        <div className="grid grid-cols-2 gap-4">
          <Input label="Budget Min (€)" type="number" placeholder="500000" value={form.budgetMin}
            onChange={e => set("budgetMin", e.target.value)} hint="Minimum in euros" />
          <Input label="Budget Max (€)" type="number" placeholder="1500000" value={form.budgetMax}
            onChange={e => set("budgetMax", e.target.value)} hint="Maximum in euros" />
        </div>
      </FieldSet>

      <FieldSet title="Property Interest">
        <TypeChipGroup
          label="Property Type"
          options={PROPERTY_TYPE_OPTIONS}
          selected={propertyTypes}
          onToggle={v => toggleList(setPropertyTypes, v)}
        />

        <ChipGroup
          label="Preferred Locations"
          options={LOCATION_OPTIONS}
          selected={locations}
          onToggle={v => toggleList(setLocations, v)}
        />

        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Bedrooms Min"
            value={bedroomsMin}
            onChange={e => setBedroomsMin(e.target.value)}
            options={BEDROOM_OPTIONS}
          />
          <Select
            label="Bedrooms Max"
            value={bedroomsMax}
            onChange={e => setBedroomsMax(e.target.value)}
            options={BEDROOM_OPTIONS}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <span className="text-[11px] font-semibold uppercase tracking-widest text-warm-700">Swimming Pool</span>
          <div className="flex gap-2">
            {(["any", "yes", "no"] as const).map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => setPool(opt)}
                className={`px-4 py-1.5 rounded-full text-xs font-medium border transition-all ${
                  pool === opt
                    ? "bg-[#B8960C] border-[#B8960C] text-white shadow-sm"
                    : "bg-white border-warm-300 text-warm-700 hover:border-[#B8960C] hover:text-[#B8960C]"
                }`}
              >
                {opt === "any" ? "Any" : opt === "yes" ? "Required" : "Not needed"}
              </button>
            ))}
          </div>
        </div>

        <ChipGroup
          label="View"
          options={VIEW_OPTIONS}
          selected={views}
          onToggle={v => toggleList(setViews, v)}
        />

        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-semibold uppercase tracking-widest text-warm-700">Additional Notes</label>
          <textarea
            rows={2}
            placeholder="Any other requirements or preferences…"
            value={form.propertyNotes}
            onChange={e => set("propertyNotes", e.target.value)}
            className="w-full bg-white text-warm-900 placeholder:text-warm-400 rounded border border-warm-300 py-2.5 px-3.5 text-sm resize-none outline-none transition-all focus:border-[#B8960C] focus:ring-2 focus:ring-[#B8960C]/20"
          />
        </div>
      </FieldSet>

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-100">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={busy}>Cancel</Button>
        <Button type="submit" isLoading={busy}>Add Client</Button>
      </div>
    </form>
  );
}
