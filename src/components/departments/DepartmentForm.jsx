import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { ArrowLeft, Save, Building2 } from 'lucide-react'
import { departmentService } from '../../services/api'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Card, CardBody, CardHeader } from '../ui/Card'

const schema = z.object({
  departmentName: z.string().min(1, 'Department name is required').max(100),
  departmentDescription: z.string().min(1, 'Description is required').max(500),
})

const fieldVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.25 } }),
}

export function DepartmentForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = Boolean(id)
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(isEdit)

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  })

  useEffect(() => {
    if (isEdit) {
      departmentService.getById(id)
        .then(d => reset({ departmentName: d.departmentName, departmentDescription: d.departmentDescription }))
        .finally(() => setInitialLoading(false))
    }
  }, [id])

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      if (isEdit) {
        await departmentService.update(id, data)
        toast.success('Department updated')
      } else {
        await departmentService.create(data)
        toast.success('Department created')
      }
      navigate('/departments')
    } catch {
      toast.error('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="max-w-xl"
    >
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="sm" onClick={() => navigate('/departments')}>
          <ArrowLeft size={15} />
          Back
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
              <Building2 size={16} className="text-violet-400" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-[var(--text-primary)]">
                {isEdit ? 'Edit Department' : 'Create Department'}
              </h2>
              <p className="text-xs text-[var(--text-muted)]">
                {isEdit ? 'Update department details' : 'Set up a new department'}
              </p>
            </div>
          </div>
        </CardHeader>

        <CardBody>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <motion.div custom={0} variants={fieldVariants} initial="hidden" animate="visible">
              <Input
                label="Department Name"
                placeholder="e.g. Engineering"
                error={errors.departmentName?.message}
                {...register('departmentName')}
              />
            </motion.div>

            <motion.div custom={1} variants={fieldVariants} initial="hidden" animate="visible">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                  Description
                </label>
                <textarea
                  rows={4}
                  placeholder="Describe what this department does…"
                  className="w-full rounded-lg px-3 py-2.5 text-sm transition-all duration-150 outline-none resize-none bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-indigo-500/60 focus:ring-2 focus:ring-indigo-500/15"
                  {...register('departmentDescription')}
                />
                {errors.departmentDescription && (
                  <p className="text-xs text-red-400">⚠ {errors.departmentDescription.message}</p>
                )}
              </div>
            </motion.div>

            <motion.div custom={2} variants={fieldVariants} initial="hidden" animate="visible" className="pt-2">
              <Button type="submit" loading={loading} className="w-full">
                <Save size={15} />
                {isEdit ? 'Save Changes' : 'Create Department'}
              </Button>
            </motion.div>
          </form>
        </CardBody>
      </Card>
    </motion.div>
  )
}
