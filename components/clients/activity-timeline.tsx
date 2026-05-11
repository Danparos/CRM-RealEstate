"use client";

import {
  Phone,
  MessageCircle,
  Mail,
  Users,
  Home,
  FileText,
  Paperclip,
  StickyNote,
  ArrowRight,
} from "lucide-react";
import type { Activity } from "@/types";

const TYPE_CONFIG: Record<
  string,
  { label: string; icon: React.ElementType; dotColor: string; iconColor: string }
> = {
  phone_call:   { label: "Phone Call",    icon: Phone,          dotColor: "bg-sky-500",      iconColor: "text-sky-500"      },
  whatsapp:     { label: "WhatsApp",      icon: MessageCircle,  dotColor: "bg-green-500",    iconColor: "text-green-500"    },
  email:        { label: "Email",         icon: Mail,           dotColor: "bg-blue-500",     iconColor: "text-blue-500"     },
  meeting:      { label: "Meeting",       icon: Users,          dotColor: "bg-violet-500",   iconColor: "text-violet-500"   },
  viewing:      { label: "Viewing",       icon: Home,           dotColor: "bg-indigo-500",   iconColor: "text-indigo-500"   },
  offer:        { label: "Offer",         icon: FileText,       dotColor: "bg-[#B8960C]",    iconColor: "text-[#B8960C]"    },
  document:     { label: "Document",      icon: Paperclip,      dotColor: "bg-stone-500",    iconColor: "text-stone-500"    },
  note:         { label: "Note",          icon: StickyNote,     dotColor: "bg-amber-500",    iconColor: "text-amber-500"    },
  stage_change: { label: "Stage Change",  icon: ArrowRight,     dotColor: "bg-[#CD853F]",    iconColor: "text-[#CD853F]"    },
  class_change: { label: "Class Change",  icon: ArrowRight,     dotColor: "bg-[#CD853F]",    iconColor: "text-[#CD853F]"    },
};

const FALLBACK_CONFIG = {
  label: "Activity",
  icon: StickyNote,
  dotColor: "bg-stone-400",
  iconColor: "text-stone-400",
};

function formatActivityDate(iso: string): string {
  const d = new Date(iso);
  const day = d.getDate().toString().padStart(2, "0");
  const month = d.toLocaleString("en-GB", { month: "short" });
  const year = d.getFullYear();
  const hours = d.getUTCHours().toString().padStart(2, "0");
  const minutes = d.getUTCMinutes().toString().padStart(2, "0");
  return `${day} ${month} ${year} · ${hours}:${minutes}`;
}

interface Props {
  activities: Activity[];
}

export function ActivityTimeline({ activities }: Props) {
  if (activities.length === 0) {
    return (
      <div className="flex items-center justify-center py-16 text-sm text-stone-400">
        No activity recorded yet.
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="absolute left-[19px] top-0 bottom-0 w-px bg-stone-200" aria-hidden />
      <ul className="space-y-0">
        {activities.map((activity, index) => {
          const config = TYPE_CONFIG[activity.type] ?? FALLBACK_CONFIG;
          const Icon = config.icon;
          const isLast = index === activities.length - 1;

          return (
            <li key={activity.id} className="relative flex gap-4">
              <div className="relative z-10 flex-shrink-0 flex h-10 w-10 items-center justify-center">
                <span className={`flex h-7 w-7 items-center justify-center rounded-full shadow-sm ring-2 ring-white ${config.dotColor}`}>
                  <Icon className="h-3.5 w-3.5 text-white" strokeWidth={2} />
                </span>
              </div>
              <div className={`flex-1 min-w-0 pb-6 ${isLast ? "" : ""}`}>
                <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mb-1">
                  <span className={`text-[11px] font-semibold uppercase tracking-wider ${config.iconColor}`}>
                    {config.label}
                  </span>
                  <span className="text-stone-300 text-xs">·</span>
                  <span className="text-xs text-stone-400">{formatActivityDate(activity.date)}</span>
                  <span className="text-stone-300 text-xs">·</span>
                  <span className="text-xs text-stone-400 italic">{activity.agentName}</span>
                </div>
                <p className="text-sm text-stone-700 leading-relaxed">{activity.note}</p>
                {activity.metadata && Object.keys(activity.metadata).length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {Object.entries(activity.metadata).map(([key, value]) => (
                      <span key={key} className="inline-flex items-center gap-1 rounded-md bg-stone-100 px-2 py-0.5 text-[11px] text-stone-500">
                        <span className="font-medium text-stone-400 uppercase tracking-wide">{key.replace(/_/g, " ")}</span>
                        <span className="text-stone-300">›</span>
                        <span>{value}</span>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
