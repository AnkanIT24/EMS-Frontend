import { forwardRef } from 'react'
import { cn } from '../../lib/utils'

export const Input = forwardRef(function Input({ label, error, className, icon: Icon, ...props }, ref) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">
            <Icon size={15} />
          </div>
        )}
        <input
          ref={ref}
          className={cn(
            'w-full rounded-lg px-3 py-2.5 text-sm transition-all duration-150 outline-none',
            'bg-[var(--bg-elevated)] border border-[var(--border)]',
            'text-[var(--text-primary)] placeholder:text-[var(--text-muted)]',
            'focus:border-indigo-500/60 focus:ring-2 focus:ring-indigo-500/15',
            error && 'border-red-500/50 focus:border-red-500/70 focus:ring-red-500/10',
            Icon && 'pl-9',
            className
          )}
          {...props}
        />
      </div>
      {error && (
        <p className="text-xs text-red-400 flex items-center gap-1">
          <span>⚠</span> {error}
        </p>
      )}
    </div>
  )
})
