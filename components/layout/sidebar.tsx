"use client";
import Link from "next/link";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { LayoutDashboard, Users, Building2, GitMerge, CalendarDays, BarChart3, ShieldCheck, CheckSquare, ChevronLeft, ChevronRight, LogOut, FileText, FileSignature, Users2, TrendingUp, Store } from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";
import { createClient } from "@/lib/supabase/client";

const NAV_SECTIONS = [
  {
    label: "Main",
    items: [
      { label: "Dashboard",  icon: LayoutDashboard, href: "/dashboard"  },
      { label: "Pipeline",   icon: GitMerge,        href: "/pipeline"   },
      { label: "Clients",    icon: Users,           href: "/clients"    },
      { label: "Properties", icon: Building2,       href: "/properties" },
    ],
  },
  {
    label: "Tools",
    items: [
      { label: "Calendar",   icon: CalendarDays,    href: "/calendar"   },
      { label: "Marketing",  icon: FileText,        href: "/marketing"  },
      { label: "Tasks",      icon: CheckSquare,     href: "/tasks"      },
      { label: "Reports",    icon: BarChart3,       href: "/reports"    },
    ],
  },
  {
    label: "Deal Room",
    items: [
      { label: "Transactions", icon: FileSignature, href: "/contracts"    },
      { label: "Vendors",      icon: Store,         href: "/vendors"      },
      { label: "Commissions",  icon: TrendingUp,    href: "/commissions"  },
      { label: "Contacts",     icon: Users2,        href: "/contacts"     },
    ],
  },
  {
    label: "System",
    items: [
      { label: "Admin",      icon: ShieldCheck,     href: "/admin"      },
    ],
  },
];

const CLASS_FILTERS = [
  { label: "All Clients", value: null, dot: "bg-stone-300",  text: "text-stone-500"  },
  { label: "Hot",         value: "A",  dot: "bg-red-500",    text: "text-red-500"    },
  { label: "Warm",        value: "B",  dot: "bg-amber-500",  text: "text-amber-600"  },
  { label: "Cold",        value: "C",  dot: "bg-stone-400",  text: "text-stone-500"  },
];

const STAGE_FILTERS = [
  { label: "New Inquiries", value: "new_inquiry",   dot: "bg-sky-400",     href: "?stage=new_inquiry"   },
  { label: "Active Deals",  value: "active",        dot: "bg-orange-400",  href: "?stage=active"        },
  { label: "Closed",        value: "signed_closed", dot: "bg-emerald-400", href: "?stage=signed_closed" },
];

const PIPELINE_STAGES = [
  { label: "New Inquiry",            value: "new_inquiry",           dot: "bg-sky-400"     },
  { label: "Qualified",              value: "qualified",             dot: "bg-violet-400"  },
  { label: "Property Presentation",  value: "property_presentation", dot: "bg-amber-400"   },
  { label: "Offer Submitted",        value: "offer_submitted",       dot: "bg-orange-400"  },
  { label: "Negotiation",            value: "negotiation",           dot: "bg-rose-400"    },
  { label: "Legal Process",          value: "legal_process",         dot: "bg-red-500"     },
  { label: "Signed & Closed",        value: "signed_closed",         dot: "bg-emerald-400" },
];

const PROPERTY_STATUSES = [
  { label: "All Properties",  value: null,             dot: "bg-stone-300"   },
  { label: "Available",       value: "available",      dot: "bg-emerald-400" },
  { label: "Under Offer",     value: "under_offer",    dot: "bg-amber-400"   },
  { label: "Under Contract",  value: "under_contract", dot: "bg-orange-400"  },
  { label: "Sold",            value: "sold",           dot: "bg-stone-400"   },
  { label: "Off Market",      value: "off_market",     dot: "bg-slate-400"   },
  { label: "Draft",           value: "draft",          dot: "bg-gray-300"    },
];

interface SidebarProps {
  user: { name: string; role: string; avatar?: string };
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

function SubFilters({
  basePath,
  activeClass,
  activeStage,
  activeStatus,
}: {
  basePath: string;
  activeClass: string | null;
  activeStage: string | null;
  activeStatus: string | null;
}) {
  if (basePath === "/pipeline") {
    return (
      <div className="mt-1 mb-2 ml-6 pl-3 border-l-2 border-gold-100 flex flex-col gap-0.5">
        {PIPELINE_STAGES.map(({ label, value, dot }) => {
          const isActive = activeStage === value;
          return (
            <Link key={value} href={`/pipeline?stage=${value}`} className={cn(
              "flex items-center gap-2 rounded-md px-2.5 py-1.5 text-[12px] font-medium transition-colors",
              isActive ? "bg-gold-50 text-gold-700" : "text-warm-400 hover:bg-warm-50 hover:text-warm-700"
            )}>
              <span className={cn("h-2 w-2 rounded-full shrink-0", dot)} />
              <span className={cn(isActive ? "text-gold-700" : "text-stone-400")}>{label}</span>
              {isActive && <span className="ml-auto h-1 w-1 rounded-full bg-gold-400" />}
            </Link>
          );
        })}
      </div>
    );
  }

  if (basePath === "/properties") {
    return (
      <div className="mt-1 mb-2 ml-6 pl-3 border-l-2 border-gold-100 flex flex-col gap-0.5">
        {PROPERTY_STATUSES.map(({ label, value, dot }) => {
          const isActive = activeStatus === value || (value === null && !activeStatus);
          const href = value ? `/properties?status=${value}` : "/properties";
          return (
            <Link key={label} href={href} className={cn(
              "flex items-center gap-2 rounded-md px-2.5 py-1.5 text-[12px] font-medium transition-colors",
              isActive ? "bg-gold-50 text-gold-700" : "text-warm-400 hover:bg-warm-50 hover:text-warm-700"
            )}>
              <span className={cn("h-2 w-2 rounded-full shrink-0", dot)} />
              <span className={cn(isActive ? "text-gold-700" : "text-stone-400")}>{label}</span>
              {isActive && <span className="ml-auto h-1 w-1 rounded-full bg-gold-400" />}
            </Link>
          );
        })}
      </div>
    );
  }

  return (
    <div className="mt-1 mb-2 ml-6 pl-3 border-l-2 border-gold-100 flex flex-col gap-0.5">
      {CLASS_FILTERS.map(({ label, value, dot, text }) => {
        const isActive = !activeStage && (activeClass === value || (value === null && !activeClass));
        const href = value ? `${basePath}?class=${value}` : basePath;
        return (
          <Link key={label} href={href} className={cn(
            "flex items-center gap-2 rounded-md px-2.5 py-1.5 text-[12px] font-medium transition-colors",
            isActive ? "bg-gold-50 text-gold-700" : "text-warm-400 hover:bg-warm-50 hover:text-warm-700"
          )}>
            <span className={cn("h-2 w-2 rounded-full shrink-0", dot)} />
            <span className={cn(isActive ? "text-gold-700" : text)}>{label}</span>
            {isActive && <span className="ml-auto h-1 w-1 rounded-full bg-gold-400" />}
          </Link>
        );
      })}

      <div className="my-1 border-t border-warm-100" />

      {/* Archived */}
      {(() => {
        const isActive = activeStage === "archived";
        return (
          <Link href={`${basePath}?status=archived`} className={cn(
            "flex items-center gap-2 rounded-md px-2.5 py-1.5 text-[12px] font-medium transition-colors",
            isActive ? "bg-gold-50 text-gold-700" : "text-warm-400 hover:bg-warm-50 hover:text-warm-700"
          )}>
            <span className="h-2 w-2 rounded-full shrink-0 bg-stone-300" />
            <span className={cn(isActive ? "text-gold-700" : "text-stone-400")}>Archived</span>
            {isActive && <span className="ml-auto h-1 w-1 rounded-full bg-gold-400" />}
          </Link>
        );
      })()}

      <div className="my-1 border-t border-warm-100" />

      {STAGE_FILTERS.map(({ label, value, dot, href }) => {
        const isActive = activeStage === value;
        return (
          <Link key={label} href={`${basePath}${href}`} className={cn(
            "flex items-center gap-2 rounded-md px-2.5 py-1.5 text-[12px] font-medium transition-colors",
            isActive ? "bg-gold-50 text-gold-700" : "text-warm-400 hover:bg-warm-50 hover:text-warm-700"
          )}>
            <span className={cn("h-2 w-2 rounded-full shrink-0", dot)} />
            <span className={cn(isActive ? "text-gold-700" : "text-stone-400")}>{label}</span>
            {isActive && <span className="ml-auto h-1 w-1 rounded-full bg-gold-400" />}
          </Link>
        );
      })}
    </div>
  );
}

export function Sidebar({ user, collapsed, onToggleCollapse, mobileOpen = false, onMobileClose }: SidebarProps) {
  const pathname     = usePathname();
  const searchParams = useSearchParams();
  const router       = useRouter();
  const activeClass  = searchParams.get("class");
  const activeStage  = searchParams.get("stage");
  const activeStatus = searchParams.get("status");

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <aside className={cn(
      "fixed left-0 top-0 z-40 flex h-screen flex-col bg-white border-r border-warm-200 transition-all duration-300 overflow-hidden",
      // Desktop: collapse/expand
      collapsed ? "lg:w-16" : "lg:w-60",
      // Mobile: full-width drawer, slides in/out
      "w-60",
      mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
    )}>
      {/* Mobile close button */}
      {mobileOpen && (
        <button onClick={onMobileClose} className="absolute right-3 top-3 z-50 lg:hidden flex h-7 w-7 items-center justify-center rounded-full border border-warm-200 bg-white text-warm-400">
          <ChevronLeft size={14} strokeWidth={2.5} />
        </button>
      )}
      {/* Desktop toggle button */}
      <button
        onClick={onToggleCollapse}
        title={collapsed ? "Expand menu" : "Collapse menu"}
        className="hidden lg:flex absolute right-2 top-7 z-50 h-6 w-6 items-center justify-center rounded-full border border-warm-200 bg-white shadow-sm hover:bg-warm-50 hover:border-[#B8960C] hover:text-[#B8960C] transition-colors text-warm-400"
      >
        {collapsed ? <ChevronRight size={12} strokeWidth={2.5} /> : <ChevronLeft size={12} strokeWidth={2.5} />}
      </button>

      {/* Brand */}
      <div className="relative px-4 py-7 border-b border-warm-100 min-h-[80px] flex items-center">
        <div className="absolute left-0 top-6 bottom-6 w-[3px] rounded-r-full bg-gradient-to-b from-[#B8960C] to-[#CD853F]" />
        {collapsed ? (
          <span className="mx-auto text-[#B8960C] font-serif font-bold text-lg leading-none">R</span>
        ) : (
          <div className="pl-2 pr-8">
            <p className="font-serif text-[17px] font-semibold tracking-[0.12em] uppercase leading-tight text-[#B8960C]">
              Real Estate CRM
            </p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto" style={{ padding: collapsed ? "16px 8px" : "16px 12px" }}>
        {NAV_SECTIONS.map((section, sIdx) => (
          <div key={section.label}>
            {/* Section divider (not before first section) */}
            {sIdx > 0 && (
              <div className={cn("flex items-center gap-2 my-3", collapsed && "justify-center")}>
                <div className="flex-1 h-px bg-stone-200" />
                {!collapsed && (
                  <span className="text-[9px] uppercase tracking-[0.15em] font-semibold text-stone-400 shrink-0">
                    {section.label}
                  </span>
                )}
                <div className="flex-1 h-px bg-stone-200" />
              </div>
            )}

            <div className="space-y-0.5">
              {section.items.map(({ label, icon: Icon, href }) => {
                const isActive = pathname === href || pathname.startsWith(href + "/");
                return (
                  <div key={href}>
                    <Link
                      href={href}
                      title={collapsed ? label : undefined}
                      className={cn(
                        "group flex items-center rounded-md text-[13px] font-semibold transition-colors duration-150",
                        collapsed ? "justify-center px-0 py-2.5" : "gap-3 px-3 py-2.5",
                        isActive
                          ? "bg-[#B8960C]/10 text-[#B8960C]"
                          : "text-stone-700 hover:bg-stone-100 hover:text-stone-900"
                      )}
                    >
                      <Icon size={16} strokeWidth={isActive ? 2.25 : 1.75} className={cn(
                        "shrink-0 transition-colors",
                        isActive ? "text-[#B8960C]" : "text-stone-500 group-hover:text-stone-700"
                      )} />
                      {!collapsed && <span>{label}</span>}
                      {!collapsed && isActive && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[#B8960C]" />}
                    </Link>

                    {!collapsed && isActive && (href === "/clients" || href === "/pipeline" || href === "/properties") && (
                      <SubFilters
                        basePath={href}
                        activeClass={activeClass}
                        activeStage={activeStage}
                        activeStatus={activeStatus}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User */}
      <div className="px-4 py-4 border-t border-warm-100 bg-warm-50">
        <div className={cn("flex items-center gap-3", collapsed && "justify-center")}>
          <Avatar src={user.avatar} name={user.name} size="sm" />
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-warm-900 leading-tight">{user.name}</p>
              <p className="truncate text-[11px] text-warm-400 mt-0.5 tracking-wide">{user.role}</p>
            </div>
          )}
          <button
            onClick={handleLogout}
            title="Sign out"
            className="shrink-0 p-1.5 rounded-lg text-stone-300 hover:text-red-500 hover:bg-red-50 transition-colors"
          >
            <LogOut size={14} strokeWidth={2} />
          </button>
        </div>
      </div>
    </aside>
  );
}
