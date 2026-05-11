import type { UserRole } from "@/types";

export const ROLE_CONFIG: Record<UserRole, { label: string; badgeClass: string; dotClass: string }> = {
  admin:          { label: "Admin",          badgeClass: "bg-violet-50 text-violet-700 border-violet-200", dotClass: "bg-violet-500" },
  office_manager: { label: "Office Manager", badgeClass: "bg-blue-50 text-blue-700 border-blue-200",       dotClass: "bg-blue-500"   },
  senior_agent:   { label: "Senior Agent",   badgeClass: "bg-amber-50 text-amber-700 border-amber-200",    dotClass: "bg-amber-500"  },
  agent:          { label: "Agent",          badgeClass: "bg-stone-100 text-stone-600 border-stone-200",   dotClass: "bg-stone-400"  },
  support:        { label: "Support",        badgeClass: "bg-sky-50 text-sky-700 border-sky-200",          dotClass: "bg-sky-400"    },
};

export type PermLevel = "full" | "edit" | "view" | "none";

export const PERMISSIONS_MATRIX: Record<UserRole, Record<string, PermLevel>> = {
  admin:          { Dashboard: "view", Pipeline: "full", Clients: "full", Properties: "full", Calendar: "full", Reports: "full", Admin: "full" },
  office_manager: { Dashboard: "view", Pipeline: "edit", Clients: "full", Properties: "full", Calendar: "full", Reports: "view", Admin: "view" },
  senior_agent:   { Dashboard: "view", Pipeline: "edit", Clients: "edit", Properties: "edit", Calendar: "full", Reports: "none", Admin: "none" },
  agent:          { Dashboard: "view", Pipeline: "view", Clients: "edit", Properties: "view", Calendar: "edit", Reports: "none", Admin: "none" },
  support:        { Dashboard: "view", Pipeline: "view", Clients: "view", Properties: "view", Calendar: "view", Reports: "none", Admin: "none" },
};

export const PERM_CONFIG: Record<PermLevel, { label: string; cellClass: string; textClass: string }> = {
  full: { label: "Full", cellClass: "bg-emerald-50", textClass: "text-emerald-700 font-semibold" },
  edit: { label: "Edit", cellClass: "bg-amber-50",   textClass: "text-amber-700 font-semibold"   },
  view: { label: "View", cellClass: "bg-stone-50",   textClass: "text-stone-500"                 },
  none: { label: "—",    cellClass: "bg-white",      textClass: "text-stone-300"                 },
};

export const LANGUAGE_OPTIONS = [
  "English", "Greek", "German", "French", "Italian",
  "Russian", "Spanish", "Dutch", "Swedish", "Danish",
  "Norwegian", "Polish", "Hebrew", "Arabic", "Chinese",
];
