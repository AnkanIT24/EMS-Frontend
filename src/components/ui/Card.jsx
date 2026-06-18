import { cn } from '../../lib/utils'

export function Card({ children, className, ...props }) {
  return (
    <div
      className={cn(
        'rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] shadow-xl shadow-black/20',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardHeader({ children, className }) {
  return (
    <div className={cn('px-6 py-4 border-b border-[var(--border)]', className)}>
      {children}
    </div>
  )
}

export function CardBody({ children, className }) {
  return <div className={cn('p-6', className)}>{children}</div>
}
