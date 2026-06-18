import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Users, Building2, LayoutDashboard, ChevronLeft, ChevronRight,
  Settings, LogOut, ClipboardList, CheckSquare
} from 'lucide-react'
import { cn } from '../../lib/utils'
import profileImage from '../../assets/profile.jpeg'
import { useAuth } from '../../hooks/AuthContext'

// ADMIN nav items
const adminNavItems = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/employees', icon: Users, label: 'Employees' },
  { path: '/departments', icon: Building2, label: 'Departments' },
  { path: '/tasks', icon: ClipboardList, label: 'Assigned Tasks' },
]

// USER nav items
const userNavItems = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/my-tasks', icon: CheckSquare, label: 'To-Dos' },
]

const bottomItems = [
  { path: '/settings', icon: Settings, label: 'Settings' },
]

function NavItem({ item, collapsed }) {
  return (
    <NavLink
      to={item.path}
      end={item.path === '/'}
      className={({ isActive }) =>
        cn(
          'group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150',
          isActive
            ? 'bg-indigo-500/12 text-indigo-300 border border-indigo-500/20 shadow-sm'
            : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] border border-transparent'
        )
      }
    >
      {({ isActive }) => (
        <>
          <item.icon
            size={17}
            className={cn(
              'flex-shrink-0 transition-colors',
              isActive ? 'text-indigo-400' : 'text-[var(--text-muted)] group-hover:text-[var(--text-secondary)]'
            )}
          />
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.18 }}
                className="overflow-hidden whitespace-nowrap"
              >
                {item.label}
              </motion.span>
            )}
          </AnimatePresence>
        </>
      )}
    </NavLink>
  )
}

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const navigate = useNavigate()
  const { logout, user } = useAuth()

  // Pick nav items based on role
  const navItems = user?.role === 'ADMIN' ? adminNavItems : userNavItems

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <motion.aside
      animate={{ width: collapsed ? 64 : 220 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="relative flex-shrink-0 flex flex-col h-screen bg-[var(--bg-surface)] border-r border-[var(--border)] overflow-hidden"
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-[var(--border)]">
        <div className="flex-shrink-0 w-8 h-8 rounded-full overflow-hidden border border-indigo-500/30 shadow-lg shadow-indigo-500/20 ring-1 ring-indigo-400/10">
          <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="overflow-hidden"
            >
              <p className="text-sm font-bold text-[var(--text-primary)] whitespace-nowrap">EMS Portal</p>
              <p className="text-[10px] text-[var(--text-muted)] whitespace-nowrap">
                {user?.role === 'ADMIN' ? 'Admin Dashboard' : 'User Portal'}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map(item => (
          <NavItem key={item.path} item={item} collapsed={collapsed} />
        ))}
      </nav>

      {/* Bottom */}
      <div className="p-3 space-y-1 border-t border-[var(--border)]">
        {bottomItems.map(item => (
          <NavItem key={item.path} item={item} collapsed={collapsed} />
        ))}
      </div>

      {/* Logout */}
      <div className="p-3 border-t border-[var(--border)]">
        <button
          onClick={handleLogout}
          title={collapsed ? user?.email : undefined}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-[var(--text-secondary)] hover:text-red-400 hover:bg-red-500/10 border border-transparent transition-all duration-150"
        >
          <LogOut size={17} className="flex-shrink-0" />
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.18 }}
                className="overflow-hidden whitespace-nowrap"
              >
                {user?.email ?? 'Logout'}
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(c => !c)}
        className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[var(--bg-elevated)] border border-[var(--border)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors shadow-md z-10"
      >
        {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>
    </motion.aside>
  )
}