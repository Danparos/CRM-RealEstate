import * as React from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

export interface SelectOption { value: string; label: string }

export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "children"> {
  label?: string
  error?: string
  hint?: string
  options: SelectOption[]
  placeholder?: string
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, hint, options, placeholder, id, ...props }, ref) => {
    const selectId = id ?? (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined)
    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label htmlFor={selectId} className="text-xs font-medium uppercase tracking-widest text-warm-700">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          <select
            id={selectId}
            ref={ref}
            className={cn(
              "w-full appearance-none bg-white text-warm-900",
              "rounded border border-warm-300 py-2.5 pl-3.5 pr-10 text-sm",
              "transition-all duration-200 cursor-pointer",
              "outline-none focus:border-[#B8960C] focus:ring-2 focus:ring-[#B8960C]/20",
              "disabled:cursor-not-allowed disabled:bg-warm-50 disabled:text-warm-400",
              error ? "border-red-400 focus:border-red-500 focus:ring-red-200" : "",
              className
            )}
            {...props}
          >
            {placeholder && <option value="" disabled>{placeholder}</option>}
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <span className="absolute right-3 flex items-center pointer-events-none text-warm-400">
            <ChevronDown className="h-4 w-4" />
          </span>
        </div>
        {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
        {!error && hint && <p className="text-xs text-warm-400">{hint}</p>}
      </div>
    )
  }
)
Select.displayName = "Select"
export { Select }
