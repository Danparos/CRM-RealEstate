"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { ChevronLeft, ChevronRight, Pause, Play, Maximize2 } from "lucide-react";
import { mockClients, PIPELINE_STAGES, mockProperties } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/utils";

// ── Pre-computed data ─────────────────────────────────────────────────────────

const totalClients  = mockClients.length;
const pipelineValue = mockClients.reduce((s, c) => s + (c.budgetMax ?? 0), 0);
const hotLeads      = mockClients.filter(c => c.clientClass === "A").length;
const closedDeals   = mockClients.filter(c => c.stage === "signed_closed").length;
const activeDeals   = mockClients.filter(c => c.stage !== "signed_closed").length;
const listingValue  = mockProperties.filter(p => p.status === "available" || p.status === "under_offer").reduce((s, p) => s + p.askingPrice, 0);

const AGENTS = [
  { name: "Dan Paul",     initials: "EK", color: "#B8960C", role: "Managing Partner"    },
  { name: "Klaus Weber",       initials: "KW", color: "#CD853F", role: "Senior Consultant"   },
  { name: "Anna Papadopoulos", initials: "AP", color: "#6b7280", role: "Junior Consultant"   },
].map(a => {
  const cl = mockClients.filter(c => c.primaryAgent === a.name);
  return { ...a, total: cl.length, classA: cl.filter(c => c.clientClass === "A").length, classB: cl.filter(c => c.clientClass === "B").length, classC: cl.filter(c => c.clientClass === "C").length, value: cl.reduce((s, c) => s + (c.budgetMax ?? 0), 0), closed: cl.filter(c => c.stage === "signed_closed").length };
});

const STAGE_COUNTS = PIPELINE_STAGES.map(s => ({ ...s, count: mockClients.filter(c => c.stage === s.id).length }));

const CLASS_A_CLIENTS = mockClients.filter(c => c.clientClass === "A").slice(0, 6);
const FEATURED_PROPS  = mockProperties.filter(p => p.status === "available").slice(0, 6);

const natMap: Record<string, number> = {};
mockClients.forEach(c => { if (c.nationality) natMap[c.nationality] = (natMap[c.nationality] ?? 0) + 1; });
const TOP_NATS = Object.entries(natMap).sort((a, b) => b[1] - a[1]).slice(0, 5);
const FLAG: Record<string, string> = { DE: "🇩🇪", FR: "🇫🇷", GB: "🇬🇧", IL: "🇮🇱", NL: "🇳🇱", GR: "🇬🇷", CH: "🇨🇭" };
const NAT: Record<string, string>  = { DE: "Germany", FR: "France", GB: "United Kingdom", IL: "Israel", NL: "Netherlands", GR: "Greece", CH: "Switzerland" };

const SLIDE_DURATION = 9000;

// ── Slide Components ─────────────────────────────────────────────────────────

function SlideCover() {
  return (
    <div className="relative flex flex-col items-center justify-center h-full bg-[#120e06] overflow-hidden select-none">
      {/* Subtle dot grid */}
      <div className="absolute inset-0" style={{ backgroundImage: "radial-gradient(circle, rgba(184,150,12,0.12) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
      {/* Radial glow */}
      <div className="absolute inset-0 bg-gradient-radial from-[#B8960C]/10 via-transparent to-transparent" style={{ background: "radial-gradient(ellipse 80% 60% at 50% 60%, rgba(184,150,12,0.12), transparent)" }} />

      <div className="relative z-10 flex flex-col items-center gap-6 px-16 text-center">
        <p className="text-[#B8960C] text-xs tracking-[0.4em] uppercase font-medium">Paros, Greece</p>
        <h1 className="font-serif text-[72px] leading-[1.05] font-semibold text-white tracking-tight">
          Dan Paul<br/>
          <span className="text-[#B8960C]">Immobilien</span>
        </h1>
        <div className="w-24 h-px bg-gradient-to-r from-transparent via-[#B8960C] to-transparent" />
        <p className="text-stone-300 text-xl font-light tracking-wide">Luxury Real Estate Consulting</p>
        <div className="mt-6 flex items-center gap-8 text-stone-500 text-sm tracking-widest uppercase">
          <span>CRM Overview</span>
          <span className="w-1 h-1 rounded-full bg-[#B8960C]" />
          <span>April 2026</span>
        </div>
      </div>

      {/* Corner accents */}
      <div className="absolute top-8 left-8 w-12 h-12 border-t border-l border-[#B8960C]/40" />
      <div className="absolute top-8 right-8 w-12 h-12 border-t border-r border-[#B8960C]/40" />
      <div className="absolute bottom-8 left-8 w-12 h-12 border-b border-l border-[#B8960C]/40" />
      <div className="absolute bottom-8 right-8 w-12 h-12 border-b border-r border-[#B8960C]/40" />
    </div>
  );
}

function SlideNumbers() {
  const stats = [
    { label: "Active Clients",   value: totalClients,              sub: `${activeDeals} in pipeline`,         accent: false },
    { label: "Pipeline Value",   value: formatCurrency(pipelineValue), sub: "Combined max budgets",           accent: true  },
    { label: "Hot Leads",        value: hotLeads,                  sub: "Class A clients",                    accent: false, red: true },
    { label: "Deals Closed",     value: closedDeals,               sub: "Completed transactions",             accent: false, green: true },
  ];
  return (
    <div className="flex flex-col items-center justify-center h-full bg-[#faf8f5] px-20 gap-12">
      <div className="text-center">
        <p className="text-xs tracking-[0.35em] text-[#B8960C] uppercase font-medium mb-2">Portfolio at a Glance</p>
        <h2 className="font-serif text-5xl font-semibold text-stone-900">April 2026 · Paros</h2>
      </div>
      <div className="grid grid-cols-4 gap-6 w-full max-w-5xl">
        {stats.map(s => (
          <div key={s.label} className={`rounded-2xl bg-white shadow-sm border px-8 py-8 flex flex-col gap-3 ${s.accent ? "border-[#B8960C]/30" : s.red ? "border-red-100" : s.green ? "border-emerald-100" : "border-stone-100"}`}>
            <p className={`text-xs font-semibold tracking-wider uppercase ${s.accent ? "text-[#B8960C]" : s.red ? "text-red-500" : s.green ? "text-emerald-600" : "text-stone-400"}`}>{s.label}</p>
            <p className={`text-5xl font-bold leading-none ${s.accent ? "text-[#B8960C]" : s.red ? "text-red-600" : s.green ? "text-emerald-600" : "text-stone-900"}`}>{s.value}</p>
            <p className="text-sm text-stone-400">{s.sub}</p>
          </div>
        ))}
      </div>
      <p className="text-stone-300 text-sm tracking-widest uppercase">{mockProperties.length} Properties Listed · {formatCurrency(listingValue)} in Active Listings</p>
    </div>
  );
}

function SlidePipeline() {
  return (
    <div className="flex flex-col items-center justify-center h-full bg-[#faf8f5] px-20 gap-10">
      <div className="text-center">
        <p className="text-xs tracking-[0.35em] text-[#B8960C] uppercase font-medium mb-2">Sales Process</p>
        <h2 className="font-serif text-5xl font-semibold text-stone-900">7-Stage Pipeline</h2>
      </div>
      <div className="flex items-stretch gap-3 w-full max-w-6xl">
        {STAGE_COUNTS.map((stage, i) => (
          <div key={stage.id} className="flex-1 flex flex-col items-center gap-3 bg-white rounded-2xl border border-stone-100 shadow-sm px-4 py-6 hover:shadow-md transition-shadow">
            <div className="h-1.5 w-full rounded-full" style={{ backgroundColor: stage.color }} />
            <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider text-center leading-tight">{stage.label}</span>
            <span className="text-5xl font-bold text-stone-900 leading-none">{stage.count}</span>
            <span className="text-xs text-stone-300">{stage.count === 1 ? "client" : "clients"}</span>
            <div className="text-[10px] tracking-widest text-stone-300 font-medium">0{i + 1}</div>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-3">
        <span className="text-stone-400 text-sm">Total Pipeline Value</span>
        <span className="text-[#B8960C] text-3xl font-bold tracking-tight">{formatCurrency(pipelineValue)}</span>
      </div>
    </div>
  );
}

function SlideClients() {
  const FLAGS: Record<string, string> = { DE: "🇩🇪", FR: "🇫🇷", GB: "🇬🇧", IL: "🇮🇱", NL: "🇳🇱", GR: "🇬🇷", CH: "🇨🇭" };
  return (
    <div className="flex flex-col items-center justify-center h-full bg-[#faf8f5] px-20 gap-10">
      <div className="text-center">
        <p className="text-xs tracking-[0.35em] text-[#B8960C] uppercase font-medium mb-2">Priority Clients</p>
        <h2 className="font-serif text-5xl font-semibold text-stone-900">Class A — Hot Leads</h2>
        <p className="text-stone-400 mt-2">{hotLeads} ultra-priority clients · immediate purchase intent</p>
      </div>
      <div className="grid grid-cols-3 gap-4 w-full max-w-5xl">
        {CLASS_A_CLIENTS.map(c => (
          <div key={c.id} className="bg-white rounded-xl border border-stone-100 shadow-sm px-5 py-4 flex items-start gap-4">
            <div className="h-11 w-11 rounded-full bg-gradient-to-br from-[#B8960C] to-[#CD853F] flex items-center justify-center text-white font-bold text-sm shrink-0">
              {c.firstName[0]}{c.lastName[0]}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-semibold text-stone-900 text-sm truncate">{c.firstName} {c.lastName}</p>
                <span className="text-base leading-none">{c.nationality ? (FLAGS[c.nationality] ?? "") : ""}</span>
              </div>
              <p className="text-xs text-[#B8960C] font-semibold mt-0.5">{c.budgetMax ? formatCurrency(c.budgetMax) : "—"}</p>
              <p className="text-[11px] text-stone-400 mt-1 truncate">{c.propertyInterest}</p>
            </div>
            <span className="shrink-0 h-5 px-1.5 rounded text-[10px] font-bold bg-red-600 text-white flex items-center">Hot</span>
          </div>
        ))}
      </div>
      <p className="text-stone-300 text-xs tracking-widest uppercase">{totalClients} total clients under management</p>
    </div>
  );
}

function SlideProperties() {
  return (
    <div className="flex flex-col items-center justify-center h-full bg-[#faf8f5] px-20 gap-10">
      <div className="text-center">
        <p className="text-xs tracking-[0.35em] text-[#B8960C] uppercase font-medium mb-2">Property Portfolio</p>
        <h2 className="font-serif text-5xl font-semibold text-stone-900">Current Listings</h2>
        <p className="text-stone-400 mt-2">{mockProperties.filter(p => p.status === "available").length} available · {mockProperties.filter(p => p.status === "under_offer").length} under offer · {mockProperties.filter(p => p.status === "sold").length} sold</p>
      </div>
      <div className="grid grid-cols-3 gap-4 w-full max-w-5xl">
        {FEATURED_PROPS.map(p => (
          <div key={p.id} className="bg-white rounded-xl border border-stone-100 shadow-sm overflow-hidden">
            <div className="h-28 bg-gradient-to-br from-warm-100 to-stone-200 relative flex items-end px-3 pb-2">
              <span className="absolute top-2 left-2 bg-[#B8960C] text-white text-[10px] font-bold tracking-widest px-2 py-0.5 rounded">{p.reference}</span>
              {p.seafront && <span className="absolute top-2 right-2 text-xs bg-sky-500 text-white px-1.5 py-0.5 rounded text-[10px]">SEAFRONT</span>}
              <span className="bg-white/90 text-stone-700 text-[11px] font-semibold px-2 py-0.5 rounded-full">{p.area}</span>
            </div>
            <div className="px-4 py-3">
              <p className="font-serif text-base font-medium text-stone-900 truncate">{p.title.en}</p>
              <p className="text-[#B8960C] text-lg font-bold mt-0.5">{formatCurrency(p.askingPrice)}</p>
              <p className="text-stone-400 text-[11px] mt-1">{p.bedrooms} bed · {p.bathrooms} bath · {p.buildArea} m²{p.pool ? " · Pool" : ""}</p>
            </div>
          </div>
        ))}
      </div>
      <p className="text-stone-300 text-sm tracking-widest uppercase">Active listing value: <span className="text-[#B8960C] font-semibold">{formatCurrency(listingValue)}</span></p>
    </div>
  );
}

function SlideTeam() {
  return (
    <div className="flex flex-col items-center justify-center h-full bg-[#faf8f5] px-20 gap-12">
      <div className="text-center">
        <p className="text-xs tracking-[0.35em] text-[#B8960C] uppercase font-medium mb-2">The Team</p>
        <h2 className="font-serif text-5xl font-semibold text-stone-900">Our Consultants</h2>
      </div>
      <div className="grid grid-cols-3 gap-8 w-full max-w-4xl">
        {AGENTS.map(a => (
          <div key={a.name} className="bg-white rounded-2xl border border-stone-100 shadow-sm px-8 py-8 flex flex-col items-center gap-5">
            <div className="h-20 w-20 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg" style={{ backgroundColor: a.color }}>
              {a.initials}
            </div>
            <div className="text-center">
              <p className="font-serif text-xl font-semibold text-stone-900">{a.name}</p>
              <p className="text-xs text-stone-400 tracking-wider uppercase mt-1">{a.role}</p>
            </div>
            <div className="w-full border-t border-stone-100 pt-5 grid grid-cols-2 gap-3">
              <div className="text-center">
                <p className="text-3xl font-bold text-stone-900">{a.total}</p>
                <p className="text-[11px] text-stone-400 uppercase tracking-wide">Clients</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-emerald-600">{a.closed}</p>
                <p className="text-[11px] text-stone-400 uppercase tracking-wide">Closed</p>
              </div>
              <div className="col-span-2 text-center">
                <p className="text-lg font-bold text-[#B8960C]">{formatCurrency(a.value)}</p>
                <p className="text-[11px] text-stone-400 uppercase tracking-wide">Pipeline</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {a.classA > 0 && <span className="h-6 px-2 rounded text-[11px] font-bold bg-red-600 text-white flex items-center">{a.classA} Hot</span>}
              {a.classB > 0 && <span className="h-6 px-2 rounded text-[11px] font-bold bg-amber-500 text-white flex items-center">{a.classB} Warm</span>}
              {a.classC > 0 && <span className="h-6 px-2 rounded text-[11px] font-bold bg-stone-400 text-white flex items-center">{a.classC} Cold</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SlideMarket() {
  const natMax = TOP_NATS[0]?.[1] ?? 1;
  return (
    <div className="flex flex-col items-center justify-center h-full bg-[#faf8f5] px-20 gap-10">
      <div className="text-center">
        <p className="text-xs tracking-[0.35em] text-[#B8960C] uppercase font-medium mb-2">Client Demographics</p>
        <h2 className="font-serif text-5xl font-semibold text-stone-900">Who Buys in Paros</h2>
      </div>
      <div className="grid grid-cols-2 gap-8 w-full max-w-4xl">
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-8">
          <h3 className="font-serif text-xl font-semibold text-stone-800 mb-6">Top Nationalities</h3>
          <div className="space-y-5">
            {TOP_NATS.map(([code, count]) => (
              <div key={code}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{FLAG[code] ?? "🌍"}</span>
                    <span className="text-sm font-medium text-stone-700">{NAT[code] ?? code}</span>
                  </div>
                  <span className="text-lg font-bold text-[#B8960C]">{count}</span>
                </div>
                <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
                  <div className="h-full bg-[#B8960C] rounded-full" style={{ width: `${Math.round((count / natMax) * 100)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-8">
          <h3 className="font-serif text-xl font-semibold text-stone-800 mb-6">Budget Segments</h3>
          <div className="space-y-4">
            {[
              { label: "Ultra-Prime (€5M+)",    count: mockClients.filter(c => c.priceGroup === "ultra").length,   color: "#B8960C" },
              { label: "Luxury (€2M–€5M)",      count: mockClients.filter(c => c.priceGroup === "luxury").length,  color: "#CD853F" },
              { label: "Premium (€750K–€2M)",   count: mockClients.filter(c => c.priceGroup === "premium").length, color: "#f59e0b" },
              { label: "Mid-Range (€350–750K)", count: mockClients.filter(c => c.priceGroup === "mid").length,     color: "#9ca3af" },
              { label: "Entry (under €350K)",   count: mockClients.filter(c => c.priceGroup === "entry").length,   color: "#d1d5db" },
            ].map(seg => {
              const max = Math.max(...[5,5,5,5,5].map((_, i) => i)); // dummy
              return (
                <div key={seg.label}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-stone-600">{seg.label}</span>
                    <span className="text-base font-bold" style={{ color: seg.color }}>{seg.count}</span>
                  </div>
                  <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${Math.round((seg.count / totalClients) * 100) * 2}%`, backgroundColor: seg.color, maxWidth: "100%" }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function SlideThankYou() {
  return (
    <div className="relative flex flex-col items-center justify-center h-full bg-[#120e06] overflow-hidden select-none">
      <div className="absolute inset-0" style={{ backgroundImage: "radial-gradient(circle, rgba(184,150,12,0.12) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
      <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 80% 60% at 50% 50%, rgba(184,150,12,0.08), transparent)" }} />
      <div className="relative z-10 flex flex-col items-center gap-8 px-16 text-center">
        <p className="text-[#B8960C]/60 text-xs tracking-[0.4em] uppercase font-medium">Dan Paul Immobilien Consulting</p>
        <h1 className="font-serif text-[80px] leading-none font-semibold text-white">Thank You</h1>
        <div className="w-24 h-px bg-gradient-to-r from-transparent via-[#B8960C] to-transparent" />
        <p className="text-stone-300 text-xl font-light tracking-wide max-w-lg">
          Luxury real estate on the island of Paros — handled with precision, discretion, and expertise.
        </p>
        <div className="mt-4 flex flex-col items-center gap-2 text-stone-500 text-sm">
          <span className="text-[#B8960C]">errikos@kohls-immobilien.com</span>
          <span>Parikia, Paros · Greece</span>
        </div>
      </div>
      <div className="absolute top-8 left-8 w-12 h-12 border-t border-l border-[#B8960C]/40" />
      <div className="absolute top-8 right-8 w-12 h-12 border-t border-r border-[#B8960C]/40" />
      <div className="absolute bottom-8 left-8 w-12 h-12 border-b border-l border-[#B8960C]/40" />
      <div className="absolute bottom-8 right-8 w-12 h-12 border-b border-r border-[#B8960C]/40" />
    </div>
  );
}

// ── Slide Registry ────────────────────────────────────────────────────────────

const SLIDES = [
  { id: "cover",      label: "Cover",       component: SlideCover      },
  { id: "numbers",    label: "Numbers",     component: SlideNumbers    },
  { id: "pipeline",   label: "Pipeline",    component: SlidePipeline   },
  { id: "clients",    label: "Clients",     component: SlideClients    },
  { id: "properties", label: "Properties",  component: SlideProperties },
  { id: "team",       label: "Team",        component: SlideTeam       },
  { id: "market",     label: "Market",      component: SlideMarket     },
  { id: "thankyou",   label: "Thank You",   component: SlideThankYou   },
];

// ── Presentation Shell ────────────────────────────────────────────────────────

export default function PresentationPage() {
  const [current, setCurrent] = useState(0);
  const [playing, setPlaying]  = useState(true);
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const progressRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const goTo = useCallback((idx: number) => {
    setCurrent(Math.max(0, Math.min(SLIDES.length - 1, idx)));
    setProgress(0);
  }, []);

  const next = useCallback(() => goTo(current < SLIDES.length - 1 ? current + 1 : 0), [current, goTo]);
  const prev = useCallback(() => goTo(current > 0 ? current - 1 : SLIDES.length - 1), [current, goTo]);

  // Auto-advance
  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (progressRef.current) clearInterval(progressRef.current);
    setProgress(0);
    if (!playing) return;

    const tick = 100;
    progressRef.current = setInterval(() => {
      setProgress(p => Math.min(100, p + (tick / SLIDE_DURATION) * 100));
    }, tick);

    intervalRef.current = setInterval(() => {
      setCurrent(c => (c < SLIDES.length - 1 ? c + 1 : 0));
      setProgress(0);
    }, SLIDE_DURATION);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (progressRef.current) clearInterval(progressRef.current);
    };
  }, [playing, current]);

  // Keyboard nav
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "Space") { e.preventDefault(); next(); }
      if (e.key === "ArrowLeft")  { e.preventDefault(); prev(); }
      if (e.key === "p" || e.key === "P") setPlaying(p => !p);
      if (e.key === "f" || e.key === "F") document.documentElement.requestFullscreen?.();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [next, prev]);

  const isDark = current === 0 || current === SLIDES.length - 1;
  const CurrentSlide = SLIDES[current].component;

  return (
    <div className="fixed inset-0 bg-[#120e06] overflow-hidden" style={{ fontFamily: "Inter, sans-serif" }}>

      {/* Slides */}
      <div className="absolute inset-0 bottom-16">
        {SLIDES.map((slide, i) => {
          const Comp = slide.component;
          const isActive = i === current;
          const isPrev  = i === current - 1;
          return (
            <div key={slide.id}
              className="absolute inset-0 transition-all duration-700 ease-in-out"
              style={{
                opacity:   isActive ? 1 : 0,
                transform: isActive ? "scale(1) translateX(0)" : isPrev ? "scale(0.98) translateX(-1%)" : "scale(0.98) translateX(1%)",
                pointerEvents: isActive ? "auto" : "none",
                zIndex: isActive ? 10 : 1,
              }}
            >
              <Comp />
            </div>
          );
        })}
      </div>

      {/* Progress bar */}
      <div className="absolute bottom-16 left-0 right-0 h-0.5 bg-white/10 z-30">
        <div className="h-full bg-[#B8960C] transition-none" style={{ width: `${progress}%` }} />
      </div>

      {/* Bottom navigation bar */}
      <div className={`absolute bottom-0 left-0 right-0 h-16 z-30 flex items-center justify-between px-8 ${isDark ? "bg-[#0c0a04]/90" : "bg-white/90"} backdrop-blur-sm border-t ${isDark ? "border-white/10" : "border-stone-200"}`}>

        {/* Slide counter */}
        <div className={`text-sm font-medium tabular-nums ${isDark ? "text-stone-400" : "text-stone-500"}`}>
          <span className={isDark ? "text-[#B8960C]" : "text-[#B8960C]"}>{String(current + 1).padStart(2, "0")}</span>
          <span className="mx-1 opacity-40">/</span>
          {String(SLIDES.length).padStart(2, "0")}
          <span className={`ml-3 text-xs tracking-widest uppercase ${isDark ? "text-stone-600" : "text-stone-400"}`}>{SLIDES[current].label}</span>
        </div>

        {/* Dot indicators */}
        <div className="flex items-center gap-2">
          {SLIDES.map((s, i) => (
            <button key={s.id} onClick={() => goTo(i)}
              className={`rounded-full transition-all duration-200 ${i === current ? "w-6 h-2 bg-[#B8960C]" : `w-2 h-2 ${isDark ? "bg-white/20 hover:bg-white/40" : "bg-stone-300 hover:bg-stone-500"}`}`}
            />
          ))}
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          <button onClick={prev} className={`h-9 w-9 rounded-full flex items-center justify-center transition-colors ${isDark ? "text-stone-400 hover:bg-white/10 hover:text-white" : "text-stone-400 hover:bg-stone-100 hover:text-stone-700"}`}>
            <ChevronLeft size={18} />
          </button>
          <button onClick={() => setPlaying(p => !p)} className={`h-9 w-9 rounded-full flex items-center justify-center transition-colors ${isDark ? "text-stone-400 hover:bg-white/10 hover:text-white" : "text-stone-400 hover:bg-stone-100 hover:text-stone-700"}`}>
            {playing ? <Pause size={16} /> : <Play size={16} />}
          </button>
          <button onClick={next} className={`h-9 w-9 rounded-full flex items-center justify-center transition-colors ${isDark ? "text-stone-400 hover:bg-white/10 hover:text-white" : "text-stone-400 hover:bg-stone-100 hover:text-stone-700"}`}>
            <ChevronRight size={18} />
          </button>
          <button onClick={() => document.documentElement.requestFullscreen?.()} className={`h-9 w-9 rounded-full flex items-center justify-center transition-colors ml-1 ${isDark ? "text-stone-400 hover:bg-white/10 hover:text-white" : "text-stone-400 hover:bg-stone-100 hover:text-stone-700"}`}>
            <Maximize2 size={15} />
          </button>
        </div>
      </div>

      {/* Keyboard hint — fades after 4s */}
      <div className="absolute top-4 right-6 z-30 text-[11px] text-white/20 tracking-widest pointer-events-none">
        ← → SPACE · P pause · F fullscreen
      </div>
    </div>
  );
}
