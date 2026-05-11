import { mockClients, PIPELINE_STAGES } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/utils";
import type { PriceGroup } from "@/types";

const total = mockClients.length;

const pipelineFunnel = PIPELINE_STAGES.map((stage) => {
  const stageClients = mockClients.filter((c) => c.stage === stage.id);
  const count = stageClients.length;
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  const value = stageClients.reduce((sum, c) => sum + (c.budgetMax ?? 0), 0);
  return { stage, count, pct, value };
});

const agentNames = Array.from(new Set(mockClients.map((c) => c.primaryAgent ?? "Unassigned")));
const agentPerformance = agentNames.map((name) => {
  const clients = mockClients.filter((c) => (c.primaryAgent ?? "Unassigned") === name);
  const closed = clients.filter((c) => c.stage === "signed_closed").length;
  const aCount = clients.filter((c) => c.clientClass === "A").length;
  const bCount = clients.filter((c) => c.clientClass === "B").length;
  const cCount = clients.filter((c) => c.clientClass === "C").length;
  const pipelineValue = clients.reduce((sum, c) => sum + (c.budgetMax ?? 0), 0);
  return { name, total: clients.length, aCount, bCount, cCount, pipelineValue, closed };
}).sort((a, b) => b.pipelineValue - a.pipelineValue);

const PRICE_GROUPS: { id: PriceGroup; label: string; color: string }[] = [
  { id: "ultra",   label: "Ultra-Prime", color: "bg-[#B8960C]" },
  { id: "luxury",  label: "Luxury",      color: "bg-[#CD853F]" },
  { id: "premium", label: "Premium",     color: "bg-amber-400" },
  { id: "mid",     label: "Mid-Range",   color: "bg-stone-400" },
  { id: "entry",   label: "Entry",       color: "bg-stone-300" },
];

const priceGroupMax = Math.max(...PRICE_GROUPS.map((pg) => mockClients.filter((c) => c.priceGroup === pg.id).length), 1);
const priceGroupDist = PRICE_GROUPS.map((pg) => {
  const count = mockClients.filter((c) => c.priceGroup === pg.id).length;
  const pct = Math.round((count / total) * 100);
  const barPct = Math.round((count / priceGroupMax) * 100);
  return { ...pg, count, pct, barPct };
});

const natMap = new Map<string, number>();
for (const c of mockClients) {
  const nat = c.nationality ?? "—";
  natMap.set(nat, (natMap.get(nat) ?? 0) + 1);
}
const topNationalities = Array.from(natMap.entries()).sort((a, b) => b[1] - a[1]).slice(0, 5);
const FLAG: Record<string, string> = { DE: "🇩🇪", FR: "🇫🇷", GB: "🇬🇧", IL: "🇮🇱", NL: "🇳🇱", GR: "🇬🇷", CH: "🇨🇭", US: "🇺🇸", IT: "🇮🇹", AU: "🇦🇺" };
const NAT_NAME: Record<string, string> = { DE: "Germany", FR: "France", GB: "United Kingdom", IL: "Israel", NL: "Netherlands", GR: "Greece", CH: "Switzerland", US: "United States", IT: "Italy", AU: "Australia" };
const natMax = topNationalities[0]?.[1] ?? 1;

export default function ReportsPage() {
  const totalPipelineValue = mockClients.reduce((sum, c) => sum + (c.budgetMax ?? 0), 0);

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <h1 className="font-serif text-[32px] font-semibold text-stone-900 leading-tight">Reports</h1>
        <p className="mt-1 text-sm text-stone-500 tracking-wide">
          {total} active clients · Total pipeline{" "}
          <span className="text-[#B8960C] font-semibold">{formatCurrency(totalPipelineValue)}</span>
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Pipeline Funnel */}
        <div className="bg-white rounded-2xl border border-warm-200 shadow-card p-6 lg:col-span-2">
          <h2 className="font-serif text-[20px] font-semibold text-stone-900 mb-1">Pipeline Funnel</h2>
          <p className="text-xs text-stone-400 mb-5 tracking-wide">Client distribution across all sales stages</p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-warm-100">
                  <th className="text-left text-xs font-semibold text-stone-400 pb-2 pr-4 tracking-wider uppercase">Stage</th>
                  <th className="text-right text-xs font-semibold text-stone-400 pb-2 px-4 tracking-wider uppercase">Clients</th>
                  <th className="text-right text-xs font-semibold text-stone-400 pb-2 px-4 tracking-wider uppercase">% of Total</th>
                  <th className="text-right text-xs font-semibold text-stone-400 pb-2 pl-4 tracking-wider uppercase">Budget Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-warm-100">
                {pipelineFunnel.map(({ stage, count, pct, value }) => (
                  <tr key={stage.id} className="hover:bg-warm-50 transition-colors">
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: stage.color }} />
                        <span className="font-medium text-stone-800">{stage.label}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right"><span className="font-semibold text-[#B8960C] text-base tabular-nums">{count}</span></td>
                    <td className="py-3 px-4 text-right"><span className="text-stone-500 tabular-nums">{pct}%</span></td>
                    <td className="py-3 pl-4 text-right"><span className="font-medium text-stone-700 tabular-nums">{value > 0 ? formatCurrency(value) : "—"}</span></td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-warm-200">
                  <td className="pt-3 pr-4 font-semibold text-stone-700">Total</td>
                  <td className="pt-3 px-4 text-right font-bold text-[#B8960C] text-base tabular-nums">{total}</td>
                  <td className="pt-3 px-4 text-right text-stone-500">100%</td>
                  <td className="pt-3 pl-4 text-right font-semibold text-stone-800 tabular-nums">{formatCurrency(totalPipelineValue)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Agent Performance */}
        <div className="bg-white rounded-2xl border border-warm-200 shadow-card p-6 lg:col-span-2">
          <h2 className="font-serif text-[20px] font-semibold text-stone-900 mb-1">Agent Performance</h2>
          <p className="text-xs text-stone-400 mb-5 tracking-wide">Client portfolio and pipeline value per agent</p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-warm-100">
                  <th className="text-left text-xs font-semibold text-stone-400 pb-2 pr-4 tracking-wider uppercase">Agent</th>
                  <th className="text-right text-xs font-semibold text-stone-400 pb-2 px-3 tracking-wider uppercase">Clients</th>
                  <th className="text-center text-xs font-semibold text-stone-400 pb-2 px-3 tracking-wider uppercase">Hot / Warm / Cold</th>
                  <th className="text-right text-xs font-semibold text-stone-400 pb-2 px-3 tracking-wider uppercase">Pipeline Value</th>
                  <th className="text-right text-xs font-semibold text-stone-400 pb-2 pl-3 tracking-wider uppercase">Closed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-warm-100">
                {agentPerformance.map((agent) => (
                  <tr key={agent.name} className="hover:bg-warm-50 transition-colors">
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2.5">
                        <div className={`h-7 w-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0 ${agent.name === "Errikos Kohls" ? "bg-[#B8960C]" : agent.name === "Klaus Weber" ? "bg-[#CD853F]" : "bg-stone-500"}`}>
                          {agent.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                        </div>
                        <span className="font-medium text-stone-800">{agent.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-right"><span className="font-semibold text-[#B8960C] tabular-nums text-base">{agent.total}</span></td>
                    <td className="py-3 px-3 text-center">
                      <span className="inline-flex items-center gap-1 text-xs">
                        <span className="font-semibold text-red-600">{agent.aCount}</span>
                        <span className="text-stone-300">/</span>
                        <span className="font-semibold text-amber-500">{agent.bCount}</span>
                        <span className="text-stone-300">/</span>
                        <span className="font-semibold text-stone-400">{agent.cCount}</span>
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-medium text-stone-700 tabular-nums">{formatCurrency(agent.pipelineValue)}</td>
                    <td className="py-3 pl-3 text-right">
                      <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold tabular-nums">{agent.closed}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Price Group Distribution */}
        <div className="bg-white rounded-2xl border border-warm-200 shadow-card p-6">
          <h2 className="font-serif text-[20px] font-semibold text-stone-900 mb-1">Price Group Distribution</h2>
          <p className="text-xs text-stone-400 mb-6 tracking-wide">Client segments by budget tier</p>
          <div className="space-y-4">
            {priceGroupDist.map((pg) => (
              <div key={pg.id}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-medium text-stone-700">{pg.label}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-[#B8960C] tabular-nums leading-none">{pg.count}</span>
                    <span className="text-xs text-stone-400 tabular-nums">({pg.pct}%)</span>
                  </div>
                </div>
                <div className="h-2 w-full rounded-full bg-warm-100 overflow-hidden">
                  <div className={`h-full rounded-full transition-all ${pg.color}`} style={{ width: `${pg.barPct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Nationality Breakdown */}
        <div className="bg-white rounded-2xl border border-warm-200 shadow-card p-6">
          <h2 className="font-serif text-[20px] font-semibold text-stone-900 mb-1">Nationality Breakdown</h2>
          <p className="text-xs text-stone-400 mb-6 tracking-wide">Top 5 client nationalities</p>
          <div className="space-y-4">
            {topNationalities.map(([code, count]) => {
              const barPct = Math.round((count / natMax) * 100);
              const pct = Math.round((count / total) * 100);
              return (
                <div key={code}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-lg leading-none">{FLAG[code] ?? "🌍"}</span>
                      <span className="text-sm font-medium text-stone-700">{NAT_NAME[code] ?? code}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-[#B8960C] tabular-nums leading-none">{count}</span>
                      <span className="text-xs text-stone-400 tabular-nums">({pct}%)</span>
                    </div>
                  </div>
                  <div className="h-2 w-full rounded-full bg-warm-100 overflow-hidden">
                    <div className="h-full rounded-full bg-[#B8960C] transition-all" style={{ width: `${barPct}%` }} />
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
