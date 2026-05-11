"use client"
import Image from "next/image"
import { cn, getInitials } from "@/lib/utils"

const AVATAR_COLORS = [
  "bg-[#B8960C] text-white",
  "bg-[#CD853F] text-white",
  "bg-[#8B6914] text-white",
  "bg-[#A0522D] text-white",
  "bg-[#6B4F12] text-white",
  "bg-[#C4944A] text-white",
]

const SIZE_CLASSES = {
  xs:      "h-6 w-6 text-[10px]",
  sm:      "h-8 w-8 text-xs",
  default: "h-10 w-10 text-sm",
  lg:      "h-12 w-12 text-base",
  xl:      "h-16 w-16 text-lg",
}

function getColorIndex(name: string): number {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return Math.abs(hash) % AVATAR_COLORS.length
}

interface AvatarProps {
  src?: string
  name: string
  size?: "xs" | "sm" | "default" | "lg" | "xl"
  className?: string
}

export function Avatar({ src, name, size = "default", className }: AvatarProps) {
  const sizeClass  = SIZE_CLASSES[size]
  const colorClass = AVATAR_COLORS[getColorIndex(name)]
  return (
    <div className={cn(
      "relative inline-flex shrink-0 items-center justify-center rounded-full overflow-hidden ring-2 ring-white",
      sizeClass, !src && colorClass, className
    )}>
      {src ? (
        <Image src={src} alt={name} fill className="object-cover" sizes="64px" />
      ) : (
        <span className="font-semibold leading-none select-none">{getInitials(name)}</span>
      )}
    </div>
  )
}
