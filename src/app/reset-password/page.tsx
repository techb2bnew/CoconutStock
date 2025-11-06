'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabaseClient'
import Link from 'next/link'

export default function ResetPasswordPage() {
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const router = useRouter()

  const validateForm = (): boolean => {
    if (!newPassword.trim() || !confirmPassword.trim()) {
      setError('All fields are required.')
      return false
    }
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long.')
      return false
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.')
      return false
    }
    setError(null)
    return true
  }

  const handlePasswordReset = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!validateForm()) return

    setIsLoading(true)
    setError(null)
    setSuccessMessage(null)

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      })

      if (error) {
        setError(error.message)
        return
      }

      setSuccessMessage('Password reset successful! Redirecting to login...')
      setTimeout(() => {
        router.push('/login')
      }, 1500)
    } catch (err) {
      console.error('Password reset error:', err)
      setError('Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-[#f7fbff] to-[#eef4fb] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-[460px] rounded-2xl bg-white shadow-[0_20px_60px_rgba(16,24,40,0.08)] border border-slate-100 p-8">
        {/* Title */}
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold text-slate-900">Reset Password</h2>
          <p className="text-sm text-slate-600 mt-1">
            Enter your new password below.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handlePasswordReset} className="space-y-5">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              New Password <span className="text-rose-600">*</span>
            </label>
            <Input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
              className="h-12 rounded-lg border border-slate-300 focus-visible:ring-2 focus-visible:ring-sky-200 focus-visible:border-sky-500"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Confirm Password <span className="text-rose-600">*</span>
            </label>
            <Input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter new password"
              className="h-12 rounded-lg border border-slate-300 focus-visible:ring-2 focus-visible:ring-sky-200 focus-visible:border-sky-500"
            />
          </div>

          {error && <p className="text-xs text-rose-600">{error}</p>}
          {successMessage && <p className="text-xs text-green-600">{successMessage}</p>}

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-12 rounded-lg bg-[#00a1ff] hover:bg-[#0090e6] text-white text-base font-semibold"
          >
            {isLoading ? 'Updating…' : 'Reset Password'}
          </Button>
        </form>
        <div className="mt-4 text-center text-sm">
          Remembered your password?{' '}
          <Link href="/login" className="underline text-sky-600 hover:text-sky-700">
            Login
          </Link>
        </div>
      </div>
    </div>
  )
}
