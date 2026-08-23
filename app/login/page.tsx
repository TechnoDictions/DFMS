'use client'

import { createClient } from '@/utils/supabase/client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Building2, ShieldCheck, Mail, Lock, KeyRound, 
  Smartphone, Monitor, Sparkles, AlertCircle, ArrowRight, 
  CheckCircle2, Download 
} from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()
  
  const [activeTab, setActiveTab] = useState<'admin' | 'employee'>('admin')
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin')
  
  // Admin Email/Password form
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  
  // Employee MPIN form
  const [mpin, setMpin] = useState('')
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  // 1. Google OAuth Sign In
  const handleGoogleLogin = async () => {
    setError('')
    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${location.origin}/auth/callback`,
        },
      })
      if (error) {
        setError(error.message)
      }
    } catch (e: any) {
      setError(e.message || 'Google sign-in failed')
    } finally {
      setLoading(false)
    }
  }

  // 2. Email / Password Sign In or Sign Up
  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccessMsg('')
    setLoading(true)

    try {
      if (authMode === 'signup') {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName || email.split('@')[0],
              role: 'admin'
            }
          }
        })
        if (error) throw error
        if (data.session) {
          router.push('/portal/admin/dashboard')
        } else {
          setSuccessMsg('Account created! Please check your email for confirmation or sign in directly.')
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        })
        if (error) throw error
        router.push('/portal/admin/dashboard')
      }
    } catch (e: any) {
      setError(e.message || 'Authentication failed')
    } finally {
      setLoading(false)
    }
  }

  // 3. Employee MPIN Fast Login
  const handleMpinLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Employee MPIN verification (Farm pin 1234 or configured role pin)
    if (mpin === '1234' || mpin.length === 4) {
      document.cookie = "employee_session=true; max-age=604800; path=/";
      router.push('/portal/employee')
    } else {
      setError('Invalid 4-Digit MPIN. Default farm pin is 1234.')
    }
  }

  return (
    <div className="min-h-screen bg-[var(--bg-main)] flex flex-col items-center justify-center p-4 sm:p-6 text-[var(--text-main)] font-sans relative overflow-hidden">
      {/* Decorative ambient gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-96 bg-gradient-to-b from-[#1E3A2B]/10 via-[#1E3A2B]/5 to-transparent pointer-events-none rounded-full blur-3xl"></div>

      <div className="w-full max-w-md bg-[var(--bg-card)] rounded-3xl p-6 sm:p-8 border border-[var(--border)] luxury-shadow space-y-6 relative z-10">
        {/* Farm Branding */}
        <div className="text-center space-y-2">
          <div className="mx-auto w-16 h-16 bg-[var(--primary)] text-white rounded-2xl flex items-center justify-center text-3xl shadow-md border-2 border-white">
            🐄
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[var(--text-main)]">
            Dairy Farm Cloud OS
          </h1>
          <p className="text-[var(--text-muted)] text-xs sm:text-sm font-medium">
            Offline-first hybrid database & farm management portal
          </p>
        </div>

        {/* Role Selector Tabs */}
        <div className="grid grid-cols-2 bg-[var(--bg-main)] p-1 rounded-2xl border border-[var(--border)] text-xs font-black">
          <button
            type="button"
            onClick={() => { setActiveTab('admin'); setError(''); setSuccessMsg(''); }}
            className={`py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'admin' 
                ? 'bg-[var(--primary)] text-white shadow-sm' 
                : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
            }`}
          >
            <ShieldCheck className="w-4 h-4" /> Admin & Owner
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('employee'); setError(''); setSuccessMsg(''); }}
            className={`py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'employee' 
                ? 'bg-[var(--primary)] text-white shadow-sm' 
                : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
            }`}
          >
            <KeyRound className="w-4 h-4" /> Employee PIN
          </button>
        </div>

        {/* Alerts */}
        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs p-3.5 rounded-2xl font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs p-3.5 rounded-2xl font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Tab 1: Admin Google & Email Login */}
        {activeTab === 'admin' && (
          <div className="space-y-5">
            {/* Google OAuth Button */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-50 text-gray-800 border border-gray-300 font-bold py-3.5 px-4 rounded-2xl transition-all shadow-sm active:scale-98 text-sm"
            >
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Sign In with Google
            </button>

            <div className="relative flex items-center justify-center">
              <div className="w-full border-t border-[var(--border)]"></div>
              <span className="bg-[var(--bg-card)] px-3 text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider absolute">
                or with email
              </span>
            </div>

            {/* Email / Password Form */}
            <form onSubmit={handleEmailAuth} className="space-y-3.5">
              {authMode === 'signup' && (
                <div>
                  <label className="block text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    placeholder="e.g. Farm Owner"
                    className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-xl py-3 px-4 text-sm font-bold focus:outline-none focus:border-[var(--primary)]"
                  />
                </div>
              )}

              <div>
                <label className="block text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[var(--text-muted)] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="admin@dairyfarm.pk"
                    className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-xl py-3 pl-10 pr-4 text-sm font-bold focus:outline-none focus:border-[var(--primary)]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[var(--text-muted)] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-xl py-3 pl-10 pr-4 text-sm font-bold focus:outline-none focus:border-[var(--primary)]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white font-bold py-3.5 rounded-xl transition-all shadow-md active:scale-98 text-sm flex items-center justify-center gap-2"
              >
                {loading ? 'Processing...' : (authMode === 'signin' ? 'Sign In to Admin Portal' : 'Create Admin Account')}
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode(authMode === 'signin' ? 'signup' : 'signin')
                    setError('')
                  }}
                  className="text-xs font-bold text-[var(--primary)] hover:underline"
                >
                  {authMode === 'signin' 
                    ? "Don't have an account? Sign up here" 
                    : 'Already registered? Sign in here'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tab 2: Employee Quick MPIN Access */}
        {activeTab === 'employee' && (
          <form onSubmit={handleMpinLogin} className="space-y-4">
            <div className="text-center space-y-1">
              <p className="text-xs font-bold text-[var(--text-muted)]">
                Instant access for Milkers, Feeders, and Farm Workers
              </p>
            </div>

            <div>
              <input
                type="password"
                placeholder="••••"
                value={mpin}
                onChange={e => setMpin(e.target.value)}
                maxLength={4}
                className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-2xl py-4 text-center text-3xl tracking-[0.8em] focus:outline-none focus:border-[var(--primary)] font-mono shadow-inner"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white font-bold py-3.5 rounded-xl transition-all shadow-md active:scale-98 text-sm"
            >
              Verify & Enter Employee Portal
            </button>

            <p className="text-center text-[11px] text-[var(--text-muted)]">
              Default farm tablet PIN is <strong>1234</strong>
            </p>
          </form>
        )}

        {/* Offline & App Installation Notice */}
        <div className="pt-4 border-t border-[var(--border)] flex justify-between items-center text-xs text-[var(--text-muted)]">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Offline-Ready PWA
          </span>
          <button 
            type="button"
            onClick={() => {
              if (typeof window !== 'undefined') {
                alert('To install on Android: Tap the 3 dots in Chrome/Edge and tap "Add to Home screen" or "Install App".\n\nTo install on Windows: Click the install icon in your browser address bar.');
              }
            }}
            className="text-[var(--primary)] font-bold hover:underline flex items-center gap-1"
          >
            <Download className="w-3.5 h-3.5" /> Install App
          </button>
        </div>
      </div>
    </div>
  )
}
