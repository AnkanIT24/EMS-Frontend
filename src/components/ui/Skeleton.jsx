import { cn } from '../../lib/utils'

export function Skeleton({ className, style }) {
  return (
    <div className={cn('animate-pulse rounded-md bg-[var(--bg-overlay)]', className)} style={style} />
  )
}

export function TableSkeleton({ rows = 5, cols = 5 }) {
  return (
    <div className="space-y-0">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="flex gap-4 items-center px-5 py-4 border-b border-[var(--border)] last:border-0"
          style={{ minHeight: '68px' }}
        >
          {Array.from({ length: cols }).map((_, j) => (
            <Skeleton
              key={j}
              className="h-4"
              style={{
                flex: j === cols - 1 ? '0 0 60px' : '1 1 0%',
                opacity: 0.5 - i * 0.07,
                animationDelay: `${i * 80}ms`,
              }}
            />
          ))}
        </div>
      ))}
    </div>
  )
}