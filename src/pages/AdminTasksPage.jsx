import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ClipboardList, Plus, Trash2, CheckCircle, Clock, Users, Building2, Globe, Pencil, Lock } from 'lucide-react'
import { taskService, departmentService, employeeService } from '../services/api'
import { Card, CardHeader, CardBody } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { StatCard } from '../components/ui/StatCard'
import { Skeleton } from '../components/ui/Skeleton'
import { Pagination } from '../components/ui/Pagination'

const PAGE_SIZE = 20

const ASSIGNMENT_TYPES = [
  { value: 'USER', label: 'Specific User', icon: Users },
  { value: 'DEPARTMENT', label: 'Whole Department', icon: Building2 },
  { value: 'ALL', label: 'Everyone', icon: Globe },
]

const EMPTY_FORM = {
  title: '',
  description: '',
  dueDate: '',
  assignmentType: 'USER',
  assignedUserId: '',
  assignedDepartmentId: '',
}

function StatusBadge({ status }) {
  return status === 'COMPLETED'
    ? <Badge colorIndex={3} className="gap-1"><CheckCircle size={10} />Completed</Badge>
    : <Badge colorIndex={6} className="gap-1"><Clock size={10} />Pending</Badge>
}

function AssignmentBadge({ type }) {
  const map = {
    USER: { label: 'User', idx: 0 },
    DEPARTMENT: { label: 'Department', idx: 1 },
    ALL: { label: 'Everyone', idx: 2 }
  }
  const m = map[type] ?? { label: type, idx: 0 }
  return <Badge colorIndex={m.idx}>{m.label}</Badge>
}

function TaskForm({ form, setForm, users, departments, onSubmit, onCancel, submitting, isEdit }) {
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="border-b border-[var(--border)] overflow-hidden"
    >
      <form onSubmit={onSubmit} className="p-6 space-y-4 bg-[var(--bg-elevated)]/40">
        <p className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
          {isEdit ? 'Edit Task' : 'Assign New Task'}
        </p>
        <div className="grid grid-cols-2 gap-4">

          {/* Title */}
          <div className="col-span-2">
            <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">Title *</label>
            <input
              required
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder="Task title"
              className="w-full px-3 py-2 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-indigo-500/50"
            />
          </div>

          {/* Description */}
          <div className="col-span-2">
            <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">Description</label>
            <textarea
              rows={2}
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="Optional description"
              className="w-full px-3 py-2 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-indigo-500/50 resize-none"
            />
          </div>

          {/* Due date */}
          <div>
            <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">Due Date</label>
            <input
              type="date"
              value={form.dueDate}
              onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-indigo-500/50"
            />
          </div>

          {/* Assignment type — locked on edit */}
          <div>
            <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
              Assign To {isEdit && <span className="text-[var(--text-muted)] normal-case font-normal">(locked on edit)</span>}
            </label>
            <select
              value={form.assignmentType}
              disabled={isEdit}
              onChange={e => setForm(f => ({ ...f, assignmentType: e.target.value, assignedUserId: '', assignedDepartmentId: '' }))}
              className="w-full px-3 py-2 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-indigo-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {ASSIGNMENT_TYPES.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          {/* Specific user */}
          {form.assignmentType === 'USER' && !isEdit && (
            <div className="col-span-2">
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">Select User *</label>
              <select
                required
                value={form.assignedUserId}
                onChange={e => setForm(f => ({ ...f, assignedUserId: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-indigo-500/50"
              >
                <option value="">— Select a user —</option>
                {users.map(u => (
                  <option key={u.id} value={u.id}>{u.fullName} ({u.email})</option>
                ))}
              </select>
            </div>
          )}

          {/* Department */}
          {form.assignmentType === 'DEPARTMENT' && !isEdit && (
            <div className="col-span-2">
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">Select Department *</label>
              <select
                required
                value={form.assignedDepartmentId}
                onChange={e => setForm(f => ({ ...f, assignedDepartmentId: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-indigo-500/50"
              >
                <option value="">— Select a department —</option>
                {departments.map(d => (
                  <option key={d.id} value={d.id}>{d.departmentName}</option>
                ))}
              </select>
            </div>
          )}

          {/* ALL */}
          {form.assignmentType === 'ALL' && !isEdit && (
            <div className="col-span-2">
              <p className="text-xs text-[var(--text-muted)] bg-[var(--bg-elevated)] rounded-lg px-3 py-2 border border-[var(--border)]">
                This task will be assigned to every user in the system.
              </p>
            </div>
          )}
        </div>

        <div className="flex gap-2 pt-1">
          <Button type="submit" loading={submitting} size="sm">
            {isEdit ? 'Save Changes' : 'Assign Task'}
          </Button>
          <Button type="button" variant="secondary" size="sm" onClick={onCancel}>Cancel</Button>
        </div>
      </form>
    </motion.div>
  )
}

export function AdminTasksPage() {
  const [tasks, setTasks] = useState([])
  const [users, setUsers] = useState([])
  const [departments, setDepartments] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingTaskId, setEditingTaskId] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [editForm, setEditForm] = useState(EMPTY_FORM)
  const [page, setPage] = useState(1)

  useEffect(() => { fetchAll() }, [])

  async function fetchAll() {
    setLoading(true)
    try {
      const [t, d] = await Promise.all([
        taskService.getAllTasks(),
        departmentService.getAll(),
      ])
      setTasks(t)
      setDepartments(d)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    employeeService.getAll()
      .then(employees => setUsers(employees.map(e => ({
        id: e.userId,
        fullName: `${e.firstName} ${e.lastName}`,
        email: e.email,
      }))))
      .catch(() => setUsers([]))
  }, [])

  function openEdit(task) {
    setEditingTaskId(task.taskId)
    setEditForm({
      title: task.title,
      description: task.description ?? '',
      dueDate: task.dueDate ?? '',
      assignmentType: task.assignmentType,
      assignedUserId: '',
      assignedDepartmentId: '',
    })
    setShowCreateForm(false)
  }

  function closeEdit() {
    setEditingTaskId(null)
    setEditForm(EMPTY_FORM)
  }

  async function handleCreate(e) {
    e.preventDefault()
    setSubmitting(true)
    try {
      const payload = {
        title: form.title,
        description: form.description,
        assignmentType: form.assignmentType,
        ...(form.dueDate && { dueDate: form.dueDate }),
        ...(form.assignmentType === 'USER' && { assignedUserId: Number(form.assignedUserId) }),
        ...(form.assignmentType === 'DEPARTMENT' && { assignedDepartmentId: Number(form.assignedDepartmentId) }),
      }
      await taskService.createTask(payload)
      setShowCreateForm(false)
      setForm(EMPTY_FORM)
      setPage(1)
      await fetchAll()
    } catch (e) {
      console.error(e)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleEdit(e) {
    e.preventDefault()
    setSubmitting(true)
    try {
      await taskService.updateTask(editingTaskId, {
        title: editForm.title,
        description: editForm.description,
        ...(editForm.dueDate && { dueDate: editForm.dueDate }),
      })
      closeEdit()
      await fetchAll()
    } catch (e) {
      console.error(e)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(taskId) {
    setDeleting(taskId)
    try {
      await taskService.deleteTask(taskId)
      setTasks(prev => prev.filter(t => t.taskId !== taskId))
    } catch (e) {
      console.error(e)
    } finally {
      setDeleting(null)
    }
  }

  const total = tasks.length
  const completed = tasks.filter(t => t.status === 'COMPLETED').length
  const pending = tasks.filter(t => t.status === 'PENDING').length
  const totalPages = Math.ceil(tasks.length / PAGE_SIZE)
  const paged = tasks.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <div className="space-y-6">

      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard icon={ClipboardList} label="Total Assignments" value={loading ? '—' : total} color="indigo" delay={0} />
        <StatCard icon={Clock} label="Pending" value={loading ? '—' : pending} color="cyan" delay={0.05} />
        <StatCard icon={CheckCircle} label="Completed" value={loading ? '—' : completed} color="emerald" delay={0.1} />
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-[var(--text-primary)]">All Assigned Tasks</h3>
            <Button size="sm" onClick={() => { setShowCreateForm(v => !v); closeEdit() }}>
              <Plus size={13} />
              {showCreateForm ? 'Cancel' : 'Assign Task'}
            </Button>
          </div>
        </CardHeader>

        {/* Create form */}
        <AnimatePresence>
          {showCreateForm && (
            <TaskForm
              form={form}
              setForm={setForm}
              users={users}
              departments={departments}
              onSubmit={handleCreate}
              onCancel={() => { setShowCreateForm(false); setForm(EMPTY_FORM) }}
              submitting={submitting}
              isEdit={false}
            />
          )}
        </AnimatePresence>

        {/* Task list */}
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
              <ClipboardList size={32} className="text-[var(--text-muted)] mb-3" />
              <p className="text-sm text-[var(--text-secondary)]">No tasks assigned yet</p>
              <Button size="sm" className="mt-3" onClick={() => setShowCreateForm(true)}>
                <Plus size={13} /> Assign first task
              </Button>
            </div>
          ) : (
            <div>
              {paged.map((task, i) => {
                const isCompleted = task.status === 'COMPLETED'
                const isEditingThis = editingTaskId === task.taskId

                return (
                  <div key={task.assignmentId}>
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.03 }}
                      className="flex items-start gap-4 px-6 py-4 border-b border-[var(--border)] last:border-0 hover:bg-[var(--bg-elevated)] transition-colors"
                    >
                      {/* Icon */}
                      <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mt-0.5">
                        <ClipboardList size={14} className="text-indigo-400" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <p className="text-sm font-medium text-[var(--text-primary)]">{task.title}</p>
                          <StatusBadge status={task.status} />
                          <AssignmentBadge type={task.assignmentType} />
                        </div>
                        {task.description && (
                          <p className="text-xs text-[var(--text-muted)] mb-1.5 line-clamp-1">{task.description}</p>
                        )}
                        <div className="flex items-center gap-3 flex-wrap">
                          <span className="text-xs text-[var(--text-muted)]">
                            Assigned to: <span className="text-[var(--text-secondary)]">
                              {task.assignedUserName ?? task.assignedDepartmentName ?? 'Everyone'}
                            </span>
                          </span>
                          {task.dueDate && (
                            <span className="text-xs text-[var(--text-muted)]">
                              Due: <span className="text-[var(--text-secondary)]">{task.dueDate}</span>
                            </span>
                          )}
                          <span className="text-xs text-[var(--text-muted)]">
                            By: <span className="text-[var(--text-secondary)]">{task.createdByName}</span>
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {isCompleted ? (
                          <div
                            title="Cannot edit a completed task"
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[var(--text-muted)] border border-[var(--border)] cursor-not-allowed opacity-50"
                          >
                            <Lock size={12} />
                            Locked
                          </div>
                        ) : (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => isEditingThis ? closeEdit() : openEdit(task)}
                          >
                            <Pencil size={13} />
                            {isEditingThis ? 'Cancel' : 'Edit'}
                          </Button>
                        )}

                        <Button
                          variant="danger"
                          size="sm"
                          loading={deleting === task.taskId}
                          onClick={() => handleDelete(task.taskId)}
                        >
                          <Trash2 size={13} />
                        </Button>
                      </div>
                    </motion.div>

                    {/* Inline edit form */}
                    <AnimatePresence>
                      {isEditingThis && (
                        <TaskForm
                          form={editForm}
                          setForm={setEditForm}
                          users={users}
                          departments={departments}
                          onSubmit={handleEdit}
                          onCancel={closeEdit}
                          submitting={submitting}
                          isEdit={true}
                        />
                      )}
                    </AnimatePresence>
                  </div>
                )
              })}

              {/* Pagination */}
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