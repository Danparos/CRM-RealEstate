"use client"
import { cn } from "@/lib/utils"

type PriceGroup = "entry" | "mid" | "premium" | "luxury" | "ultra"
type BadgeSize = "sm" | "default"

interface PriceGroupBadgeProps {
  group: PriceGroup
  showRange?: boolean
  size?: BadgeSize
}

const groupConfig: Record<PriceGroup, { label: string; range: string; classes: string }> = {
  entry:   { label: "Entry",   range: "< €300K",          classes: "bg-gray-100 text-gray-600 border border-gray-300" },
  mid:     { label: "Mid",     range: "€300K – €700K",    classes: "bg-stone-200 text-stone-700 border border-stone-400" },
  premium: { label: "Premium", range: "€700K – €1.5M",   classes: "bg-[#fdf3c8] text-[#7a6008] border border-[#B8960C]" },
  luxury:  { label: "Luxury",  range: "€1.5M – €3M",     classes: "bg-[#f5e6d3] text-[#7b4a1e] border border-[#CD853F]" },
  ultra:   { label: "Ultra",   range: "€3M+",             classes: "bg-[#B8960C] text-white border border-[#8a6e09] shadow-sm" },
}

const sizeClasses: Record<BadgeSize, string> = {
  sm:      "text-[10px] px-1.5 py-0.5 gap-1 rounded",
  default: "text-xs px-2 py-1 gap-1.5 rounded-md",
}

export function PriceGroupBadge({ group, showRange = false, size = "default" }: PriceGroupBadgeProps) {
  const config = groupConfig[group] ?? groupConfig["entry"]
  return (
    <span className={cn("inline-flex items-center font-semibold tracking-wide", config.classes, sizeClasses[size])}>
      <span>{config.label}</span>
      {showRange && <span className="font-normal opacity-75">{config.range}</span>}
    </span>
  )
}
