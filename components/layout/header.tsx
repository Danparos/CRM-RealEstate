"use client"
import { usePathname } from "next/navigation"
import { Search, Bell } from "lucide-react"
import { Avatar } from "@/components/ui/avatar"

interface HeaderProps {
  user: { name: string; avatar?: string }
}

const PAGE_TITLES: Record<string, { title: string; subtitle?: string }> = {
  "/dashboard":  { title: "Dashboard",   subtitle: "Overview & insights"        },
  "/clients":    { title: "Clients",     subtitle: "Manage your client base"    },
  "/pipeline":   { title: "Pipeline",    subtitle: "Deal flow & stage tracking" },
  "/properties": { title: "Properties",  subtitle: "Paros property listings"    },
  "/calendar":   { title: "Calendar",    subtitle: "Appointments & viewings"    },
  "/reports":    { title: "Reports",     subtitle: "Performance & analytics"    },
  "/settings":   { title: "Settings",    subtitle: ""                           },
}

function getPageMeta(pathname: string) {
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname]
  const match = Object.keys(PAGE_TITLES).find((key) => pathname.startsWith(key + "/"))
  return match ? PAGE_TITLES[match] : { title: "Dashboard", subtitle: "" }
}

export function Header({ user }: HeaderProps) {
  const pathname = usePathname()
  const { title, subtitle } = getPageMeta(pathname)

  const hideTitleBar =
    pathname === "/pipeline"   || pathname.startsWith("/pipeline/")   ||
    pathname === "/clients"    || pathname.startsWith("/clients/")    ||
    pathname === "/properties" || pathname.startsWith("/properties/");

  return (
    <header
      className="fixed top-0 right-0 z-30 flex h-16 items-center justify-between bg-white border-b border-warm-200 px-8"
      style={{ left: "240px" }}
    >
      {!hideTitleBar && (
        <div className="flex flex-col justify-center">
          <h1 className="font-serif text-[22px] font-semibold leading-tight tracking-wide text-warm-900">
            {title}
          </h1>
          {subtitle && (
            <p className="text-[11px] tracking-widest uppercase text-warm-400 mt-0.5">{subtitle}</p>
          )}
        </div>
      )}
      {hideTitleBar && <div />}

      <div className="flex items-center gap-1">
        <button
          type="button"
          aria-label="Search"
          className="flex h-9 w-9 items-center justify-center rounded-full text-warm-400 transition-colors hover:bg-warm-100 hover:text-warm-700"
        >
          <Search size={16} strokeWidth={1.75} />
        </button>

        <button
          type="button"
          aria-label="Notifications"
          className="relative flex h-9 w-9 items-center justify-center rounded-full text-warm-400 transition-colors hover:bg-warm-100 hover:text-warm-700"
        >
          <Bell size={16} strokeWidth={1.75} />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full border-2 border-white bg-gold-500" />
        </button>

        <div className="mx-2 h-6 w-px bg-warm-200" />

        <button type="button" aria-label="User menu" className="rounded-full transition-opacity hover:opacity-80">
          <Avatar src={user.avatar} name={user.name} size="sm" />
        </button>
      </div>
    </header>
  )
}
