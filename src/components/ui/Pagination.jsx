import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '../../lib/utils'

export function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null

  const pages = []
  for (let i = 1; i <= totalPages; i++) pages.push(i)

  return (
    <div className="flex items-center justify-between px-6 py-3 border-t border-[var(--border)]">
      <p className="text-xs text-[var(--text-muted)]">
        Page <span className="text-[var(--text-secondary)] font-medium">{currentPage}</span> of{' '}
        <span className="text-[var(--text-secondary)] font-medium">{totalPages}</span>
      </p>

      <div className="flex items-center gap-1">
        {/* Prev */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] border border-transparent hover:border-[var(--border)] transition-all disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronLeft size={14} />
        </button>

        {/* Page numbers */}
        {pages.map(p => (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={cn(
              'w-7 h-7 rounded-lg text-xs font-medium transition-all border',
              p === currentPage
                ? 'bg-indigo-500/15 text-indigo-300 border-indigo-500/25'
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] border-transparent hover:border-[var(--border)]'
            )}
          >
            {p}
          </button>
        ))}

        {/* Next */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] border border-transparent hover:border-[var(--border)] transition-all disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  )
}