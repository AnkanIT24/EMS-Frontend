import { cn } from '../../lib/utils'

const palettes = [
  'bg-indigo-500/10 text-indigo-300 border-indigo-500/20',
  'bg-violet-500/10 text-violet-300 border-violet-500/20',
  'bg-cyan-500/10 text-cyan-300 border-cyan-500/20',
  'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
  'bg-rose-500/10 text-rose-300 border-rose-500/20',
  'bg-amber-500/10 text-amber-300 border-amber-500/20',
  'bg-sky-500/10 text-sky-300 border-sky-500/20',
  'bg-pink-500/10 text-pink-300 border-pink-500/20',
]

export function Badge({ children, colorIndex, className }) {
  const palette = palettes[colorIndex % palettes.length]
  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border', palette, className)}>
      {children}
    </span>
  )
}
