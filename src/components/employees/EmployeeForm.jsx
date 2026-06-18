import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { ArrowLeft, Save, User } from 'lucide-react'
import { employeeService, departmentService } from '../../services/api'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Select } from '../ui/Select'
import { Card, CardBody, CardHeader } from '../ui/Card'

const schema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50),
  lastName: z.string().min(1, 'Last name is required').max(50),
  email: z.string().email('Enter a valid email'),
  departmentId: z.string().min(1, 'Select a department'),
})

const fieldVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.06, duration: 0.25 } }),
}

export function EmployeeForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = Boolean(id)

  const [departments, setDepartments] = useState([])
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(isEdit)

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  })

  useEffect(() => {
    departmentService.getAll().then(d =>
      setDepartments(d.map(dep => ({ value: String(dep.id), label: dep.departmentName })))
    )

    if (isEdit) {
      employeeService.getById(id)
        .then(emp => {
          reset({
            firstName: emp.firstName,
            lastName: emp.lastName,
            email: emp.email,
            departmentId: String(emp.departmentId ?? ''),
          })
        })
        .finally(() => setInitialLoading(false))
    }
  }, [id])

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      const payload = { ...data, departmentId: Number(data.departmentId) }
      if (isEdit) {
        await employeeService.update(id, payload)
        toast.success('Employee updated')
      } else {
        await employeeService.create(payload)
        toast.success('Employee added')
      }
      navigate('/employees')
    } catch (e) {
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
        <Button variant="ghost" size="sm" onClick={() => navigate('/employees')}>
          <ArrowLeft size={15} />
          Back
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
              <User size={16} className="text-indigo-400" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-[var(--text-primary)]">
                {isEdit ? 'Edit Employee' : 'Add New Employee'}
              </h2>
              <p className="text-xs text-[var(--text-muted)]">
                {isEdit ? 'Update employee information' : 'Fill in the details below'}
              </p>
            </div>
          </div>
        </CardHeader>

        <CardBody>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {[
              { name: 'firstName', label: 'First Name', placeholder: 'John', index: 0 },
              { name: 'lastName', label: 'Last Name', placeholder: 'Doe', index: 1 },
              { name: 'email', label: 'Email Address', placeholder: 'john.doe@company.com', type: 'email', index: 2 },
            ].map(({ name, label, placeholder, type = 'text', index }) => (
              <motion.div key={name} custom={index} variants={fieldVariants} initial="hidden" animate="visible">
                <Input
                  label={label}
                  placeholder={placeholder}
                  type={type}
                  error={errors[name]?.message}
                  {...register(name)}
                />
              </motion.div>
            ))}

            <motion.div custom={3} variants={fieldVariants} initial="hidden" animate="visible">
              <Select
                label="Department"
                placeholder="Select a department"
                options={departments}
                error={errors.departmentId?.message}
                {...register('departmentId')}
              />
            </motion.div>

            <motion.div custom={4} variants={fieldVariants} initial="hidden" animate="visible" className="pt-2">
              <Button type="submit" loading={loading} className="w-full">
                <Save size={15} />
                {isEdit ? 'Save Changes' : 'Add Employee'}
              </Button>
            </motion.div>
          </form>
        </CardBody>
      </Card>
    </motion.div>
  )
}
