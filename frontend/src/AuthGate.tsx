
import { useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'

import { supabase } from './lib/supabase'
import LoginPage from './LoginPage'
import App from './App'
import type { Role } from './demoData'

type Profile = {
  display_name: string
  role: 'hr_manager' | 'hr_officer' | 'employee'
}

function getAppRole(role: Profile['role']): Role {
  if (role === 'hr_manager') return 'HR Manager'
  if (role === 'hr_officer') return 'HR Officer'
  return 'Employee'
}

export default function AuthGate() {
  const [session, setSession] = useState<Session | null>(null)
  const [checkingSession, setCheckingSession] = useState(true)

  const [profile, setProfile] = useState<Profile | null>(null)
  const [profileError, setProfileError] = useState('')

  // Check whether a user is logged in
  useEffect(() => {
    let active = true

    supabase.auth.getSession().then(({ data }) => {
      if (active) {
        setSession(data.session)
        setCheckingSession(false)
      }
    }).catch(() => {
      if (active) setCheckingSession(false)
    })

    const { data: { subscription } } =
      supabase.auth.onAuthStateChange((_event, nextSession) => {
        if (active) {
          setSession(nextSession)
          setCheckingSession(false)
        }
      })

    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [])

  // Read the logged-in user's assigned role
  useEffect(() => {
    if (!session) {
      setProfile(null)
      setProfileError('')
      return
    }

    let active = true

    setProfile(null)
    setProfileError('')

    async function loadProfile() {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('display_name, role')
        .eq('id', session!.user.id)
        .single()

      if (!active) return

      if (error || !data) {
        setProfileError(
          'Your account has no assigned application role. Contact the project administrator.'
        )
      } else {
        setProfile(data as Profile)
      }
    }

    void loadProfile()

    return () => {
      active = false
    }
  }, [session?.user.id])

  if (checkingSession) {
    return <p style={{ padding: 30 }}>Checking your session...</p>
  }

  if (!session) {
    return <LoginPage />
  }

  if (profileError) {
    return (
      <div style={{ padding: 30 }}>
        <h2>Account access pending</h2>
        <p>{profileError}</p>
        <button onClick={() => void supabase.auth.signOut()}>
          Log out
        </button>
      </div>
    )
  }

  if (!profile) {
    return <p style={{ padding: 30 }}>Loading your HR profile...</p>
  }

  return (
    <App
      userName={profile.display_name}
      userRole={getAppRole(profile.role)}
      onLogout={() => void supabase.auth.signOut()}
    />
  )
}
