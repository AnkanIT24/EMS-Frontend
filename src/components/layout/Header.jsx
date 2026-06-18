import { useLocation } from 'react-router-dom'
import { Bell, Search } from 'lucide-react'

const titles = {
  '/': 'Dashboard',
  '/employees': 'Employees',
  '/departments': 'Departments',
  '/employees/new': 'Add Employee',
  '/departments/new': 'Add Department',
}

export function Header() {
  const { pathname } = useLocation()
  const title = Object.entries(titles).find(([p]) => pathname === p)?.[1] ??
    (pathname.includes('/employees/') ? 'Edit Employee' : 'Edit Department')

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between px-6 h-14 bg-[var(--bg-base)]/80 backdrop-blur-md border-b border-[var(--border)]">
      <div>
        <h1 className="text-sm font-semibold text-[var(--text-primary)]">{title}</h1>
        <p className="text-[10px] text-[var(--text-muted)]">Employee Management System</p>
      </div>

      <div className="flex items-center gap-2">
        <button className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors">
          <Bell size={15} />
        </button>
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-xs font-bold text-white shadow-md">
          A
        </div>
      </div>
    </header>
  )
}
