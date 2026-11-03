
import { useState, type FormEvent } from 'react'
import { supabase } from './lib/supabase'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    setLoading(true)
    setError('')

    const { error: loginError } =
      await supabase.auth.signInWithPassword({
        email,
        password
      })

    if (loginError) {
      setError(loginError.message)
    }

    setLoading(false)
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'grid',
      placeItems: 'center',
      background: '#f2f6fb',
      padding: 24
    }}>
      <form
        onSubmit={handleLogin}
        style={{
          width: '100%',
          maxWidth: 410,
          background: 'white',
          padding: 36,
          borderRadius: 18,
          boxShadow: '0 12px 35px rgba(20,40,70,0.12)'
        }}
      >
        <div style={{ fontSize: 38, marginBottom: 10 }}>
          🛡️
        </div>

        <h1 style={{
          color: '#102340',
          marginBottom: 8
        }}>
          AI Data Guardian
        </h1>

        <p style={{
          color: '#6b7890',
          marginBottom: 28
        }}>
          Sign in to your HR Data Quality Platform
        </p>

        <label htmlFor="login-email">
          Email address
        </label>

        <input
          id="login-email"
          type="email"
          required
          autoComplete="username"
          placeholder="Enter your email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          style={{
            display: 'block',
            width: '100%',
            boxSizing: 'border-box',
            padding: 12,
            marginTop: 8,
            marginBottom: 20,
            borderRadius: 8,
            border: '1px solid #cbd5e1'
          }}
        />

        <label htmlFor="login-password">
          Password
        </label>

        <input
          id="login-password"
          type="password"
          required
          autoComplete="current-password"
          placeholder="Enter your password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          style={{
            display: 'block',
            width: '100%',
            boxSizing: 'border-box',
            padding: 12,
            marginTop: 8,
            marginBottom: 20,
            borderRadius: 8,
            border: '1px solid #cbd5e1'
          }}
        />

        {error && (
          <p role="alert" style={{
            color: '#c62828',
            marginBottom: 16
          }}>
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: 13,
            border: 0,
            borderRadius: 8,
            background: '#2563eb',
            color: 'white',
            fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          {loading ? 'Signing in...' : 'Sign in'}
        </button>

        <p style={{
          marginTop: 24,
          fontSize: 12,
          textAlign: 'center',
          color: '#8b97aa'
        }}>
          Authorized HR personnel only
        </p>
      </form>
    </div>
  )
}
