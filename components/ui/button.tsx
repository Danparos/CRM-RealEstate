import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2",
    "font-medium tracking-wide rounded-md",
    "transition-all duration-200 ease-in-out",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#B8960C]",
    "disabled:pointer-events-none disabled:opacity-50",
    "select-none whitespace-nowrap",
  ],
  {
    variants: {
      variant: {
        default: [
          "bg-[#B8960C] text-white shadow-sm",
          "hover:bg-[#9e7f0a] active:bg-[#856b09]",
          "border border-transparent",
        ],
        outline: [
          "bg-transparent text-[#B8960C] shadow-sm",
          "border border-[#B8960C]",
          "hover:bg-[#B8960C]/10 active:bg-[#B8960C]/20",
        ],
        ghost: [
          "bg-transparent text-[#B8960C]",
          "border border-transparent",
          "hover:bg-[#B8960C]/10 active:bg-[#B8960C]/20",
        ],
        secondary: [
          "bg-[#F5F0E8] text-[#5C4A2A] shadow-sm",
          "border border-[#E8DCC8]",
          "hover:bg-[#EDE5D5] active:bg-[#E0D4BF]",
        ],
        destructive: [
          "bg-red-600 text-white shadow-sm",
          "border border-transparent",
          "hover:bg-red-700 active:bg-red-800",
          "focus-visible:ring-red-500",
        ],
      },
      size: {
        sm:      "h-8 px-3 text-xs rounded",
        default: "h-10 px-5 text-sm",
        lg:      "h-12 px-8 text-base rounded-lg",
        icon:    "h-10 w-10 p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, isLoading = false, leftIcon, rightIcon, disabled, children, ...props }, ref) => {
    const isIconOnly = size === "icon"
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        disabled={disabled || isLoading}
        aria-busy={isLoading}
        {...props}
      >
        {isLoading ? (
          <>
            <Loader2 className="animate-spin shrink-0 h-4 w-4" aria-hidden="true" />
            {!isIconOnly && children}
          </>
        ) : (
          <>
            {leftIcon && <span className="shrink-0 inline-flex items-center" aria-hidden="true">{leftIcon}</span>}
            {children}
            {rightIcon && <span className="shrink-0 inline-flex items-center" aria-hidden="true">{rightIcon}</span>}
          </>
        )}
      </button>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
