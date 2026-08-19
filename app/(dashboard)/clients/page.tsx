"use client";
import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Plus, Search, X, SlidersHorizontal, ChevronDown, ChevronUp, FileSpreadsheet } from "lucide-react";
import { getAllClients, deleteClient } from "@/lib/db/clients";
import { ClientCard } from "@/components/clients/client-card";
import dynamic from "next/dynamic";
const ImportClientsModal = dynamic(
  () => import("@/components/clients/import-clients-modal").then(m => ({ default: m.ImportClientsModal })),
  { ssr: false }
);
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
    if (f.stage) {
      if (f.stage === "active") {
        if (!["offer_submitted", "negotiation", "legal_process"].includes(c.stage)) return false;
      } else if (c.stage !== f.stage) {
        return false;
      }
    }
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
  const [showImport,    setShowImport]    = useState(false);
  const [selected,      setSelected]      = useState<Set<string>>(new Set());
  const [deleting,      setDeleting]      = useState(false);
  const [filters,       setFilters]       = useState<Filters>(() => ({
    ...EMPTY_FILTERS,
    clientClass: (VALID.includes(sp.get("class") as ClientClass) ? sp.get("class") as ClientClass : "") as ClientClass | "",
    stage: sp.get("stage") ?? "",
  }));

  const showArchived     = sp.get("status") === "archived";
  const showBlacklisted  = sp.get("status") === "blacklisted";

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
  const scopedClients = showBlacklisted
    ? allClients.filter(c => c.blacklisted)
    : showArchived
    ? allClients.filter(c => c.archived && !c.blacklisted)
    : allClients.filter(c => !c.archived && !c.blacklisted);
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
      {showImport && (
        <ImportClientsModal
          onClose={() => setShowImport(false)}
          onDone={() => {
            setShowImport(false);
            getAllClients().then(setAllClientsRaw);
          }}
        />
      )}

      {/* Header */}
      <div className="flex items-end justify-between gap-4 pb-2 border-b border-stone-100">
        <div>
          <h1 className="font-serif text-[36px] font-semibold leading-none tracking-wide text-stone-900">
            {showBlacklisted ? (
              <>Clients <span className="text-stone-300 mx-3 font-light">/</span> <span className="text-red-500">Blacklisted</span></>
            ) : showArchived ? (
              <>Clients <span className="text-stone-300 mx-3 font-light">/</span> <span className="text-[#B8960C]">Archived</span></>
            ) : filters.clientClass ? (
              <>Clients <span className="text-stone-300 mx-3 font-light">/</span> <span className="text-[#B8960C]">{filters.clientClass === "A" ? "Hot" : filters.clientClass === "B" ? "Warm" : "Cold"}</span></>
            ) : (
              "Clients"
            )}
          </h1>
          <p className="mt-2 text-[13px] uppercase tracking-[0.2em] text-stone-400 font-medium">
            {showBlacklisted ? "Blacklisted client records" : showArchived ? "Archived client records" : "Client base & lead management"}
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <div className="rounded-xl border border-stone-200 bg-white px-4 py-2.5 shadow-sm">
            <p className="text-[10px] uppercase tracking-wider font-semibold text-stone-400 mb-0.5">Showing</p>
            <p className="text-lg font-bold leading-none text-stone-700">{results.length}</p>
          </div>
          <button
            type="button"
            onClick={() => setShowImport(true)}
            className="inline-flex items-center gap-1.5 px-4 h-10 rounded-md text-sm font-medium border border-stone-200 bg-white text-stone-700 shadow-sm hover:bg-stone-50 transition-colors whitespace-nowrap"
          >
            <FileSpreadsheet className="h-4 w-4 shrink-0 text-[#B8960C]" />
            Import
          </button>
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
        <div className={showArchived
          ? "bg-white rounded-xl border border-stone-200 divide-y divide-stone-100 animate-pulse overflow-hidden"
          : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
        }>
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className={showArchived ? "h-14 bg-stone-50" : "h-40 rounded-xl bg-stone-100"} />
          ))}
        </div>
      ) : results.length === 0 ? (
        <div className="py-16 text-center space-y-2">
          <p className="text-stone-400 text-sm">No clients match the current filters.</p>
          <button onClick={clearAll} className="text-xs text-[#B8960C] hover:underline">Clear all filters</button>
        </div>
      ) : showArchived ? (
        /* ── Archived list view ─────────────────────────────────── */
        <div className="space-y-3">
          {/* Bulk-action bar */}
          <div className="flex items-center justify-between gap-4 py-2">
            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={selected.size === results.length && results.length > 0}
                onChange={e => setSelected(e.target.checked ? new Set(results.map(c => c.id)) : new Set())}
                className="h-4 w-4 rounded border-stone-300 accent-[#B8960C] cursor-pointer"
              />
              <span className="text-sm text-stone-500">
                {selected.size > 0 ? `${selected.size} selected` : "Select all"}
              </span>
            </label>
            {selected.size > 0 && (
              <button
                onClick={async () => {
                  if (!confirm(`Permanently delete ${selected.size} client${selected.size > 1 ? "s" : ""}? This cannot be undone.`)) return;
                  setDeleting(true);
                  const ids = Array.from(selected);
                  await Promise.all(ids.map(id => deleteClient(id).catch(() => {})));
                  setAllClientsRaw(prev => prev.filter(c => !ids.includes(c.id)));
                  setSelected(new Set());
                  setDeleting(false);
                }}
                disabled={deleting}
                className="inline-flex items-center gap-1.5 px-4 h-9 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                </svg>
                {deleting ? "Deleting…" : `Delete ${selected.size}`}
              </button>
            )}
          </div>

          {/* List table */}
          <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
            {/* Header row */}
            <div className="grid grid-cols-[40px_1fr_160px_140px_120px] gap-4 px-4 py-2.5 bg-stone-50 border-b border-stone-100 text-[10px] font-semibold uppercase tracking-wider text-stone-400">
              <div />
              <div>Client</div>
              <div>Contact</div>
              <div>Archived</div>
              <div>Stage</div>
            </div>

            <div className="divide-y divide-stone-100">
              {results.map(c => {
                const isChecked = selected.has(c.id);
                const fullName = `${c.firstName} ${c.lastName}`;
                const archivedDate = c.archivedAt
                  ? new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(c.archivedAt))
                  : "—";
                const stageLabel = c.stage.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());
                return (
                  <div
                    key={c.id}
                    className={`grid grid-cols-[40px_1fr_160px_140px_120px] gap-4 px-4 py-3.5 items-center transition-colors ${
                      isChecked ? "bg-red-50/60" : "hover:bg-stone-50"
                    }`}
                  >
                    {/* Checkbox */}
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={e => {
                        const next = new Set(selected);
                        e.target.checked ? next.add(c.id) : next.delete(c.id);
                        setSelected(next);
                      }}
                      onClick={e => e.stopPropagation()}
                      className="h-4 w-4 rounded border-stone-300 accent-[#B8960C] cursor-pointer"
                    />

                    {/* Name */}
                    <Link href={`/clients/${c.id}`} className="group min-w-0">
                      <p className="text-sm font-semibold text-stone-800 group-hover:text-[#B8960C] truncate transition-colors">{fullName}</p>
                      {c.primaryAgent && (
                        <p className="text-[11px] text-stone-400 truncate">{c.primaryAgent}</p>
                      )}
                    </Link>

                    {/* Contact */}
                    <div className="min-w-0">
                      {c.email && <p className="text-xs text-stone-500 truncate">{c.email}</p>}
                      {c.phone && <p className="text-xs text-stone-400 truncate font-mono">{c.phone}</p>}
                    </div>

                    {/* Archived date */}
                    <p className="text-xs text-stone-400">{archivedDate}</p>

                    {/* Stage */}
                    <p className="text-xs text-stone-500 truncate">{stageLabel}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        /* ── Normal card grid ───────────────────────────────────── */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {results.map(c => (
            <ClientCard
              key={c.id}
              client={c}
              onStageChange={(newStage) =>
                setAllClientsRaw(prev => prev.map(x => x.id === c.id ? { ...x, stage: newStage } : x))
              }
              onArchiveChange={(archived) =>
                setAllClientsRaw(prev => prev.map(x => x.id === c.id ? { ...x, archived } : x))
              }
            />
          ))}
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
