import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Mail, Lock, UserPlus, User, Building2 } from 'lucide-react'
import { authService, departmentService } from '../services/api'
import { useAuth } from '../hooks/AuthContext'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Select } from '../components/ui/Select'
import { Card, CardBody, CardHeader } from '../components/ui/Card'

const schema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(1, 'Confirm your password'),
  role: z.enum(['USER', 'ADMIN'], { errorMap: () => ({ message: 'Select a role' }) }),
  departmentId: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
}).refine((data) => {
  if (data.role === 'USER' && !data.departmentId) return false
  return true
}, {
  message: 'Department is required for User accounts',
  path: ['departmentId'],
})

const fieldVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.06, duration: 0.25 } }),
}

export function RegisterPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [loading, setLoading] = useState(false)
  const [departments, setDepartments] = useState([])

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  })

  const selectedRole = watch('role')

  useEffect(() => {
    // Fetch departments for the dropdown (public endpoint not needed — handle gracefully)
    departmentService.getAll()
      .then(setDepartments)
      .catch(() => setDepartments([]))
  }, [])

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      const payload = {
        fullName: data.fullName,
        email: data.email,
        password: data.password,
        role: data.role,
        ...(data.role === 'USER' && data.departmentId && {
          departmentId: Number(data.departmentId)
        }),
      }
      const response = await authService.register(payload)
      login(response)
      toast.success('Account created successfully')
      navigate('/', { replace: true })
    } catch (e) {
      const message = e.response?.data?.message || 'Registration failed. Please try again.'
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-base)] px-4">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md"
      >
        <Card>
          <CardHeader className="flex flex-col items-center gap-1 py-8">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/12 border border-indigo-500/20 flex items-center justify-center mb-2">
              <UserPlus size={18} className="text-indigo-400" />
            </div>
            <h1 className="text-lg font-bold text-[var(--text-primary)]">Create an account</h1>
            <p className="text-xs text-[var(--text-secondary)]">Get started with your EMS dashboard</p>
          </CardHeader>

          <CardBody>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <motion.div custom={0} initial="hidden" animate="visible" variants={fieldVariants}>
                <Input
                  label="Full Name"
                  type="text"
                  icon={User}
                  placeholder="Jane Doe"
                  error={errors.fullName?.message}
                  {...register('fullName')}
                />
              </motion.div>

              <motion.div custom={1} initial="hidden" animate="visible" variants={fieldVariants}>
                <Input
                  label="Email"
                  type="email"
                  icon={Mail}
                  placeholder="you@example.com"
                  error={errors.email?.message}
                  {...register('email')}
                />
              </motion.div>

              <motion.div custom={2} initial="hidden" animate="visible" variants={fieldVariants}>
                <Select
                  label="Role"
                  placeholder="Select a role"
                  options={[
                    { value: 'USER', label: 'User' },
                    { value: 'ADMIN', label: 'Admin' },
                  ]}
                  error={errors.role?.message}
                  {...register('role')}
                />
              </motion.div>

              {/* Department — only shown for USER role */}
              {selectedRole === 'USER' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  custom={3}
                  variants={fieldVariants}
                >
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider flex items-center gap-1.5">
                      <Building2 size={11} />
                      Department *
                    </label>
                    <select
                      {...register('departmentId')}
                      className="w-full px-3 py-2.5 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/15 transition-all"
                    >
                      <option value="">— Select your department —</option>
                      {departments.map(d => (
                        <option key={d.id} value={d.id}>{d.departmentName}</option>
                      ))}
                    </select>
                    {errors.departmentId && (
                      <p className="text-xs text-red-400">⚠ {errors.departmentId.message}</p>
                    )}
                  </div>
                </motion.div>
              )}

              <motion.div custom={4} initial="hidden" animate="visible" variants={fieldVariants}>
                <Input
                  label="Password"
                  type="password"
                  icon={Lock}
                  placeholder="At least 6 characters"
                  error={errors.password?.message}
                  {...register('password')}
                />
              </motion.div>

              <motion.div custom={5} initial="hidden" animate="visible" variants={fieldVariants}>
                <Input
                  label="Confirm Password"
                  type="password"
                  icon={Lock}
                  placeholder="••••••••"
                  error={errors.confirmPassword?.message}
                  {...register('confirmPassword')}
                />
              </motion.div>

              <motion.div custom={6} initial="hidden" animate="visible" variants={fieldVariants}>
                <Button type="submit" variant="primary" className="w-full" loading={loading}>
                  {loading ? 'Creating account...' : 'Create account'}
                </Button>
              </motion.div>
            </form>

            <p className="mt-6 text-center text-xs text-[var(--text-secondary)]">
              Already have an account?{' '}
              <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-medium">
                Sign in
              </Link>
            </p>
          </CardBody>
        </Card>
      </motion.div>
    </div>
  )
}