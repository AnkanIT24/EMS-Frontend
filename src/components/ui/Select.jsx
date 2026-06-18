import { forwardRef } from 'react'
import { cn } from '../../lib/utils'

export const Select = forwardRef(function Select({ label, error, options = [], placeholder, className, ...props }, ref) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
          {label}
        </label>
      )}
      <select
        ref={ref}
        className={cn(
          'w-full rounded-lg px-3 py-2.5 text-sm transition-all duration-150 outline-none appearance-none cursor-pointer',
          'bg-[var(--bg-elevated)] border border-[var(--border)]',
          'text-[var(--text-primary)]',
          'focus:border-indigo-500/60 focus:ring-2 focus:ring-indigo-500/15',
          error && 'border-red-500/50',
          className
        )}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map(opt => (
          <option key={opt.value} value={opt.value} className="bg-[#1a1e2a]">
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-red-400">⚠ {error}</p>}
    </div>
  )
})
