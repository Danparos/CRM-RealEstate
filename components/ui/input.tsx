import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", label, error, hint, leftIcon, rightIcon, id, ...props }, ref) => {
    const inputId = id ?? (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined)
    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label htmlFor={inputId} className="text-xs font-medium uppercase tracking-widest text-warm-700">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <span className="absolute left-3 flex items-center pointer-events-none text-warm-400">
              {leftIcon}
            </span>
          )}
          <input
            id={inputId}
            type={type}
            ref={ref}
            className={cn(
              "w-full bg-white text-warm-900 placeholder:text-warm-400",
              "rounded border border-warm-300 py-2.5 text-sm transition-all duration-200",
              "outline-none focus:border-[#B8960C] focus:ring-2 focus:ring-[#B8960C]/20",
              "disabled:cursor-not-allowed disabled:bg-warm-50 disabled:text-warm-400",
              leftIcon  ? "pl-10" : "pl-3.5",
              rightIcon ? "pr-10" : "pr-3.5",
              error ? "border-red-400 focus:border-red-500 focus:ring-red-200" : "",
              className
            )}
            {...props}
          />
          {rightIcon && (
            <span className="absolute right-3 flex items-center pointer-events-none text-warm-400">
              {rightIcon}
            </span>
          )}
        </div>
        {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
        {!error && hint && <p className="text-xs text-warm-400">{hint}</p>}
      </div>
    )
  }
)
Input.displayName = "Input"
export { Input }
