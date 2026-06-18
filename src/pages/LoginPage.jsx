import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { toast } from 'sonner'
import { Mail, Lock, LogIn, AlertCircle } from 'lucide-react'
import { authService } from '../services/api'
import { useAuth } from '../hooks/AuthContext'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Card, CardBody, CardHeader } from '../components/ui/Card'

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
})

const fieldVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.06, duration: 0.25 } }),
}

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data) => {
    setLoading(true)
    setErrorMsg('')
    try {
      const response = await authService.login(data)
      login(response)
      toast.success(`Welcome back, ${response.fullName ?? response.email}!`)
      const redirectTo = location.state?.from?.pathname || '/'
      navigate(redirectTo, { replace: true })
    } catch (e) {
      const message = e.response?.data?.message || 'Invalid email or password'
      setErrorMsg(message)
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
              <LogIn size={18} className="text-indigo-400" />
            </div>
            <h1 className="text-lg font-bold text-[var(--text-primary)]">Welcome back</h1>
            <p className="text-xs text-[var(--text-secondary)]">Sign in to access your EMS dashboard</p>
          </CardHeader>

          <CardBody>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

              {/* Inline error alert */}
              <AnimatePresence>
                {errorMsg && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: 'auto' }}
                    exit={{ opacity: 0, y: -8, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg bg-red-500/10 border border-red-500/25 text-red-400"
                  >
                    <AlertCircle size={14} className="flex-shrink-0" />
                    <p className="text-xs font-medium">{errorMsg}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.div custom={0} initial="hidden" animate="visible" variants={fieldVariants}>
                <Input
                  label="Email"
                  type="email"
                  icon={Mail}
                  placeholder="you@example.com"
                  error={errors.email?.message}
                  {...register('email')}
                />
              </motion.div>

              <motion.div custom={1} initial="hidden" animate="visible" variants={fieldVariants}>
                <Input
                  label="Password"
                  type="password"
                  icon={Lock}
                  placeholder="••••••••"
                  error={errors.password?.message}
                  {...register('password')}
                />
              </motion.div>

              <motion.div custom={2} initial="hidden" animate="visible" variants={fieldVariants}>
                <Button type="submit" variant="primary" className="w-full" loading={loading}>
                  {loading ? 'Signing in...' : 'Log in'}
                </Button>
              </motion.div>
            </form>

            <p className="mt-6 text-center text-xs text-[var(--text-secondary)]">
              Don't have an account?{' '}
              <Link to="/register" className="text-indigo-400 hover:text-indigo-300 font-medium">
                Create one
              </Link>
            </p>
          </CardBody>
        </Card>
      </motion.div>
    </div>
  )
}