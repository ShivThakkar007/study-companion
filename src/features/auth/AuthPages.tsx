import {
  useEffect,
  useState,
  type FormEvent,
  type InputHTMLAttributes,
  type ReactNode,
} from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from './useAuth'

function AuthFrame({ title, children }: { title: string; children: ReactNode }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f8f9fc] px-4 py-10">
      <section className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-7 shadow-sm sm:p-9">
        <Link to="/" className="text-sm font-semibold text-violet-700">
          Study Companion
        </Link>
        <h1 className="mt-7 text-2xl font-semibold tracking-tight">{title}</h1>
        {children}
      </section>
    </main>
  )
}

function Field({
  label,
  ...props
}: { label: string } & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block text-sm font-medium text-slate-700">
      {label}
      <input
        {...props}
        className="mt-1.5 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
      />
    </label>
  )
}

export function AuthPage({ mode }: { mode: 'login' | 'signup' }) {
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [busy, setBusy] = useState(false)
  const navigate = useNavigate()
  const signup = mode === 'signup'
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setBusy(true)
    setError('')
    setNotice('')
    const values = new FormData(event.currentTarget)
    const email = String(values.get('email')).trim()
    const password = String(values.get('password'))
    const result = signup
      ? await supabase.auth.signUp({
          email,
          password,
          options: { data: { display_name: String(values.get('name')).trim() } },
        })
      : await supabase.auth.signInWithPassword({ email, password })
    setBusy(false)
    if (result.error) {
      setError(result.error.message)
      return
    }
    if (signup && !result.data.session)
      setNotice('Check your email to confirm your account, then sign in.')
    else navigate('/', { replace: true })
  }
  return (
    <AuthFrame title={signup ? 'Create your account' : 'Welcome back'}>
      <p className="mt-2 text-sm text-slate-500">
        {signup
          ? 'Start building a study rhythm that works for you.'
          : 'Sign in to continue to your learning space.'}
      </p>
      <form onSubmit={submit} className="mt-7 space-y-4">
        {signup && (
          <Field
            label="Display name"
            name="name"
            required
            maxLength={80}
            autoComplete="name"
          />
        )}
        <Field label="Email" name="email" type="email" required autoComplete="email" />
        <Field
          label="Password"
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete={signup ? 'new-password' : 'current-password'}
        />
        {error && (
          <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">
            {error}
          </p>
        )}
        {notice && (
          <p
            role="status"
            className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800"
          >
            {notice}
          </p>
        )}
        <button
          disabled={busy}
          className="button-primary w-full disabled:cursor-wait disabled:opacity-60"
        >
          {busy ? 'Please wait…' : signup ? 'Create account' : 'Sign in'}
        </button>
      </form>
      <div className="mt-5 flex justify-between text-sm">
        <Link
          className="text-violet-700 hover:underline"
          to={signup ? '/login' : '/recover'}
        >
          {signup ? 'Already have an account?' : 'Forgot password?'}
        </Link>
        <Link
          className="text-violet-700 hover:underline"
          to={signup ? '/login' : '/signup'}
        >
          {signup ? 'Sign in' : 'Create account'}
        </Link>
      </div>
    </AuthFrame>
  )
}

export function RecoverPage() {
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage('')
    setError('')
    const email = String(new FormData(event.currentTarget).get('email')).trim()
    const { error: requestError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/recover`,
    })
    if (requestError) setError(requestError.message)
    else
      setMessage('If an account exists for that address, a recovery email is on its way.')
  }
  return (
    <AuthFrame title="Reset your password">
      <p className="mt-2 text-sm text-slate-500">
        We’ll send a password recovery link to your email.
      </p>
      <form onSubmit={submit} className="mt-7 space-y-4">
        <Field label="Email" name="email" type="email" required autoComplete="email" />
        {error && (
          <p role="alert" className="text-sm text-red-700">
            {error}
          </p>
        )}
        {message && (
          <p role="status" className="text-sm text-emerald-800">
            {message}
          </p>
        )}
        <button className="button-primary w-full">Send recovery link</button>
      </form>
      <Link className="mt-5 block text-sm text-violet-700" to="/login">
        Back to sign in
      </Link>
    </AuthFrame>
  )
}

export function RecoveryPasswordPage() {
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setBusy(true)
    setError('')
    const password = String(new FormData(event.currentTarget).get('password'))
    const { error: updateError } = await supabase.auth.updateUser({ password })
    setBusy(false)
    if (updateError) setError(updateError.message)
    else setMessage('Password updated. You can now sign in with your new password.')
  }
  return (
    <AuthFrame title="Choose a new password">
      <p className="mt-2 text-sm text-slate-500">
        Enter a new password for your account.
      </p>
      <form onSubmit={submit} className="mt-7 space-y-4">
        <Field
          label="New password"
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
        />
        {error && (
          <p role="alert" className="text-sm text-red-700">
            {error}
          </p>
        )}
        {message && (
          <p role="status" className="text-sm text-emerald-800">
            {message}
          </p>
        )}
        <button disabled={busy} className="button-primary w-full">
          {busy ? 'Updating…' : 'Update password'}
        </button>
      </form>
    </AuthFrame>
  )
}

export function ProfilePage() {
  const { user } = useAuth()
  const [name, setName] = useState('')
  const [zone, setZone] = useState(
    Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
  )
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    let active = true
    if (user)
      supabase
        .from('profiles')
        .select('display_name,time_zone')
        .eq('id', user.id)
        .maybeSingle()
        .then(({ data, error: queryError }) => {
          if (!active) return
          if (queryError) setError(queryError.message)
          if (data) {
            setName(data.display_name)
            setZone(data.time_zone)
          }
          setLoading(false)
        })
    return () => {
      active = false
    }
  }, [user])
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!user) return
    setError('')
    setStatus('')
    const { error: saveError } = await supabase
      .from('profiles')
      .upsert(
        { id: user.id, display_name: name.trim(), time_zone: zone },
        { onConflict: 'id' },
      )
    if (saveError) setError(saveError.message)
    else setStatus('Profile saved.')
  }
  async function logout() {
    const { error: signOutError } = await supabase.auth.signOut()
    if (signOutError) setError(signOutError.message)
  }
  if (loading) return <div className="p-10 text-sm text-slate-500">Loading profile…</div>
  return (
    <section className="mx-auto max-w-3xl px-5 py-10 sm:px-8">
      <h1 className="text-3xl font-semibold">Your profile</h1>
      <p className="mt-2 text-sm text-slate-500">
        Manage your name and time zone preferences.
      </p>
      <form
        onSubmit={submit}
        className="mt-8 space-y-5 rounded-2xl border border-slate-200 bg-white p-6"
      >
        <p className="text-sm text-slate-500">{user?.email}</p>
        <Field
          label="Display name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          maxLength={80}
          required
        />
        <Field
          label="Time zone"
          value={zone}
          onChange={(event) => setZone(event.target.value)}
          maxLength={64}
          required
          placeholder="e.g. Asia/Kolkata"
        />
        {error && (
          <p role="alert" className="text-sm text-red-700">
            {error}
          </p>
        )}
        {status && (
          <p role="status" className="text-sm text-emerald-800">
            {status}
          </p>
        )}
        <div className="flex flex-wrap gap-3">
          <button className="button-primary">Save profile</button>
          <button
            type="button"
            onClick={logout}
            className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Sign out
          </button>
        </div>
      </form>
    </section>
  )
}
