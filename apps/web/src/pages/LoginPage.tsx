import { useState } from 'react'
import type { FormEvent } from 'react'
import { EyeIcon, EyeSlashIcon, MoonIcon, SunIcon } from '@phosphor-icons/react'
import { request } from '../lib/api'
import { useWebTheme } from '../hooks/useWebTheme'

type LoginPageProps = {
  onLogin: () => void
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const { resolvedTheme, setPreference } = useWebTheme()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit(event: FormEvent) {
    event.preventDefault()
    setLoading(true)
    setError('')
    try {
      const result = await request<{ accessToken: string }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      })
      localStorage.setItem('findeat-business-token', result.accessToken)
      onLogin()
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'Could not sign in')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="login-page">
      <button
        type="button"
        className="login-theme-toggle"
        onClick={() => setPreference(resolvedTheme === 'dark' ? 'light' : 'dark')}
        aria-label={`Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} mode`}
        title={`Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} mode`}
      >
        {resolvedTheme === 'dark'
          ? <SunIcon size={19} weight="fill" />
          : <MoonIcon size={19} weight="fill" />}
      </button>
      <section className="login-card">
        <div className="login-brand">
          <span className="login-brand-mark">
            <img src="/findeat-favicon.svg" alt="" />
          </span>
          <strong>FindEat</strong>
        </div>
        <p className="eyebrow">FINDEAT FOR BUSINESS</p>
        <h1>Run your restaurant in one place.</h1>
        <p className="muted">Manage your public details and menus. Create official posts from the FindEat mobile app.</p>
        <form onSubmit={submit}>
          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              required
            />
          </label>
          <label>
            Password
            <span className="login-password-field">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter your password"
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((visible) => !visible)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword
                  ? <EyeSlashIcon size={19} />
                  : <EyeIcon size={19} />}
              </button>
            </span>
          </label>
          {error && <p className="error login-error" role="alert">{error}</p>}
          <button className="primary" disabled={loading}>{loading ? 'Signing in…' : 'Sign in'}</button>
        </form>
      </section>
    </main>
  )
}
