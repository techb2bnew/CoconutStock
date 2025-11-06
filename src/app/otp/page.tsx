'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { supabase } from '@/lib/supabaseClient'

export default function OtpPage() {
  const [otp, setOtp] = useState<string[]>(Array(6).fill(''))
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const inputRefs = useRef<HTMLInputElement[]>([])
  const router = useRouter()

  const email = 'user@example.com' // replace this or fetch dynamically (from params, state, etc.)

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return // allow only digits
    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)

    // move to next box if digit entered
    if (value && index < otp.length - 1) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (otp[index] === '') {
        if (index > 0) inputRefs.current[index - 1]?.focus()
      } else {
        const newOtp = [...otp]
        newOtp[index] = ''
        setOtp(newOtp)
      }
    }
  }

  const validateForm = (): boolean => {
    const otpValue = otp.join('')
    if (!otpValue) {
      setError('OTP is required')
      return false
    } else if (otpValue.length !== 6) {
      setError('OTP must be 6 digits')
      return false
    }
    setError(null)
    return true
  }

  const handleVerifyOtp = async () => {
    if (!validateForm()) return

    setIsLoading(true)
    setError(null)
    setSuccessMessage(null)

    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token: otp.join(''),
        type: 'email',
      })

      if (error) {
        setError(error.message)
        return
      }

      setSuccessMessage('OTP verified successfully! Redirecting...')
      setTimeout(() => {
        router.push('/reset-password')
      }, 1500)
    } catch (err) {
      console.error('OTP verification error:', err)
      setError('Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    handleVerifyOtp()
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-[#f7fbff] to-[#eef4fb] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-[460px] rounded-2xl bg-white shadow-[0_20px_60px_rgba(16,24,40,0.08)] border border-slate-100 p-8">
        {/* Title */}
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold text-slate-900">Enter OTP</h2>
          <p className="text-sm text-slate-600 mt-1">
            Check your email for the One-Time Password.
          </p>
        </div>

        {/* OTP Boxes */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="mb-5">
            <div className="flex gap-4 justify-center">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => {
                    if (el) inputRefs.current[index] = el
                  }}
                  type="text"
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className={`w-12 h-[60px] text-center text-[28px] font-medium border rounded-[10px] transition-all ${
                    digit
                      ? 'border-gray-900 text-gray-900'
                      : 'border-[rgba(17,24,39,0.2)] text-gray-700'
                  } focus:outline-none focus:border-[#00a1ff]`}
                  maxLength={1}
                />
              ))}
            </div>
            <div className="mt-3 text-center text-xs text-slate-500">
              Tip: You can use Backspace to move to the previous box.
            </div>
            {error && <p className="mt-2 text-xs text-rose-600 text-center">{error}</p>}
            {successMessage && (
              <p className="mt-2 text-xs text-green-600 text-center">{successMessage}</p>
            )}
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-12 rounded-lg bg-[#00a1ff] hover:bg-[#0090e6] text-white text-base font-semibold"
          >
            {isLoading ? 'Verifying…' : 'Verify OTP'}
          </Button>
        </form>

        <div className="mt-4 text-center text-sm">
          Didn&apos;t receive an OTP?{' '}
          <Link href="#" className="underline text-sky-600 hover:text-sky-700">
            Resend
          </Link>
        </div>
      </div>
    </div>
  )
}
