import Link from "next/link";
import { mockClients, PIPELINE_STAGES } from "@/lib/mock-data";
import { Avatar } from "@/components/ui/avatar";
import { PipelineStageBadge } from "@/components/crm/pipeline-stage-badge";
import { ClientClassBadge } from "@/components/crm/client-class-badge";
import { formatCurrency } from "@/lib/utils";
import { FollowUpReminders } from "@/components/dashboard/follow-up-reminders";

const totalClients  = mockClients.length;
const pipelineValue = mockClients.reduce((sum, c) => sum + (c.budgetMax ?? 0), 0);
const activeDeals   = mockClients.filter((c) => c.stage !== "signed_closed").length;
const closedDeals   = mockClients.filter((c) => c.stage === "signed_closed").length;
const hotLeads      = mockClients.filter((c) => c.clientClass === "A").length;

const clientsByStage = PIPELINE_STAGES.map((s) => ({
  ...s,
  count: mockClients.filter((c) => c.stage === s.id).length,
}));

const AGENTS = ["Dan Paul", "Klaus Weber", "Anna Papadopoulos"];
const clientsByAgent = AGENTS.map((agent) => {
  const ac = mockClients.filter((c) => c.primaryAgent === agent);
  return {
    name: agent,
    total:  ac.length,
    classA: ac.filter((c) => c.clientClass === "A").length,
    classB: ac.filter((c) => c.clientClass === "B").length,
    classC: ac.filter((c) => c.clientClass === "C").length,
  };
});

const recentClients = [...mockClients]
  .filter((c) => c.lastActivityAt)
  .sort((a, b) => new Date(b.lastActivityAt!).getTime() - new Date(a.lastActivityAt!).getTime())
  .slice(0, 5);

function relativeTime(iso: string): string {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7)  return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks}w ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-[#faf8f5] space-y-8">
      {/* Stats row */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-2xl bg-white shadow-sm border border-gray-100 px-5 py-5 flex items-start gap-4">
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-500 font-medium tracking-wide uppercase">Total Clients</p>
            <p className="mt-1 text-3xl font-bold text-gray-900 leading-none">{totalClients}</p>
            <p className="mt-1 text-xs text-gray-400">{closedDeals} closed · {activeDeals} active</p>
          </div>
          <div className="shrink-0 h-10 w-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0" />
            </svg>
          </div>
        </div>

        <div className="rounded-2xl bg-white shadow-sm border border-[#e8d98a]/40 px-5 py-5 flex items-start gap-4">
          <div className="flex-1 min-w-0">
            <p className="text-xs text-[#7a6008] font-medium tracking-wide uppercase">Pipeline Value</p>
            <p className="mt-1 text-2xl font-bold text-[#B8960C] leading-none truncate">{formatCurrency(pipelineValue)}</p>
            <p className="mt-1 text-xs text-[#B8960C]/60">Combined max budgets</p>
          </div>
          <div className="shrink-0 h-10 w-10 rounded-xl bg-[#fdf3c8] flex items-center justify-center text-[#B8960C]">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>

        <div className="rounded-2xl bg-white shadow-sm border border-gray-100 px-5 py-5 flex items-start gap-4">
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-500 font-medium tracking-wide uppercase">Active Deals</p>
            <p className="mt-1 text-3xl font-bold text-gray-900 leading-none">{activeDeals}</p>
            <p className="mt-1 text-xs text-gray-400">Across {PIPELINE_STAGES.length - 1} stages</p>
          </div>
          <div className="shrink-0 h-10 w-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
        </div>

        <div className="rounded-2xl bg-white shadow-sm border border-red-100 px-5 py-5 flex items-start gap-4">
          <div className="flex-1 min-w-0">
            <p className="text-xs text-red-500 font-medium tracking-wide uppercase">Hot Leads</p>
            <p className="mt-1 text-3xl font-bold text-red-600 leading-none">{hotLeads}</p>
            <p className="mt-1 text-xs text-red-400">Class A clients</p>
          </div>
          <div className="shrink-0 h-10 w-10 rounded-xl bg-red-50 flex items-center justify-center text-red-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Pipeline overview */}
      <div>
        <h2 className="text-sm font-semibold text-gray-700 mb-3 tracking-wide uppercase">Pipeline Overview</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
          {clientsByStage.map((stage) => (
            <Link key={stage.id} href={`/pipeline?stage=${stage.id}`}
              className="group rounded-xl bg-white border border-gray-100 shadow-sm px-4 py-4 hover:shadow-md hover:border-gray-200 transition-all duration-150 flex flex-col items-start gap-2">
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: stage.color }} />
                <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide leading-none group-hover:text-gray-700 transition-colors line-clamp-1">
                  {stage.label}
                </span>
              </div>
              <span className="text-3xl font-bold text-gray-900 leading-none">{stage.count}</span>
              <span className="text-[10px] text-gray-400">{stage.count === 1 ? "client" : "clients"}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Follow-up reminders */}
      <FollowUpReminders />

      {/* Agents + Recent clients */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <h2 className="text-sm font-semibold text-gray-700 mb-3 tracking-wide uppercase">Agents</h2>
          <div className="space-y-3">
            {clientsByAgent.map((agent) => (
              <div key={agent.name} className="rounded-2xl bg-white border border-gray-100 shadow-sm px-5 py-4 flex items-center gap-4">
                <Avatar name={agent.name} size="default" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">{agent.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{agent.total} {agent.total === 1 ? "client" : "clients"}</p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  {agent.classA > 0 && (
                    <span className="inline-flex items-center justify-center h-5 px-1.5 rounded text-[10px] font-bold bg-red-600 text-white">{agent.classA} Hot</span>
                  )}
                  {agent.classB > 0 && (
                    <span className="inline-flex items-center justify-center h-5 px-1.5 rounded text-[10px] font-bold bg-amber-500 text-white">{agent.classB} Warm</span>
                  )}
                  {agent.classC > 0 && (
                    <span className="inline-flex items-center justify-center h-5 px-1.5 rounded text-[10px] font-bold bg-slate-400 text-white">{agent.classC} Cold</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-3">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-700 tracking-wide uppercase">Recent Activity</h2>
            <Link href="/clients" className="text-xs text-[#B8960C] hover:text-[#8B6914] font-medium transition-colors">View all →</Link>
          </div>
          <div className="rounded-2xl bg-white border border-gray-100 shadow-sm divide-y divide-gray-50 overflow-hidden">
            {recentClients.map((client) => (
              <Link key={client.id} href={`/clients/${client.id}`}
                className="flex items-start gap-3 px-5 py-4 hover:bg-[#faf8f5] transition-colors group">
                <Avatar name={`${client.firstName} ${client.lastName}`} size="sm" className="mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-gray-800 group-hover:text-gray-900 truncate">
                      {client.firstName} {client.lastName}
                    </span>
                    <ClientClassBadge clientClass={client.clientClass} size="sm" />
                    <PipelineStageBadge stage={client.stage} size="sm" />
                  </div>
                  {client.lastActivityNote && (
                    <p className="mt-0.5 text-xs text-gray-400 truncate">{client.lastActivityNote}</p>
                  )}
                </div>
                {client.lastActivityAt && (
                  <span className="shrink-0 text-[11px] text-gray-300 mt-0.5 whitespace-nowrap">
                    {relativeTime(client.lastActivityAt)}
                  </span>
                )}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
