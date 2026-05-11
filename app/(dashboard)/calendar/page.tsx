import Link from "next/link";

type AppointmentType = "viewing" | "call" | "meeting" | "signing" | "follow_up";

interface Appointment {
  id: string;
  date: string;
  time: string;
  type: AppointmentType;
  clientName: string;
  clientId: string;
  agentName: string;
  note: string;
  location?: string;
}

const APPOINTMENTS: Appointment[] = [
  { id: "apt001", date: "2026-04-27", time: "10:00", type: "viewing",   clientName: "Oliver Hartley",   clientId: "c011", agentName: "Dan Paul",     note: "In-person viewing of Villa Aegean Crest, Naoussa — confirm seafront access", location: "Naoussa, Paros" },
  { id: "apt002", date: "2026-04-27", time: "14:30", type: "call",      clientName: "Sophie Marchand",  clientId: "c002", agentName: "Dan Paul",     note: "Initial qualification call — discuss budget range and preferred locations" },
  { id: "apt003", date: "2026-04-28", time: "09:00", type: "meeting",   clientName: "David Goldstein",  clientId: "c014", agentName: "Dan Paul",     note: "Counter-offer strategy session — prepare response to €4.2M bid", location: "Office, Parikia" },
  { id: "apt004", date: "2026-04-29", time: "11:00", type: "follow_up", clientName: "Marcus Hoffmann",  clientId: "c001", agentName: "Klaus Weber",       note: "Follow up on website inquiry — send shortlist of Lefkes stone houses" },
  { id: "apt005", date: "2026-04-29", time: "15:00", type: "call",      clientName: "Rachel Cohen",     clientId: "c010", agentName: "Anna Papadopoulos", note: "Post virtual-tour call — gather feedback on Golden Beach property" },
  { id: "apt006", date: "2026-05-05", time: "10:30", type: "signing",   clientName: "Pieter de Vries",  clientId: "c016", agentName: "Dan Paul",     note: "Notary signing appointment — final contract for Kolymbithres villa", location: "Notary Office, Parikia" },
  { id: "apt007", date: "2026-05-07", time: "13:00", type: "viewing",   clientName: "Thomas Breitner",  clientId: "c007", agentName: "Klaus Weber",       note: "Tour of three Naoussa sea-view properties — bring updated pricing sheets", location: "Naoussa, Paros" },
  { id: "apt008", date: "2026-05-15", time: "16:00", type: "meeting",   clientName: "Yael Ben-David",   clientId: "c005", agentName: "Dan Paul",     note: "Strategy meeting to present off-market estate options — ultra-prime segment", location: "Office, Parikia" },
];

const TYPE_CONFIG: Record<AppointmentType, { label: string; bg: string; text: string; icon: string }> = {
  viewing:   { label: "Viewing",   bg: "bg-indigo-50",  text: "text-indigo-700",  icon: "🏛" },
  call:      { label: "Call",      bg: "bg-sky-50",     text: "text-sky-700",     icon: "📞" },
  meeting:   { label: "Meeting",   bg: "bg-violet-50",  text: "text-violet-700",  icon: "🤝" },
  signing:   { label: "Signing",   bg: "bg-emerald-50", text: "text-emerald-700", icon: "✍️" },
  follow_up: { label: "Follow-up", bg: "bg-amber-50",   text: "text-amber-700",   icon: "🔔" },
};

const AGENT_AVATARS: Record<string, { initials: string; bg: string }> = {
  "Dan Paul":     { initials: "DP", bg: "bg-[#B8960C]" },
  "Klaus Weber":       { initials: "KW", bg: "bg-[#CD853F]" },
  "Anna Papadopoulos": { initials: "AP", bg: "bg-stone-500" },
};

function formatDayHeader(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00Z");
  return d.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" });
}

function groupByDate(appointments: Appointment[]): Map<string, Appointment[]> {
  const sorted = [...appointments].sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time));
  const map = new Map<string, Appointment[]>();
  for (const apt of sorted) {
    if (!map.has(apt.date)) map.set(apt.date, []);
    map.get(apt.date)!.push(apt);
  }
  return map;
}

export default function CalendarPage() {
  const grouped = groupByDate(APPOINTMENTS);

  return (
    <div className="space-y-8 max-w-3xl">
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-serif text-[32px] font-semibold text-stone-900 leading-tight">Calendar</h1>
          <p className="mt-1 text-sm text-stone-500 tracking-wide">April / May 2026</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {(Object.entries(TYPE_CONFIG) as [AppointmentType, typeof TYPE_CONFIG[AppointmentType]][]).map(([type, cfg]) => (
            <span key={type} className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${cfg.bg} ${cfg.text}`}>
              <span>{cfg.icon}</span>{cfg.label}
            </span>
          ))}
        </div>
      </div>

      <div className="space-y-8">
        {Array.from(grouped.entries()).map(([date, apts]) => (
          <div key={date}>
            <div className="flex items-center gap-3 mb-4">
              <div className="h-px flex-1 bg-warm-200" />
              <h2 className="font-serif text-[15px] font-medium text-stone-600 whitespace-nowrap px-1">{formatDayHeader(date)}</h2>
              <div className="h-px flex-1 bg-warm-200" />
            </div>
            <div className="space-y-3">
              {apts.map((apt) => {
                const typeConfig = TYPE_CONFIG[apt.type];
                const agentConfig = AGENT_AVATARS[apt.agentName] ?? {
                  initials: apt.agentName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase(),
                  bg: "bg-stone-400",
                };
                return (
                  <div key={apt.id} className="bg-white rounded-xl border border-warm-200 shadow-card px-5 py-4 flex items-start gap-4 hover:shadow-card-hover hover:border-warm-300 transition-all">
                    <div className="shrink-0 mt-0.5">
                      <span className="inline-flex items-center justify-center w-[58px] py-1.5 rounded-lg bg-warm-100 text-xs font-semibold text-stone-700 tracking-wide tabular-nums">{apt.time}</span>
                    </div>
                    <div className="shrink-0 mt-0.5">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${typeConfig.bg} ${typeConfig.text}`}>
                        <span>{typeConfig.icon}</span>{typeConfig.label}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Link href={`/clients/${apt.clientId}`} className="text-[15px] font-semibold text-stone-900 hover:text-[#B8960C] transition-colors leading-tight">
                          {apt.clientName}
                        </Link>
                        {apt.location && <span className="text-xs text-stone-400">· {apt.location}</span>}
                      </div>
                      <p className="mt-1 text-sm text-stone-500 leading-snug">{apt.note}</p>
                    </div>
                    <div className="shrink-0 mt-0.5" title={apt.agentName}>
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center text-white text-[11px] font-bold tracking-wider ${agentConfig.bg}`}>
                        {agentConfig.initials}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
