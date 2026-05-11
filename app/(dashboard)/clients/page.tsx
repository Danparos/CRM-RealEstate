"use client";
import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Plus, Search, X, SlidersHorizontal, ChevronDown, ChevronUp } from "lucide-react";
import { getAllClients } from "@/lib/db/clients";
import { ClientCard } from "@/components/clients/client-card";
import type { Client, ClientClass, PriceGroup } from "@/types";

const VALID: ClientClass[] = ["A", "B", "C"];
const CLASS_LABEL: Record<ClientClass, string> = { A: "Hot", B: "Warm", C: "Cold" };

const STAGE_OPTIONS = [
  { value: "new_inquiry",           label: "New Inquiry" },
  { value: "qualified",             label: "Qualified" },
  { value: "property_presentation", label: "Property Presentation" },
  { value: "offer_submitted",       label: "Offer Submitted" },
  { value: "negotiation",           label: "Negotiation" },
  { value: "legal_process",         label: "Legal Process" },
  { value: "signed_closed",         label: "Signed & Closed" },
];

const PRICE_OPTIONS = [
  { value: "entry",   label: "Entry · up to €300K" },
  { value: "mid",     label: "Mid · €300K–€750K" },
  { value: "premium", label: "Premium · €750K–€1.5M" },
  { value: "luxury",  label: "Luxury · €1.5M–€5M" },
  { value: "ultra",   label: "Ultra · €5M+" },
];

const AGENT_OPTIONS = [
  { value: "Dan Paul",     label: "Dan Paul" },
  { value: "Klaus Weber",       label: "Klaus Weber" },
  { value: "Anna Papadopoulos", label: "Anna Papadopoulos" },
];

const LOOKING_FOR_GROUPS = [
  {
    label: "Property Type",
    options: ["Villa", "Cycladic", "House", "Apartment", "Maisonette", "Studio", "Land / Plot", "Hotel / B&B"],
  },
  {
    label: "Location",
    options: ["Naoussa", "Parikia", "Lefkes", "Alyki", "Golden Beach", "Marpissa", "Santa Maria", "Kolymbithres", "Prodromos", "Ambelas", "Kamares", "Piso Livadi"],
  },
  {
    label: "Features",
    options: ["Pool", "Sea View", "Seafront", "Sunset View", "Garden View", "Mountain / Valley", "Village View", "Panoramic"],
  },
];

interface Filters {
  clientClass: ClientClass | "";
  stage: string;
  priceGroup: PriceGroup | "";
  agent: string;
  lookingFor: string[];
}

const EMPTY_FILTERS: Filters = {
  clientClass: "", stage: "", priceGroup: "", agent: "", lookingFor: [],
};

function FilterSelect({ label, value, onChange, options }: {
  label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[];
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[10px] font-semibold uppercase tracking-wider text-stone-400">{label}</span>
      <div className="relative">
        <select
          value={value}
          onChange={e => onChange(e.target.value)}
          className={`w-full h-9 pl-3 pr-8 rounded-lg border text-sm outline-none transition-all appearance-none cursor-pointer ${
            value
              ? "border-[#B8960C] bg-[#fdf9ec] text-[#7a6008] font-medium"
              : "border-stone-200 bg-white text-stone-600 hover:border-stone-300"
          } focus:border-[#B8960C] focus:ring-2 focus:ring-[#B8960C]/20`}
        >
          <option value="">Any</option>
          {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-stone-400 pointer-events-none" />
      </div>
    </div>
  );
}

function LookingForSelect({ selected, onChange }: {
  selected: string[]; onChange: (v: string[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const toggle = (v: string) =>
    onChange(selected.includes(v) ? selected.filter(x => x !== v) : [...selected, v]);

  const label = selected.length === 0
    ? "Any"
    : selected.length === 1
    ? selected[0]
    : `${selected.length} selected`;

  return (
    <div className="flex flex-col gap-1 col-span-2 sm:col-span-3 lg:col-span-4" ref={ref}>
      <span className="text-[10px] font-semibold uppercase tracking-wider text-stone-400">Looking For</span>
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen(p => !p)}
          className={`w-full h-9 pl-3 pr-8 rounded-lg border text-sm text-left transition-all ${
            selected.length > 0
              ? "border-[#B8960C] bg-[#fdf9ec] text-[#7a6008] font-medium"
              : "border-stone-200 bg-white text-stone-500 hover:border-stone-300"
          } focus:outline-none focus:border-[#B8960C] focus:ring-2 focus:ring-[#B8960C]/20`}
        >
          {label}
        </button>
        {open ? (
          <ChevronUp className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-stone-400 pointer-events-none" />
        ) : (
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-stone-400 pointer-events-none" />
        )}

        {open && (
          <div className="absolute z-30 top-full mt-1 left-0 right-0 bg-white border border-stone-200 rounded-xl shadow-lg p-4 space-y-4 min-w-[340px]">
            {LOOKING_FOR_GROUPS.map(group => (
              <div key={group.label}>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-400 mb-2">{group.label}</p>
                <div className="flex flex-wrap gap-1.5">
                  {group.options.map(opt => {
                    const active = selected.includes(opt);
                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => toggle(opt)}
                        className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${
                          active
                            ? "bg-[#B8960C] border-[#B8960C] text-white shadow-sm"
                            : "bg-white border-stone-200 text-stone-600 hover:border-[#B8960C] hover:text-[#B8960C]"
                        }`}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
            {selected.length > 0 && (
              <div className="pt-2 border-t border-stone-100 flex justify-between items-center">
                <span className="text-xs text-stone-400">{selected.length} selected</span>
                <button onClick={() => onChange([])} className="text-xs text-[#B8960C] hover:underline">Clear</button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function matchesSearch(c: Client, q: string): boolean {
  if (!q) return true;
  const lower = q.toLowerCase();
  return (
    `${c.firstName} ${c.lastName}`.toLowerCase().includes(lower) ||
    (c.email?.toLowerCase().includes(lower) ?? false) ||
    (c.phone?.includes(q) ?? false) ||
    (c.propertyInterest?.toLowerCase().includes(lower) ?? false)
  );
}

function matchesLookingFor(c: Client, lookingFor: string[]): boolean {
  if (!lookingFor.length) return true;
  const interest = (c.propertyInterest ?? "").toLowerCase();
  return lookingFor.some(kw => interest.includes(kw.toLowerCase()));
}

function applyFilters(clients: Client[], f: Filters): Client[] {
  return clients.filter(c => {
    if (f.clientClass && c.clientClass !== f.clientClass) return false;
    if (f.stage && c.stage !== f.stage) return false;
    if (f.priceGroup && c.priceGroup !== f.priceGroup) return false;
    if (f.agent && c.primaryAgent !== f.agent) return false;
    if (!matchesLookingFor(c, f.lookingFor)) return false;
    return true;
  });
}

function Chip({ label, onRemove }: { label: string | undefined; onRemove: () => void }) {
  if (!label) return null;
  return (
    <span className="inline-flex items-center gap-1 pl-2.5 pr-1.5 py-1 rounded-full bg-[#fdf9ec] border border-[#B8960C]/30 text-[11px] font-medium text-[#7a6008]">
      {label}
      <button onClick={onRemove} className="h-4 w-4 flex items-center justify-center rounded-full hover:bg-[#B8960C]/20 transition-colors">
        <X className="h-2.5 w-2.5" />
      </button>
    </span>
  );
}

function Inner() {
  const sp = useSearchParams();

  const [allClientsRaw, setAllClientsRaw] = useState<Client[]>([]);
  const [loading,       setLoading]       = useState(true);
  const [query,         setQuery]         = useState("");
  const [showPanel,     setShowPanel]     = useState(false);
  const [filters,       setFilters]       = useState<Filters>(() => ({
    ...EMPTY_FILTERS,
    clientClass: (VALID.includes(sp.get("class") as ClientClass) ? sp.get("class") as ClientClass : "") as ClientClass | "",
    stage: sp.get("stage") ?? "",
  }));

  const showArchived = sp.get("status") === "archived";

  useEffect(() => {
    getAllClients()
      .then(setAllClientsRaw)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const cls = VALID.includes(sp.get("class") as ClientClass) ? sp.get("class") as ClientClass : "";
    const stg = sp.get("stage") ?? "";
    setFilters(p => ({ ...p, clientClass: cls as ClientClass | "", stage: stg }));
  }, [sp]);

  const setFilter = <K extends keyof Filters>(k: K, v: Filters[K]) =>
    setFilters(p => ({ ...p, [k]: v }));

  const clearAll = () => { setFilters(EMPTY_FILTERS); setQuery(""); };

  const allClients = allClientsRaw;
  const scopedClients = showArchived
    ? allClients.filter(c => c.archived)
    : allClients.filter(c => !c.archived);
  const afterFilters = applyFilters(scopedClients, filters);
  const results = afterFilters
    .filter(c => matchesSearch(c, query.trim()))
    .sort((a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime());

  const scalarActive = [filters.clientClass, filters.stage, filters.priceGroup, filters.agent].filter(Boolean).length;
  const activeCount  = scalarActive + filters.lookingFor.length + (query.trim() ? 1 : 0);

  const buildSubtitle = () => {
    const parts: string[] = [];
    if (filters.clientClass) parts.push(CLASS_LABEL[filters.clientClass]);
    if (filters.stage) parts.push(STAGE_OPTIONS.find(s => s.value === filters.stage)?.label ?? "");
    if (filters.priceGroup) parts.push(PRICE_OPTIONS.find(p => p.value === filters.priceGroup)?.label.split(" · ")[0] ?? "");
    if (filters.agent) parts.push(filters.agent.split(" ")[0]);
    if (filters.lookingFor.length) parts.push(filters.lookingFor.join(", "));
    if (query.trim()) parts.push(`"${query.trim()}"`);
    return `${results.length} client${results.length !== 1 ? "s" : ""}${parts.length ? " · " + parts.join(", ") : " total"}`;
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-end justify-between gap-4 pb-2 border-b border-stone-100">
        <div>
          <h1 className="font-serif text-[36px] font-semibold leading-none tracking-wide text-stone-900">
            {showArchived ? (
              <>Clients <span className="text-stone-300 mx-3 font-light">/</span> <span className="text-[#B8960C]">Archived</span></>
            ) : filters.clientClass ? (
              <>Clients <span className="text-stone-300 mx-3 font-light">/</span> <span className="text-[#B8960C]">{filters.clientClass === "A" ? "Hot" : filters.clientClass === "B" ? "Warm" : "Cold"}</span></>
            ) : (
              "Clients"
            )}
          </h1>
          <p className="mt-2 text-[13px] uppercase tracking-[0.2em] text-stone-400 font-medium">
            {showArchived ? "Archived client records" : "Client base & lead management"}
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <div className="rounded-xl border border-stone-200 bg-white px-4 py-2.5 shadow-sm">
            <p className="text-[10px] uppercase tracking-wider font-semibold text-stone-400 mb-0.5">Showing</p>
            <p className="text-lg font-bold leading-none text-stone-700">{results.length}</p>
          </div>
          <Link href="/clients/new" className="inline-flex items-center gap-1.5 px-4 h-10 rounded-md text-sm font-medium bg-[#B8960C] text-white shadow-sm hover:bg-[#9e7f0a] transition-colors whitespace-nowrap">
            <Plus className="h-4 w-4 shrink-0" />
            New Client
          </Link>
        </div>
      </div>

      {/* Search + filter toggle */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400 pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search by name, email, phone, property notes…"
            className="w-full h-10 pl-10 pr-10 rounded-lg border border-stone-200 bg-white text-sm text-stone-800 placeholder:text-stone-400 outline-none transition-all focus:border-[#B8960C] focus:ring-2 focus:ring-[#B8960C]/20 shadow-sm"
          />
          {query && (
            <button onClick={() => setQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 flex items-center justify-center rounded-full text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-colors">
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        <button
          onClick={() => setShowPanel(p => !p)}
          className={`inline-flex items-center gap-2 px-4 h-10 rounded-lg border text-sm font-medium transition-all shadow-sm ${
            showPanel || activeCount > 0
              ? "bg-[#B8960C] border-[#B8960C] text-white"
              : "bg-white border-stone-200 text-stone-600 hover:border-stone-300"
          }`}
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters
          {activeCount > 0 && (
            <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-white/25 text-white text-[10px] font-bold">
              {activeCount}
            </span>
          )}
        </button>
        {activeCount > 0 && (
          <button onClick={clearAll}
            className="inline-flex items-center gap-1.5 px-3 h-10 rounded-lg border border-stone-200 bg-white text-sm text-stone-500 hover:text-stone-700 hover:border-stone-300 transition-colors shadow-sm">
            <X className="h-3.5 w-3.5" />
            Clear
          </button>
        )}
      </div>

      {/* Filter panel */}
      {showPanel && (
        <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-4 space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-8 gap-3 items-end">
            <FilterSelect
              label="Class"
              value={filters.clientClass}
              onChange={v => setFilter("clientClass", v as ClientClass | "")}
              options={[{ value: "A", label: "Hot" }, { value: "B", label: "Warm" }, { value: "C", label: "Cold" }]}
            />
            <FilterSelect
              label="Stage"
              value={filters.stage}
              onChange={v => setFilter("stage", v)}
              options={STAGE_OPTIONS}
            />
            <FilterSelect
              label="Price Group"
              value={filters.priceGroup}
              onChange={v => setFilter("priceGroup", v as PriceGroup | "")}
              options={PRICE_OPTIONS}
            />
            <FilterSelect
              label="Agent"
              value={filters.agent}
              onChange={v => setFilter("agent", v)}
              options={AGENT_OPTIONS}
            />
            <LookingForSelect
              selected={filters.lookingFor}
              onChange={v => setFilter("lookingFor", v)}
            />
          </div>

          {/* Active chips */}
          {activeCount > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-3 border-t border-stone-100">
              {filters.clientClass && (
                <Chip label={`Class: ${CLASS_LABEL[filters.clientClass]}`} onRemove={() => setFilter("clientClass", "")} />
              )}
              {filters.stage && (
                <Chip label={`Stage: ${STAGE_OPTIONS.find(s => s.value === filters.stage)?.label}`} onRemove={() => setFilter("stage", "")} />
              )}
              {filters.priceGroup && (
                <Chip label={`Price: ${PRICE_OPTIONS.find(p => p.value === filters.priceGroup)?.label.split(" · ")[0]}`} onRemove={() => setFilter("priceGroup", "")} />
              )}
              {filters.agent && (
                <Chip label={`Agent: ${filters.agent.split(" ")[0]}`} onRemove={() => setFilter("agent", "")} />
              )}
              {filters.lookingFor.map(kw => (
                <Chip key={kw} label={kw} onRemove={() => setFilter("lookingFor", filters.lookingFor.filter(x => x !== kw))} />
              ))}
              {query.trim() && (
                <Chip label={`"${query.trim()}"`} onRemove={() => setQuery("")} />
              )}
            </div>
          )}
        </div>
      )}

      {/* Results */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-40 rounded-xl bg-stone-100 animate-pulse" />
          ))}
        </div>
      ) : results.length === 0 ? (
        <div className="py-16 text-center space-y-2">
          <p className="text-stone-400 text-sm">No clients match the current filters.</p>
          <button onClick={clearAll} className="text-xs text-[#B8960C] hover:underline">Clear all filters</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {results.map(c => <ClientCard key={c.id} client={c} />)}
        </div>
      )}
    </div>
  );
}

export default function ClientsPage() {
  return (
    <Suspense fallback={<div className="p-6 text-stone-400 text-sm">Loading…</div>}>
      <Inner />
    </Suspense>
  );
}
