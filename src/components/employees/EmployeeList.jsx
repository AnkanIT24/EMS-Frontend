import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { Plus, Search, Pencil, Trash2, Users, ChevronLeft, ChevronRight } from 'lucide-react'
import { employeeService, departmentService } from '../../services/api'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { ConfirmDialog } from '../ui/ConfirmDialog'
import { TableSkeleton } from '../ui/Skeleton'
import { Badge } from '../ui/Badge'
import { Card, CardHeader, CardBody } from '../ui/Card'
import { debounce } from '../../lib/utils'

const PAGE_SIZE = 20

function EmptyState({ query }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="flex flex-col items-center py-16 text-center"
    >
      <div className="w-14 h-14 rounded-full bg-[var(--bg-overlay)] flex items-center justify-center mb-4">
        <Users size={22} className="text-[var(--text-muted)]" />
      </div>
      <p className="text-sm font-medium text-[var(--text-secondary)]">
        {query ? `No employees matching "${query}"` : 'No employees yet'}
      </p>
      <p className="text-xs text-[var(--text-muted)] mt-1">
        {query ? 'Try a different search' : 'Add your first employee to get started'}
      </p>
    </motion.div>
  )
}

export function EmployeeList() {
  const navigate = useNavigate()
  const [employees, setEmployees] = useState([])
  const [departments, setDepartments] = useState({})
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [page, setPage] = useState(1)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    Promise.all([employeeService.getAll(), departmentService.getAll()])
      .then(([emps, deps]) => {
        setEmployees(emps)
        const map = {}
        deps.forEach((d, i) => { map[d.id] = { name: d.departmentName, index: i } })
        setDepartments(map)
      })
      .finally(() => setLoading(false))
  }, [])

  const handleSearchChange = useCallback(
    debounce((val) => { setDebouncedSearch(val); setPage(1) }, 300),
    []
  )

  const filtered = employees.filter(e => {
    const q = debouncedSearch.toLowerCase()
    return (
      e.firstName?.toLowerCase().includes(q) ||
      e.lastName?.toLowerCase().includes(q) ||
      e.email?.toLowerCase().includes(q)
    )
  })

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await employeeService.delete(deleteTarget.id)
      setEmployees(prev => prev.filter(e => e.id !== deleteTarget.id))
      toast.success(`${deleteTarget.firstName} ${deleteTarget.lastName} removed`)
      setDeleteTarget(null)
    } catch {
      toast.error('Failed to delete employee')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <>
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="text-xs text-[var(--text-muted)]">
            {loading ? '...' : `${filtered.length} employee${filtered.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-56">
            <Input
              placeholder="Search employees…"
              icon={Search}
              onChange={(e) => { setSearch(e.target.value); handleSearchChange(e.target.value) }}
              value={search}
            />
          </div>
          <Button onClick={() => navigate('/employees/new')}>
            <Plus size={15} />
            Add Employee
          </Button>
        </div>
      </div>

      <Card>
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="skeleton"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
            >
              <TableSkeleton rows={employees.length || 6} cols={5} lastColWidth={70} />
            </motion.div>
          ) : (
            <motion.div
              key="table"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            >
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[var(--border)]">
                      {['Name', 'Email', 'Department', 'Actions'].map(col => (
                        <th key={col} className="px-5 py-3.5 text-left text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <AnimatePresence initial={true}>
                      {paged.length === 0 ? (
                        <tr>
                          <td colSpan={4}><EmptyState query={debouncedSearch} /></td>
                        </tr>
                      ) : (
                        paged.map((emp, i) => {
                          const dept = departments[emp.departmentId]
                          return (
                            <motion.tr
                              key={emp.id}
                              initial={{ opacity: 0, y: 12 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -8, height: 0 }}
                              transition={{ duration: 0.4, delay: i * 0.05, ease: 'easeOut' }}
                              className="border-b border-[var(--border)] hover:bg-[var(--bg-elevated)] transition-colors duration-300 group"
                            >
                              <td className="px-5 py-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500/30 to-violet-500/30 border border-indigo-500/20 flex items-center justify-center text-xs font-bold text-indigo-300 flex-shrink-0">
                                    {emp.firstName?.[0]}{emp.lastName?.[0]}
                                  </div>
                                  <div>
                                    <p className="font-medium text-[var(--text-primary)]">
                                      {emp.firstName} {emp.lastName}
                                    </p>
                                    <p className="text-[11px] text-[var(--text-muted)]">ID #{emp.id}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-5 py-4 text-[var(--text-secondary)]">{emp.email}</td>
                              <td className="px-5 py-4">
                                {dept ? (
                                  <Badge colorIndex={dept.index}>{dept.name}</Badge>
                                ) : (
                                  <span className="text-[var(--text-muted)] text-xs">—</span>
                                )}
                              </td>
                              <td className="px-5 py-4">
                                <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => navigate(`/employees/edit/${emp.id}`)}
                                  >
                                    <Pencil size={13} />
                                    Edit
                                  </Button>
                                  <Button
                                    variant="danger"
                                    size="sm"
                                    onClick={() => setDeleteTarget(emp)}
                                  >
                                    <Trash2 size={13} />
                                  </Button>
                                </div>
                              </td>
                            </motion.tr>
                          )
                        })
                      )}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-5 py-3.5 border-t border-[var(--border)]">
                  <p className="text-xs text-[var(--text-muted)]">
                    Page {page} of {totalPages}
                  </p>
                  <div className="flex gap-1.5">
                    <Button variant="secondary" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
                      <ChevronLeft size={13} />
                    </Button>
                    <Button variant="secondary" size="sm" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>
                      <ChevronRight size={13} />
                    </Button>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </Card>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete Employee"
        message={`Are you sure you want to remove ${deleteTarget?.firstName} ${deleteTarget?.lastName}? This action cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </>
  )
}