import { motion } from 'framer-motion'

export function StatCard({ icon: Icon, label, value, color = 'indigo', delay = 0 }) {
  const colorMap = {
    indigo: { bg: 'bg-indigo-500/10', border: 'border-indigo-500/20', icon: 'text-indigo-400', glow: 'shadow-indigo-500/10' },
    violet: { bg: 'bg-violet-500/10', border: 'border-violet-500/20', icon: 'text-violet-400', glow: 'shadow-violet-500/10' },
    emerald: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', icon: 'text-emerald-400', glow: 'shadow-emerald-500/10' },
    cyan: { bg: 'bg-cyan-500/10', border: 'border-cyan-500/20', icon: 'text-cyan-400', glow: 'shadow-cyan-500/10' },
  }
  const c = colorMap[color]

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35 }}
      className={`rounded-xl border ${c.border} bg-[var(--bg-surface)] p-5 shadow-xl ${c.glow}`}
    >
      <div className="flex items-start gap-4">
        <div className={`flex-shrink-0 w-10 h-10 rounded-lg ${c.bg} border ${c.border} flex items-center justify-center`}>
          <Icon size={18} className={c.icon} />
        </div>
        <div>
          <p className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider mb-0.5">{label}</p>
          <p className="text-2xl font-bold text-[var(--text-primary)] tabular-nums">{value}</p>
        </div>
      </div>
    </motion.div>
  )
}
