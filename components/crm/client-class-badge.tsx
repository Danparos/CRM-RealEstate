"use client"
import { cn } from "@/lib/utils"

type ClientClass = "A" | "B" | "C"
type BadgeSize = "sm" | "default" | "lg"

interface ClientClassBadgeProps {
  clientClass: ClientClass
  showLabel?: boolean
  size?: BadgeSize
}

const classConfig: Record<ClientClass, { label: string; description: string; classes: string }> = {
  A: { label: "Hot",  description: "Hot",  classes: "bg-red-600 text-white border border-red-700 shadow-sm" },
  B: { label: "Warm", description: "Warm", classes: "bg-amber-500 text-white border border-amber-600 shadow-sm" },
  C: { label: "Cold", description: "Cold", classes: "bg-slate-400 text-white border border-slate-500" },
}

const sizeClasses: Record<BadgeSize, string> = {
  sm:      "text-[10px] px-1.5 py-0.5 gap-1 rounded",
  default: "text-xs px-2 py-1 gap-1.5 rounded-md",
  lg:      "text-sm px-3 py-1.5 gap-2 rounded-md",
}

export function ClientClassBadge({ clientClass, showLabel = false, size = "default" }: ClientClassBadgeProps) {
  const config = classConfig[clientClass] ?? classConfig["C"]
  return (
    <span className={cn("inline-flex items-center font-semibold tracking-wide uppercase", config.classes, sizeClasses[size])}>
      <span>{config.label}</span>
      {showLabel && <span className="font-normal opacity-90">{config.description}</span>}
    </span>
  )
}
