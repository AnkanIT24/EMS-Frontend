import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { CheckSquare, Clock, CheckCircle2, Circle } from 'lucide-react'
import { taskService } from '../services/api'
import { Card, CardHeader, CardBody } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { StatCard } from '../components/ui/StatCard'
import { Skeleton } from '../components/ui/Skeleton'
import { Button } from '../components/ui/Button'
import { Pagination } from '../components/ui/Pagination'

const PAGE_SIZE = 20

function StatusBadge({ status }) {
  return status === 'COMPLETED'
    ? <Badge colorIndex={3} className="gap-1"><CheckCircle2 size={10} />Completed</Badge>
    : <Badge colorIndex={6} className="gap-1"><Clock size={10} />Pending</Badge>
}

export function UserTasksPage() {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(null)
  const [page, setPage] = useState(1)

  useEffect(() => { fetchTasks() }, [])

  async function fetchTasks() {
    setLoading(true)
    try {
      const data = await taskService.getMyTasks()
      setTasks(data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  async function toggleStatus(task) {
    const newStatus = task.status === 'PENDING' ? 'COMPLETED' : 'PENDING'
    setUpdating(task.assignmentId)
    try {
      const updated = await taskService.updateStatus(task.assignmentId, newStatus)
      setTasks(prev => prev.map(t =>
        t.assignmentId === task.assignmentId ? { ...t, status: updated.status } : t
      ))
    } catch (e) {
      console.error(e)
    } finally {
      setUpdating(null)
    }
  }

  const total = tasks.length
  const completed = tasks.filter(t => t.status === 'COMPLETED').length
  const pending = tasks.filter(t => t.status === 'PENDING').length
  const totalPages = Math.ceil(tasks.length / PAGE_SIZE)
  const paged = tasks.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <div className="space-y-6">

      <div className="grid grid-cols-3 gap-4">
        <StatCard icon={CheckSquare} label="Total Tasks" value={loading ? '—' : total} color="indigo" delay={0} />
        <StatCard icon={Clock} label="Pending" value={loading ? '—' : pending} color="cyan" delay={0.05} />
        <StatCard icon={CheckCircle2} label="Completed" value={loading ? '—' : completed} color="emerald" delay={0.1} />
      </div>

      <Card>
        <CardHeader>
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">My To-Dos</h3>
        </CardHeader>
        <CardBody className="p-0">
          {loading ? (
            <div className="p-4 space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex gap-3 items-center">
                  <Skeleton className="w-8 h-8 rounded-lg" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-3 w-40" />
                    <Skeleton className="h-2.5 w-64" />
                  </div>
                </div>
              ))}
            </div>
          ) : tasks.length === 0 ? (
            <div className="flex flex-col items-center py-16 text-center">
              <CheckSquare size={32} className="text-[var(--text-muted)] mb-3" />
              <p className="text-sm text-[var(--text-secondary)]">No tasks assigned to you yet</p>
            </div>
          ) : (
            <div>
              {paged.map((task, i) => (
                <motion.div
                  key={task.assignmentId}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className="flex items-start gap-4 px-6 py-4 border-b border-[var(--border)] last:border-0 hover:bg-[var(--bg-elevated)] transition-colors"
                >
                  <button
                    onClick={() => toggleStatus(task)}
                    disabled={updating === task.assignmentId}
                    className="flex-shrink-0 mt-0.5 text-[var(--text-muted)] hover:text-indigo-400 transition-colors disabled:opacity-40"
                  >
                    {updating === task.assignmentId ? (
                      <div className="w-5 h-5 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
                    ) : task.status === 'COMPLETED' ? (
                      <CheckCircle2 size={20} className="text-emerald-400" />
                    ) : (
                      <Circle size={20} />
                    )}
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <p className={`text-sm font-medium transition-colors ${
                        task.status === 'COMPLETED'
                          ? 'line-through text-[var(--text-muted)]'
                          : 'text-[var(--text-primary)]'
                      }`}>
                        {task.title}
                      </p>
                      <StatusBadge status={task.status} />
                    </div>
                    {task.description && (
                      <p className="text-xs text-[var(--text-muted)] mb-1.5 line-clamp-2">{task.description}</p>
                    )}
                    <div className="flex items-center gap-3 flex-wrap">
                      {task.dueDate && (
                        <span className="text-xs text-[var(--text-muted)]">
                          Due: <span className={`font-medium ${
                            new Date(task.dueDate) < new Date() && task.status !== 'COMPLETED'
                              ? 'text-rose-400'
                              : 'text-[var(--text-secondary)]'
                          }`}>{task.dueDate}</span>
                        </span>
                      )}
                      <span className="text-xs text-[var(--text-muted)]">
                        From: <span className="text-[var(--text-secondary)]">{task.createdByName}</span>
                      </span>
                    </div>
                  </div>

                  {task.status === 'PENDING' && (
                    <Button
                      variant="secondary"
                      size="sm"
                      loading={updating === task.assignmentId}
                      onClick={() => toggleStatus(task)}
                      className="flex-shrink-0"
                    >
                      <CheckCircle2 size={13} />
                      Mark Done
                    </Button>
                  )}
                </motion.div>
              ))}

              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={(p) => { setPage(p); window.scrollTo(0, 0) }}
              />
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  )
}