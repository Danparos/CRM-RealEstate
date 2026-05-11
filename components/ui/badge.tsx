import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center justify-center font-medium tracking-wide rounded-full transition-colors duration-150 select-none whitespace-nowrap",
  {
    variants: {
      variant: {
        default:     "bg-[#B8960C] text-white border border-transparent",
        outline:     "bg-transparent text-[#B8960C] border border-[#B8960C]",
        gold:        "bg-[#B8960C]/15 text-[#856b09] border border-[#B8960C]/30",
        bronze:      "bg-[#CD853F]/15 text-[#8B5E2A] border border-[#CD853F]/30",
        success:     "bg-emerald-50 text-emerald-700 border border-emerald-200",
        warning:     "bg-amber-50 text-amber-700 border border-amber-200",
        error:       "bg-red-50 text-red-700 border border-red-200",
        muted:       "bg-[#F5F0E8] text-[#8C7B6B] border border-[#E8DCC8]",
      },
      size: {
        sm:      "px-2 py-0.5 text-[10px] leading-4",
        default: "px-2.5 py-0.5 text-xs leading-5",
        lg:      "px-3 py-1 text-sm leading-5",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant, size, ...props }, ref) => (
    <span ref={ref} className={cn(badgeVariants({ variant, size }), className)} {...props} />
  )
)
Badge.displayName = "Badge"

export { Badge, badgeVariants }
