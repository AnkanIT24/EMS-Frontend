import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { Plus, Building2, Pencil, Trash2, Search } from 'lucide-react'
import { departmentService } from '../../services/api'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { ConfirmDialog } from '../ui/ConfirmDialog'
import { TableSkeleton } from '../ui/Skeleton'
import { Card } from '../ui/Card'
import { debounce } from '../../lib/utils'
import { Pagination } from '../ui/Pagination'

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
        <Building2 size={22} className="text-[var(--text-muted)]" />
      </div>
      <p className="text-sm font-medium text-[var(--text-secondary)]">
        {query ? `No departments matching "${query}"` : 'No departments yet'}
      </p>
      <p className="text-xs text-[var(--text-muted)] mt-1">
        {query ? 'Try a different search' : 'Create your first department'}
      </p>
    </motion.div>
  )
}

export function DepartmentList() {
  const navigate = useNavigate()
  const [departments, setDepartments] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [page, setPage] = useState(1)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    departmentService.getAll()
      .then(setDepartments)
      .finally(() => setLoading(false))
  }, [])

  const handleSearchChange = useCallback(
    debounce((val) => { setDebouncedSearch(val); setPage(1) }, 300),
    []
  )

  const filtered = departments.filter(d =>
    d.departmentName?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
    d.departmentDescription?.toLowerCase().includes(debouncedSearch.toLowerCase())
  )

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await departmentService.delete(deleteTarget.id)
      setDepartments(prev => prev.filter(d => d.id !== deleteTarget.id))
      toast.success(`${deleteTarget.departmentName} deleted`)
      setDeleteTarget(null)
    } catch {
      toast.error('Failed to delete department')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <>
      <div className="flex items-center justify-between mb-5">
        <p className="text-xs text-[var(--text-muted)]">
          {loading ? '...' : `${filtered.length} department${filtered.length !== 1 ? 's' : ''}`}
        </p>
        <div className="flex items-center gap-3">
          <div className="w-56">
            <Input
              placeholder="Search departments…"
              icon={Search}
              value={search}
              onChange={e => { setSearch(e.target.value); handleSearchChange(e.target.value) }}
            />
          </div>
          <Button onClick={() => navigate('/departments/new')}>
            <Plus size={15} />
            New Department
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
              <TableSkeleton rows={departments.length || 6} cols={3} lastColWidth={70} />
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
                      {['Department', 'Description', 'Actions'].map(col => (
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
                          <td colSpan={3}><EmptyState query={debouncedSearch} /></td>
                        </tr>
                      ) : (
                        paged.map((dept, i) => (
                          <motion.tr
                            key={dept.id}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8, height: 0 }}
                            transition={{ duration: 0.4, delay: i * 0.05, ease: 'easeOut' }}
                            className="border-b border-[var(--border)] hover:bg-[var(--bg-elevated)] transition-colors duration-300 group last:border-0"
                          >
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center flex-shrink-0">
                                  <Building2 size={14} className="text-violet-400" />
                                </div>
                                <div>
                                  <p className="font-medium text-[var(--text-primary)]">{dept.departmentName}</p>
                                  <p className="text-[10px] text-[var(--text-muted)]">ID #{dept.id}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-5 py-4 text-[var(--text-secondary)] max-w-xs">
                              <p className="truncate">{dept.departmentDescription}</p>
                            </td>
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button variant="ghost" size="sm" onClick={() => navigate(`/departments/edit/${dept.id}`)}>
                                  <Pencil size={13} />
                                  Edit
                                </Button>
                                <Button variant="danger" size="sm" onClick={() => setDeleteTarget(dept)}>
                                  <Trash2 size={13} />
                                </Button>
                              </div>
                            </td>
                          </motion.tr>
                        ))
                      )}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={setPage}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </Card>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete Department"
        message={`Delete "${deleteTarget?.departmentName}"? All associated employees will lose their department assignment.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </>
  )
}