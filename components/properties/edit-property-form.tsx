"use client";

import { useState, useRef } from "react";
import type {
  Property, PropertyType, PropertyStatus, PropertyCondition,
  EnergyClass, ContractType, PropertyUsage, MarketingMethod,
} from "@/types";
import { HEATING_OPTIONS, FEATURE_OPTIONS } from "@/lib/constants";
import { AreaSelect } from "@/components/properties/area-select";

interface Props {
  property: Property;
  onSuccess: (updated: Property) => void;
  onCancel: () => void;
}

const TYPE_OPTIONS: { value: PropertyType; label: string }[] = [
  { value: "villa",              label: "Villa"               },
  { value: "apartment",         label: "Apartment"           },
  { value: "house",             label: "House"               },
  { value: "plot",              label: "Plot"                },
  { value: "investment",        label: "Investment"          },
  { value: "renovation_project",label: "Renovation Project"  },
  { value: "new_project",       label: "New Project"         },
  { value: "opportunity",       label: "Opportunity"         },
];

const STATUS_OPTIONS: { value: PropertyStatus; label: string }[] = [
  { value: "available",   label: "Available"   },
  { value: "under_offer", label: "Under Offer" },
  { value: "sold",        label: "Sold"        },
];

const CONDITION_OPTIONS: { value: PropertyCondition; label: string }[] = [
  { value: "planned",           label: "Planned"           },
  { value: "in_good_condition", label: "In Good Condition" },
  { value: "needs_renovation",  label: "Needs Renovation"  },
  { value: "under_construction",label: "Under Construction"},
];

const ENERGY_CLASS_OPTIONS: { value: EnergyClass; label: string }[] = [
  { value: "A+", label: "A+" }, { value: "A", label: "A" }, { value: "B", label: "B" },
  { value: "C",  label: "C"  }, { value: "D", label: "D" }, { value: "E", label: "E" },
  { value: "F",  label: "F"  }, { value: "G", label: "G" }, { value: "exempt", label: "Exempt" },
];

const CONTRACT_OPTIONS: { value: ContractType; label: string }[] = [
  { value: "exclusive", label: "Exclusive" },
  { value: "open",      label: "Open"      },
];

const USAGE_OPTIONS: { value: PropertyUsage; label: string }[] = [
  { value: "residential", label: "Residential" },
  { value: "commercial",  label: "Commercial"  },
];

const MARKETING_OPTIONS: { value: MarketingMethod; label: string }[] = [
  { value: "sale",         label: "For Sale"       },
  { value: "rent",         label: "For Rent"       },
  { value: "sale_or_rent", label: "Sale or Rent"   },
];

const AGENT_OPTIONS = [
  { value: "errikos", label: "Errikos Kohls"     },
  { value: "klaus",   label: "Klaus Weber"       },
  { value: "anna",    label: "Anna Papadopoulos" },
];


function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[11px] font-semibold uppercase tracking-wider text-stone-400">{label}</label>
      {children}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <p className="font-serif text-base font-bold text-stone-800 mb-3">{children}</p>;
}

const inputCls = "h-10 w-full rounded-lg border border-stone-200 bg-white px-3 text-sm text-stone-800 outline-none focus:border-[#B8960C] focus:ring-2 focus:ring-[#B8960C]/20 transition-all";
const selectCls = inputCls + " appearance-none cursor-pointer";
const textareaCls = "w-full rounded-lg border border-stone-200 bg-white px-3 py-2.5 text-sm text-stone-800 outline-none focus:border-[#B8960C] focus:ring-2 focus:ring-[#B8960C]/20 transition-all resize-none";

export function EditPropertyForm({ property, onSuccess, onCancel }: Props) {
  const [form, setForm] = useState({
    // Titles
    titleEn: property.title.en ?? "",
    titleDe: property.title.de ?? "",
    titleFr: property.title.fr ?? "",
    titleEl: property.title.el ?? "",
    // Admin
    agentId:              property.agentId ?? "errikos",
    coAgentIds:           property.coAgentIds ?? [] as string[],
    ownershipGroup:       property.ownershipGroup ?? "",
    recordingResponsible: property.recordingResponsible ?? "",
    displayOnWebsite:     property.displayOnWebsite ?? false,
    disabled:             property.disabled ?? false,
    keysAvailable:        property.keysAvailable ?? false,
    // Classification
    type:            property.type,
    status:          property.status,
    usage:           property.usage ?? "residential",
    marketingMethod: property.marketingMethod ?? "sale",
    contractType:    property.contractType ?? "exclusive",
    // Location
    area:         property.area,
    island:       property.island ?? "Paros",
    country:      property.country ?? "Greece",
    scoutRegion:  property.scoutRegion ?? "",
    address:      property.address ?? "",
    postalCode:   property.postalCode ?? "",
    coordinates:  property.lat && property.lng ? `${property.lat}, ${property.lng}` : "",
    // Financial
    askingPrice:       String(property.askingPrice),
    buyerCommission:   String(property.buyerCommission ?? ""),
    sellerCommission:  String(property.sellerCommission ?? ""),
    // Physical
    bedrooms:          String(property.bedrooms),
    bathrooms:         String(property.bathrooms),
    rooms:             String(property.rooms ?? ""),
    floors:            String(property.floors ?? ""),
    buildArea:         String(property.buildArea),
    buildableArea:     String(property.buildableArea ?? ""),
    plotArea:          String(property.plotArea ?? ""),
    balconies:         String(property.balconies ?? ""),
    terraces:          String(property.terraces ?? ""),
    yearOfConstruction:String(property.yearOfConstruction ?? ""),
    condition:         property.condition ?? "",
    energyClass:       property.energyClass ?? "",
    distanceFromSea:   String(property.distanceFromSea ?? ""),
    // Toggles
    seafront: property.seafront,
    seaView:  property.seaView,
    pool:     property.pool,
    // Multi-select
    heatingTypes: property.heatingTypes ?? [] as string[],
    features:     property.features ?? [] as string[],
    // Notes
    description: property.description ?? "",
    comments: property.comments ?? "",
  });

  const DEFAULT_CHECKLIST = [
    "KAEK (Property Identifier)",
    "Energy Performance Certificate",
    "ENFIA (Property Tax Clearance)",
    "Building Permits",
    "Title Search Complete",
    "Notary Appointed",
  ];

  const [checklist, setChecklist] = useState<{ label: string; checked: boolean }[]>(
    property.legalChecklist ?? DEFAULT_CHECKLIST.map(label => ({ label, checked: false }))
  );
  const [newItem, setNewItem] = useState("");
  const newItemRef = useRef<HTMLInputElement>(null);

  const set = (k: keyof typeof form, v: string | boolean | string[]) =>
    setForm(p => ({ ...p, [k]: v }));

  const toggleList = (k: "heatingTypes" | "features", val: string) => {
    setForm(p => {
      const list = p[k] as string[];
      return { ...p, [k]: list.includes(val) ? list.filter(x => x !== val) : [...list, val] };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: Property = {
      ...property,
      title: {
        ...property.title,
        en: form.titleEn,
        de: form.titleDe,
        fr: form.titleFr,
        el: form.titleEl,
      },
      agentId:              form.agentId,
      coAgentIds:           form.coAgentIds.length ? form.coAgentIds : undefined,
      ownershipGroup:       form.ownershipGroup || undefined,
      recordingResponsible: form.recordingResponsible || undefined,
      displayOnWebsite:     form.displayOnWebsite,
      disabled:             form.disabled,
      keysAvailable:        form.keysAvailable,
      type:            form.type as PropertyType,
      status:          form.status as PropertyStatus,
      usage:           form.usage as PropertyUsage,
      marketingMethod: form.marketingMethod as MarketingMethod,
      contractType:    form.contractType as ContractType,
      area:            form.area,
      island:          form.island || undefined,
      country:         form.country || undefined,
      scoutRegion:     form.scoutRegion || undefined,
      address:         form.address || undefined,
      postalCode:      form.postalCode || undefined,
      ...(() => {
        const parts = form.coordinates.split(",").map(s => s.trim());
        const lat = parts[0] ? Number(parts[0]) : undefined;
        const lng = parts[1] ? Number(parts[1]) : undefined;
        return { lat: lat && !isNaN(lat) ? lat : undefined, lng: lng && !isNaN(lng) ? lng : undefined };
      })(),
      askingPrice:      Number(form.askingPrice),
      buyerCommission:  form.buyerCommission ? Number(form.buyerCommission) : undefined,
      sellerCommission: form.sellerCommission ? Number(form.sellerCommission) : undefined,
      bedrooms:   Number(form.bedrooms),
      bathrooms:  Number(form.bathrooms),
      rooms:      form.rooms ? Number(form.rooms) : undefined,
      floors:     form.floors ? Number(form.floors) : undefined,
      buildArea:  Number(form.buildArea),
      buildableArea: form.buildableArea ? Number(form.buildableArea) : undefined,
      plotArea:   form.plotArea ? Number(form.plotArea) : undefined,
      balconies:  form.balconies ? Number(form.balconies) : undefined,
      terraces:   form.terraces ? Number(form.terraces) : undefined,
      yearOfConstruction: form.yearOfConstruction ? Number(form.yearOfConstruction) : undefined,
      condition:   form.condition ? form.condition as PropertyCondition : undefined,
      energyClass: form.energyClass ? form.energyClass as EnergyClass : undefined,
      distanceFromSea: form.distanceFromSea ? Number(form.distanceFromSea) : undefined,
      seafront: form.seafront,
      seaView:  form.seaView,
      pool:     form.pool,
      heatingTypes: form.heatingTypes.length ? form.heatingTypes : undefined,
      features:     form.features.length ? form.features : undefined,
      description:    form.description || undefined,
      comments:       form.comments || undefined,
      legalChecklist: checklist.length ? checklist : undefined,
    };
    onSuccess(updated);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">

      {/* Titles */}
      <div>
        <SectionTitle>Title</SectionTitle>
        <div className="grid grid-cols-2 gap-3">
          <Field label="English">
            <input className={inputCls} value={form.titleEn} onChange={e => set("titleEn", e.target.value)} placeholder="Title in English" required />
          </Field>
          <Field label="German">
            <input className={inputCls} value={form.titleDe} onChange={e => set("titleDe", e.target.value)} placeholder="Title in German" />
          </Field>
          <Field label="French">
            <input className={inputCls} value={form.titleFr} onChange={e => set("titleFr", e.target.value)} placeholder="Title in French" />
          </Field>
          <Field label="Greek">
            <input className={inputCls} value={form.titleEl} onChange={e => set("titleEl", e.target.value)} placeholder="Title in Greek" />
          </Field>
        </div>
      </div>

      {/* Classification */}
      <div>
        <SectionTitle>Classification</SectionTitle>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <Field label="Type">
            <select className={selectCls} value={form.type} onChange={e => set("type", e.target.value)}>
              {TYPE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </Field>
          <Field label="Status">
            <select className={selectCls} value={form.status} onChange={e => set("status", e.target.value)}>
              {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </Field>
          <Field label="Usage">
            <select className={selectCls} value={form.usage} onChange={e => set("usage", e.target.value)}>
              {USAGE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </Field>
          <Field label="Marketing Method">
            <select className={selectCls} value={form.marketingMethod} onChange={e => set("marketingMethod", e.target.value)}>
              {MARKETING_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </Field>
          <Field label="Contract Type">
            <select className={selectCls} value={form.contractType} onChange={e => set("contractType", e.target.value)}>
              {CONTRACT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </Field>
          <Field label="Lead Agent">
            <select className={selectCls} value={form.agentId} onChange={e => set("agentId", e.target.value)}>
              {AGENT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </Field>
        </div>
        {/* Co-agents */}
        <div className="mt-3">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-stone-400 mb-2">Co-Agents</p>
          <div className="flex flex-wrap gap-2">
            {AGENT_OPTIONS.filter(o => o.value !== form.agentId).map(o => {
              const checked = form.coAgentIds.includes(o.value);
              return (
                <label key={o.value} className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm cursor-pointer select-none transition-colors ${checked ? "bg-[#B8960C] border-[#B8960C] text-white" : "border-stone-200 text-stone-600 hover:border-[#B8960C] hover:text-[#B8960C]"}`}>
                  <input type="checkbox" className="sr-only" checked={checked}
                    onChange={() => {
                      const list = form.coAgentIds;
                      set("coAgentIds", checked ? list.filter(x => x !== o.value) : [...list, o.value]);
                    }} />
                  {o.label}
                </label>
              );
            })}
          </div>
        </div>
      </div>

      {/* Location */}
      <div>
        <SectionTitle>Location</SectionTitle>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <Field label="Area / Location">
            <AreaSelect value={form.area} onChange={v => set("area", v)} inputClassName={selectCls} />
          </Field>
          <Field label="Island">
            <input className={inputCls} value={form.island} onChange={e => set("island", e.target.value)} placeholder="Paros" />
          </Field>
          <Field label="Country">
            <input className={inputCls} value={form.country} onChange={e => set("country", e.target.value)} placeholder="Greece" />
          </Field>
          <Field label="Scout Region">
            <input className={inputCls} value={form.scoutRegion} onChange={e => set("scoutRegion", e.target.value)} placeholder="e.g. North Paros" />
          </Field>
          <Field label="Address">
            <input className={inputCls} value={form.address} onChange={e => set("address", e.target.value)} placeholder="Street address" />
          </Field>
          <Field label="Postal Code">
            <input className={inputCls} value={form.postalCode} onChange={e => set("postalCode", e.target.value)} placeholder="84400" />
          </Field>
          <Field label="GPS Coordinates">
            <input
              className={inputCls}
              value={form.coordinates}
              onChange={e => set("coordinates", e.target.value)}
              placeholder="37.134650, 25.277144"
            />
          </Field>
        </div>
      </div>

      {/* Financial */}
      <div>
        <SectionTitle>Financial</SectionTitle>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <Field label="Asking Price (€)">
            <input type="number" className={inputCls} value={form.askingPrice} onChange={e => set("askingPrice", e.target.value)} min={0} required />
          </Field>
          <Field label="Buyer Commission (%)">
            <input type="number" className={inputCls} value={form.buyerCommission} onChange={e => set("buyerCommission", e.target.value)} min={0} max={100} step={0.1} placeholder="—" />
          </Field>
          <Field label="Seller Commission (%)">
            <input type="number" className={inputCls} value={form.sellerCommission} onChange={e => set("sellerCommission", e.target.value)} min={0} max={100} step={0.1} placeholder="—" />
          </Field>
        </div>
      </div>

      {/* Physical */}
      <div>
        <SectionTitle>Size & Structure</SectionTitle>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Field label="Bedrooms">
            <input type="number" className={inputCls} value={form.bedrooms} onChange={e => set("bedrooms", e.target.value)} min={0} />
          </Field>
          <Field label="Bathrooms">
            <input type="number" className={inputCls} value={form.bathrooms} onChange={e => set("bathrooms", e.target.value)} min={0} />
          </Field>
          <Field label="Rooms (total)">
            <input type="number" className={inputCls} value={form.rooms} onChange={e => set("rooms", e.target.value)} min={0} placeholder="—" />
          </Field>
          <Field label="Floors">
            <input type="number" className={inputCls} value={form.floors} onChange={e => set("floors", e.target.value)} min={0} placeholder="—" />
          </Field>
          <Field label="Build Area (m²)">
            <input type="number" className={inputCls} value={form.buildArea} onChange={e => set("buildArea", e.target.value)} min={0} />
          </Field>
          <Field label="Buildable (m²)">
            <input type="number" className={inputCls} value={form.buildableArea} onChange={e => set("buildableArea", e.target.value)} min={0} placeholder="—" />
          </Field>
          <Field label="Plot Area (m²)">
            <input type="number" className={inputCls} value={form.plotArea} onChange={e => set("plotArea", e.target.value)} min={0} placeholder="—" />
          </Field>
          <Field label="Balconies">
            <input type="number" className={inputCls} value={form.balconies} onChange={e => set("balconies", e.target.value)} min={0} placeholder="—" />
          </Field>
          <Field label="Terraces">
            <input type="number" className={inputCls} value={form.terraces} onChange={e => set("terraces", e.target.value)} min={0} placeholder="—" />
          </Field>
          <Field label="Year Built">
            <input type="number" className={inputCls} value={form.yearOfConstruction} onChange={e => set("yearOfConstruction", e.target.value)} min={1800} max={2030} placeholder="—" />
          </Field>
          <Field label="Distance from Sea (m)">
            <input type="number" className={inputCls} value={form.distanceFromSea} onChange={e => set("distanceFromSea", e.target.value)} min={0} placeholder="—" />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3 mt-3">
          <Field label="Condition">
            <select className={selectCls} value={form.condition} onChange={e => set("condition", e.target.value)}>
              <option value="">— Select —</option>
              {CONDITION_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </Field>
          <Field label="Energy Class">
            <select className={selectCls} value={form.energyClass} onChange={e => set("energyClass", e.target.value)}>
              <option value="">— Select —</option>
              {ENERGY_CLASS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </Field>
        </div>
      </div>

      {/* Heating */}
      <div>
        <SectionTitle>Heating Types</SectionTitle>
        <div className="flex flex-wrap gap-2">
          {HEATING_OPTIONS.map(h => (
            <label key={h} className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm cursor-pointer select-none transition-colors ${form.heatingTypes.includes(h) ? "bg-[#B8960C] border-[#B8960C] text-white" : "border-stone-200 text-stone-600 hover:border-[#B8960C] hover:text-[#B8960C]"}`}>
              <input type="checkbox" className="sr-only" checked={form.heatingTypes.includes(h)} onChange={() => toggleList("heatingTypes", h)} />
              {h}
            </label>
          ))}
        </div>
      </div>

      {/* Features */}
      <div>
        <SectionTitle>Features</SectionTitle>
        <div className="flex flex-wrap gap-2 mb-3">
          {FEATURE_OPTIONS.map(f => (
            <label key={f} className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm cursor-pointer select-none transition-colors ${form.features.includes(f) ? "bg-[#B8960C] border-[#B8960C] text-white" : "border-stone-200 text-stone-600 hover:border-[#B8960C] hover:text-[#B8960C]"}`}>
              <input type="checkbox" className="sr-only" checked={form.features.includes(f)} onChange={() => toggleList("features", f)} />
              {f}
            </label>
          ))}
        </div>
        {/* Legacy boolean fields still tracked */}
        <div className="flex flex-wrap gap-4 pt-2 border-t border-stone-100">
          {([["seafront", "Seafront"], ["seaView", "Sea View"], ["pool", "Pool"]] as const).map(([key, label]) => (
            <label key={key} className="flex items-center gap-2 cursor-pointer select-none">
              <input type="checkbox" checked={form[key] as boolean} onChange={e => set(key, e.target.checked)}
                className="h-4 w-4 rounded border-stone-300 accent-[#B8960C]" />
              <span className="text-sm text-stone-700 font-medium">{label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Admin toggles */}
      <div>
        <SectionTitle>Admin</SectionTitle>
        <div className="grid grid-cols-2 gap-3 mb-3">
          <Field label="Ownership Group">
            <input className={inputCls} value={form.ownershipGroup} onChange={e => set("ownershipGroup", e.target.value)} placeholder="e.g. Kohls Family Trust" />
          </Field>
          <Field label="Recording Responsible">
            <input className={inputCls} value={form.recordingResponsible} onChange={e => set("recordingResponsible", e.target.value)} placeholder="Name or ID" />
          </Field>
        </div>
        <div className="flex flex-wrap gap-4">
          {([
            ["displayOnWebsite", "Display on Website"],
            ["keysAvailable",    "Keys Available"],
            ["disabled",         "Disabled / Hidden"],
          ] as const).map(([key, label]) => (
            <label key={key} className="flex items-center gap-2 cursor-pointer select-none">
              <input type="checkbox" checked={form[key] as boolean} onChange={e => set(key, e.target.checked)}
                className="h-4 w-4 rounded border-stone-300 accent-[#B8960C]" />
              <span className="text-sm text-stone-700 font-medium">{label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Description */}
      <div>
        <SectionTitle>Description</SectionTitle>
        <textarea
          className={textareaCls}
          rows={5}
          value={form.description}
          onChange={e => set("description", e.target.value)}
          placeholder="Public-facing property description…"
        />
      </div>

      {/* Comments */}
      <div>
        <SectionTitle>Comments / Notes</SectionTitle>
        <textarea
          className={textareaCls}
          rows={4}
          value={form.comments}
          onChange={e => set("comments", e.target.value)}
          placeholder="Internal notes, remarks, agent comments…"
        />
      </div>

      {/* Legal Checklist */}
      <div>
        <SectionTitle>Legal Checklist</SectionTitle>
        <div className="space-y-1 mb-3">
          {checklist.map((item, idx) => (
            <div key={idx} className="flex items-center gap-3 group py-1">
              <input
                type="checkbox"
                checked={item.checked}
                onChange={e => setChecklist(prev => prev.map((it, i) => i === idx ? { ...it, checked: e.target.checked } : it))}
                className="h-4 w-4 rounded border-stone-300 accent-[#B8960C] shrink-0 cursor-pointer"
              />
              <span className={`text-sm flex-1 ${item.checked ? "line-through text-stone-400" : "text-stone-700"}`}>{item.label}</span>
              <button
                type="button"
                onClick={() => setChecklist(prev => prev.filter((_, i) => i !== idx))}
                className="opacity-0 group-hover:opacity-100 text-stone-300 hover:text-red-400 transition-all text-lg leading-none"
              >×</button>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            ref={newItemRef}
            type="text"
            value={newItem}
            onChange={e => setNewItem(e.target.value)}
            onKeyDown={e => {
              if (e.key === "Enter") {
                e.preventDefault();
                const trimmed = newItem.trim();
                if (trimmed) {
                  setChecklist(prev => [...prev, { label: trimmed, checked: false }]);
                  setNewItem("");
                }
              }
            }}
            placeholder="Add checklist item…"
            className={inputCls + " flex-1"}
          />
          <button
            type="button"
            onClick={() => {
              const trimmed = newItem.trim();
              if (trimmed) {
                setChecklist(prev => [...prev, { label: trimmed, checked: false }]);
                setNewItem("");
                newItemRef.current?.focus();
              }
            }}
            className="h-10 px-4 rounded-lg border border-stone-200 text-sm font-medium text-stone-600 hover:border-[#B8960C] hover:text-[#B8960C] transition-colors"
          >
            Add
          </button>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2 border-t border-stone-100">
        <button type="button" onClick={onCancel}
          className="flex-1 h-10 rounded-lg border border-stone-200 text-sm font-medium text-stone-600 hover:bg-stone-50 transition-colors">
          Cancel
        </button>
        <button type="submit"
          className="flex-1 h-10 rounded-lg bg-[#B8960C] text-white text-sm font-semibold hover:bg-[#9e7f0a] transition-colors shadow-sm">
          Save Changes
        </button>
      </div>
    </form>
  );
}
