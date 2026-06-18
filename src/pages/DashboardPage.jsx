import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Users, Building2, TrendingUp, Activity, CheckSquare, Clock, CheckCircle2, ClipboardList } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { employeeService, departmentService, taskService, userService } from '../services/api'
import { StatCard } from '../components/ui/StatCard'
import { Card, CardHeader, CardBody } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Skeleton } from '../components/ui/Skeleton'
import { useAuth } from '../hooks/AuthContext'

// ── Admin Dashboard ───────────────────────────────────────────────────────────
function AdminDashboard() {
  const navigate = useNavigate()
  const [employees, setEmployees] = useState([])
  const [departments, setDepartments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([employeeService.getAll(), departmentService.getAll()])
      .then(([emps, deps]) => { setEmployees(emps); setDepartments(deps) })
      .finally(() => setLoading(false))
  }, [])

  const deptMap = {}
  departments.forEach((d, i) => { deptMap[d.id] = { ...d, index: i, count: 0 } })
  employees.forEach(e => { if (deptMap[e.departmentId]) deptMap[e.departmentId].count++ })
  const deptStats = Object.values(deptMap).sort((a, b) => b.count - a.count)
  const recent = [...employees].reverse().slice(0, 5)

  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Total Employees" value={loading ? '—' : employees.length} color="indigo" delay={0} />
        <StatCard icon={Building2} label="Departments" value={loading ? '—' : departments.length} color="violet" delay={0.05} />
        <StatCard icon={TrendingUp} label="Avg per Dept" value={loading ? '—' : departments.length ? Math.round(employees.length / departments.length) : 0} color="emerald" delay={0.1} />
        <StatCard icon={Activity} label="Active Now" value={loading ? '—' : employees.length} color="cyan" delay={0.15} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Recent employees */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-3"
        >
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-[var(--text-primary)]">Recent Employees</h3>
                <Button variant="ghost" size="sm" onClick={() => navigate('/employees')}>View all</Button>
              </div>
            </CardHeader>
            <CardBody className="p-0">
              {loading ? (
                <div className="p-4 space-y-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex gap-3 items-center">
                      <Skeleton className="w-8 h-8 rounded-full" />
                      <div className="flex-1 space-y-1.5">
                        <Skeleton className="h-3 w-32" />
                        <Skeleton className="h-2.5 w-48" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : recent.length === 0 ? (
                <div className="flex flex-col items-center py-12 text-center">
                  <p className="text-sm text-[var(--text-secondary)]">No employees yet</p>
                  <Button size="sm" className="mt-3" onClick={() => navigate('/employees/new')}>Add first employee</Button>
                </div>
              ) : (
                <div>
                  {recent.map((emp, i) => {
                    const dept = deptMap[emp.departmentId]
                    return (
                      <motion.div
                        key={emp.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.25 + i * 0.04 }}
                        className="flex items-center gap-3 px-5 py-3.5 border-b border-[var(--border)] last:border-0 hover:bg-[var(--bg-elevated)] transition-colors"
                      >
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500/30 to-violet-500/30 border border-indigo-500/20 flex items-center justify-center text-xs font-bold text-indigo-300 flex-shrink-0">
                          {emp.firstName?.[0]}{emp.lastName?.[0]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-[var(--text-primary)] truncate">{emp.firstName} {emp.lastName}</p>
                          <p className="text-xs text-[var(--text-muted)] truncate">{emp.email}</p>
                        </div>
                        {dept && <Badge colorIndex={dept.index}>{dept.departmentName}</Badge>}
                      </motion.div>
                    )
                  })}
                </div>
              )}
            </CardBody>
          </Card>
        </motion.div>

        {/* Department breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="lg:col-span-2"
        >
          <Card className="h-full">
            <CardHeader>
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">By Department</h3>
            </CardHeader>
            <CardBody className="p-0">
              {loading ? (
                <div className="p-4 space-y-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="space-y-1.5">
                      <Skeleton className="h-3 w-28" />
                      <Skeleton className="h-2 w-full" />
                    </div>
                  ))}
                </div>
              ) : deptStats.length === 0 ? (
                <div className="flex items-center justify-center py-12">
                  <p className="text-sm text-[var(--text-secondary)]">No departments</p>
                </div>
              ) : (
                <div className="p-4 space-y-4">
                  {deptStats.map((dept, i) => {
                    const pct = employees.length > 0 ? Math.round((dept.count / employees.length) * 100) : 0
                    return (
                      <motion.div
                        key={dept.id}
                        initial={{ opacity: 0, x: 8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 + i * 0.05 }}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs font-medium text-[var(--text-secondary)] truncate">{dept.departmentName}</span>
                          <span className="text-xs text-[var(--text-muted)] ml-2 flex-shrink-0">{dept.count}</span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-[var(--bg-overlay)] overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ delay: 0.4 + i * 0.05, duration: 0.5, ease: 'easeOut' }}
                            className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500"
                          />
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              )}
            </CardBody>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}

// ── User Dashboard ────────────────────────────────────────────────────────────
function UserDashboard() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [profile, setProfile] = useState(null)
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      userService.getCurrentUser(),
      taskService.getMyTasks(),
    ])
      .then(([p, t]) => { setProfile(p); setTasks(t) })
      .finally(() => setLoading(false))
  }, [])

  const pending = tasks.filter(t => t.status === 'PENDING').length
  const completed = tasks.filter(t => t.status === 'COMPLETED').length
  const recentTasks = tasks.slice(0, 5)

  const initials = user?.fullName
    ? user.fullName.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
    : '?'

  return (
    <div className="space-y-6">

      {/* Welcome banner */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-indigo-500/20 bg-gradient-to-r from-indigo-500/10 to-violet-500/10 p-6"
      >
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500/30 to-violet-500/30 border border-indigo-500/30 flex items-center justify-center text-xl font-bold text-indigo-300 flex-shrink-0">
            {initials}
          </div>
          <div>
            <p className="text-lg font-bold text-[var(--text-primary)]">
              Welcome back, {user?.fullName?.split(' ')[0] ?? 'there'} 👋
            </p>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">{user?.email}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-500/12 text-indigo-300 border border-indigo-500/20">
                {user?.role}
              </span>
              {loading ? (
                <Skeleton className="h-4 w-24" />
              ) : profile?.department && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-violet-500/12 text-violet-300 border border-violet-500/20">
                  {profile.department}
                </span>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Task stat cards */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard icon={ClipboardList} label="Total Tasks" value={loading ? '—' : tasks.length} color="indigo" delay={0} />
        <StatCard icon={Clock} label="Pending" value={loading ? '—' : pending} color="cyan" delay={0.05} />
        <StatCard icon={CheckCircle2} label="Completed" value={loading ? '—' : completed} color="emerald" delay={0.1} />
      </div>

      {/* Recent tasks */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">Recent Tasks</h3>
              <Button variant="ghost" size="sm" onClick={() => navigate('/my-tasks')}>View all</Button>
            </div>
          </CardHeader>
          <CardBody className="p-0">
            {loading ? (
              <div className="p-4 space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex gap-3 items-center">
                    <Skeleton className="w-8 h-8 rounded-lg" />
                    <div className="flex-1 space-y-1.5">
                      <Skeleton className="h-3 w-40" />
                      <Skeleton className="h-2.5 w-56" />
                    </div>
                  </div>
                ))}
              </div>
            ) : recentTasks.length === 0 ? (
              <div className="flex flex-col items-center py-12 text-center">
                <CheckSquare size={28} className="text-[var(--text-muted)] mb-2" />
                <p className="text-sm text-[var(--text-secondary)]">No tasks assigned yet</p>
              </div>
            ) : (
              <div>
                {recentTasks.map((task, i) => (
                  <motion.div
                    key={task.assignmentId}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.25 + i * 0.04 }}
                    className="flex items-center gap-3 px-5 py-3.5 border-b border-[var(--border)] last:border-0 hover:bg-[var(--bg-elevated)] transition-colors"
                  >
                    {/* Status icon */}
                    <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${
                      task.status === 'COMPLETED'
                        ? 'bg-emerald-500/10 border border-emerald-500/20'
                        : 'bg-cyan-500/10 border border-cyan-500/20'
                    }`}>
                      {task.status === 'COMPLETED'
                        ? <CheckCircle2 size={14} className="text-emerald-400" />
                        : <Clock size={14} className="text-cyan-400" />
                      }
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium truncate ${
                        task.status === 'COMPLETED'
                          ? 'line-through text-[var(--text-muted)]'
                          : 'text-[var(--text-primary)]'
                      }`}>
                        {task.title}
                      </p>
                      <p className="text-xs text-[var(--text-muted)] truncate">
                        From: {task.createdByName}
                        {task.dueDate && ` · Due ${task.dueDate}`}
                      </p>
                    </div>

                    {/* Status badge */}
                    {task.status === 'COMPLETED'
                      ? <Badge colorIndex={3}>Done</Badge>
                      : <Badge colorIndex={6}>Pending</Badge>
                    }
                  </motion.div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>
      </motion.div>

      {/* Profile summary card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">Your Profile</h3>
              <Button variant="ghost" size="sm" onClick={() => navigate('/settings')}>Edit</Button>
            </div>
          </CardHeader>
          <CardBody>
            {loading ? (
              <div className="space-y-3">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-4 w-64" />
                <Skeleton className="h-4 w-32" />
              </div>
            ) : (
              <div className="space-y-3">
                {[
                  { label: 'Full Name', value: user?.fullName },
                  { label: 'Email', value: user?.email },
                  { label: 'Role', value: user?.role },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-center gap-4">
                    <span className="text-xs font-medium text-[var(--text-muted)] w-24 flex-shrink-0">{label}</span>
                    <span className="text-sm text-[var(--text-primary)]">{value ?? '—'}</span>
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>
      </motion.div>
    </div>
  )
}

// ── Route component — picks dashboard by role ─────────────────────────────────
export function DashboardPage() {
  const { user } = useAuth()
  return user?.role === 'ADMIN' ? <AdminDashboard /> : <UserDashboard />
}