'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Eye, EyeOff } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

import { supabase } from '@/lib/supabaseClient'
import Link from 'next/link'
import { useAppDispatch } from '../../redux/hooks'

interface LoginScreenProps {
  onStepChange?: (email?: string) => void
  onAuthSuccess?: (isNewUser?: boolean) => void
}

interface FormErrors {
  email?: string
  password?: string
}

export default function LoginPage({ onStepChange, onAuthSuccess }: LoginScreenProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})

  const dispatch = useAppDispatch()
  const router = useRouter()

  // Frontend validation function
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^\S+@\S+\.\S+$/.test(email)) {
      newErrors.email = 'Please enter a valid email'
    }

    if (!password.trim()) {
      newErrors.password = 'Password is required'
    }

    setErrors(newErrors)

    // Return true if no errors
    return Object.keys(newErrors).length === 0
  }

  const handleSignIn = async () => {
    if (!validateForm()) return // Don't continue if validation fails

    setIsLoading(true)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })

      if (error) {
        // Show error on email field (or you can customize)
        setErrors({ email: error.message })
        setIsLoading(false)
        return
      }

      if (data.user && data.session) {
        const authData = {
          user: data.user,
          token: data.session.access_token,
        }

        localStorage.setItem('coconut_auth', JSON.stringify(authData))
        document.cookie = `auth-token=${data.session.access_token}; path=/; max-age=604800; SameSite=Lax`

        window.dispatchEvent(new CustomEvent('userLoggedIn'))

        router.push('/admin/dashboard')
      }
    } catch (err) {
      console.error('Login error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    handleSignIn()
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-[#f7fbff] to-[#eef4fb] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-[460px] rounded-2xl bg-white shadow-[0_20px_60px_rgba(16,24,40,0.08)] border border-slate-100 p-8">
        {/* Brand */}
                    <div className="flex items-center gap-4 mb-6">
              {/* Image */}
              <div className="flex items-center justify-center rounded-full ring-4 ring-sky-100 overflow-hidden bg-white">
                <Image
                  src="/assests/logos/coconut.png"
                  alt="Brand"
                  width={100}
                  height={100}
                  className="object-contain p-2"
                />
              </div>

              {/* Text */}
              <div className="flex flex-col justify-center">
                <p className="text-sky-500 font-semibold leading-tight">Coconut Admin</p>
                <p className="text-[12px] text-slate-500 leading-none">
                  Multi-Location System
                </p>
              </div>
            </div>



        {/* Title */}
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold text-sky-500">Welcome Back</h2>
          <p className="text-sm text-slate-600 mt-1">
            Sign in to access your admin dashboard
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Email Address <span className="text-rose-600">*</span>
            </label>
            <Input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value.toLowerCase())
                if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }))
              }}
              placeholder="name@company.com"
              className={`h-12 rounded-lg border focus-visible:ring-2 focus-visible:ring-sky-200 focus-visible:border-sky-500 ${
                errors.email
                  ? 'border-rose-400 bg-rose-50 text-rose-700 placeholder:text-rose-400'
                  : 'border-slate-300'
              }`}
            />
            
          </div>

          {/* Password */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Password <span className="text-rose-600">*</span>
            </label>
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }))
                }}
                placeholder="Enter your password"
                className={`pr-10 h-12 rounded-lg border focus-visible:ring-2 focus-visible:ring-sky-200 focus-visible:border-sky-500 ${
                  errors.password
                    ? 'border-rose-400 bg-rose-50 text-rose-700 placeholder:text-rose-400'
                    : 'border-slate-300'
                }`}
              />
              {errors.email && <p className="mt-1 text-xs text-rose-600">{errors.email}</p>}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            {errors.password && <p className="mt-1 text-xs text-rose-600">{errors.password}</p>}
          </div>

          {/* Forgot Password */}
          <div className="flex items-center justify-end">
            <Link
              href="/forgot-password"
              className="text-sm font-medium text-sky-600 hover:text-sky-700 underline underline-offset-2"
            >
              Forgot Password?
            </Link>
          </div>

          {/* Submit */}
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-12 rounded-lg bg-[#00a1ff] hover:bg-[#0090e6] text-white text-base font-semibold"
          >
            {isLoading ? 'Signing in…' : 'Sign In'}
          </Button>
        </form>
        <div className="mt-4 text-center text-sm">
          Don't have an account?{' '}
          <Link href="/signup" className="underline">
            Signup
          </Link>
        </div>
      </div>
    </div>
  )
}
