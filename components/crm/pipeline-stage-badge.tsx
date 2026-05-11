"use client"
import { cn } from "@/lib/utils"

type PipelineStage =
  | "new_inquiry" | "qualified" | "property_presentation"
  | "offer_submitted" | "negotiation" | "legal_process" | "signed_closed"

type BadgeSize = "sm" | "default"

interface PipelineStageBadgeProps {
  stage: string
  size?: BadgeSize
}

const stageConfig: Record<PipelineStage, { label: string; classes: string }> = {
  new_inquiry:             { label: "New Inquiry",  classes: "bg-sky-100 text-sky-700 border border-sky-300" },
  qualified:               { label: "Qualified",    classes: "bg-violet-100 text-violet-700 border border-violet-300" },
  property_presentation:   { label: "Viewing",      classes: "bg-indigo-100 text-indigo-700 border border-indigo-300" },
  offer_submitted:         { label: "Offer",        classes: "bg-[#fdf3c8] text-[#7a6008] border border-[#B8960C]" },
  negotiation:             { label: "Negotiating",  classes: "bg-orange-100 text-orange-700 border border-orange-300" },
  legal_process:           { label: "Legal",        classes: "bg-[#f5e6d3] text-[#7b4a1e] border border-[#CD853F]" },
  signed_closed:           { label: "Closed",       classes: "bg-emerald-600 text-white border border-emerald-700 shadow-sm" },
}

const sizeClasses: Record<BadgeSize, string> = {
  sm:      "text-[10px] px-1.5 py-0.5 rounded",
  default: "text-xs px-2 py-1 rounded-md",
}

export function PipelineStageBadge({ stage, size = "default" }: PipelineStageBadgeProps) {
  const config = stageConfig[stage as PipelineStage]
  const label   = config?.label ?? stage.replace(/_/g, " ")
  const classes = config?.classes ?? "bg-gray-100 text-gray-500 border border-gray-300"
  return (
    <span className={cn("inline-flex items-center font-medium tracking-wide whitespace-nowrap", classes, sizeClasses[size])}>
      {label}
    </span>
  )
}
