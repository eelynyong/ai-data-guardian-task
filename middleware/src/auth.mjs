import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_PUBLISHABLE_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    'Missing Supabase configuration. Check middleware/.env'
  )
}

const supabaseAuth = createClient(
  supabaseUrl,
  supabaseKey,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  }
)

// Step 1: Verify that the user is logged in.
export async function requireAuth(req, res, next) {
  const authorization = req.headers.authorization || ''

  const match = authorization.match(/^Bearer\s+(\S+)$/i)

  if (!match) {
    return res.status(401).json({
      ok: false,
      error: 'Please sign in first.'
    })
  }

  const token = match[1]

  try {
    const { data, error } =
      await supabaseAuth.auth.getUser(token)

    if (error || !data.user) {
      return res.status(401).json({
        ok: false,
        error: 'Invalid or expired login session.'
      })
    }

    req.authUser = data.user
    req.accessToken = token

    return next()
  } catch {
    return res.status(503).json({
      ok: false,
      error: 'Authentication service is unavailable.'
    })
  }
}

// Step 2: Verify that the user is HR.
export async function requireHr(req, res, next) {
  if (!req.authUser || !req.accessToken) {
    return res.status(401).json({
      ok: false,
      error: 'Authentication required.'
    })
  }

  try {
    // Use this request's user token when checking the profile.
    // This allows Supabase Row Level Security to apply.
    const userSupabase = createClient(
      supabaseUrl,
      supabaseKey,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false
        },
        global: {
          headers: {
            Authorization: `Bearer ${req.accessToken}`
          }
        }
      }
    )

    const { data: profile, error } = await userSupabase
      .from('user_profiles')
      .select('role')
      .eq('id', req.authUser.id)
      .maybeSingle()

    if (error) {
      return res.status(500).json({
        ok: false,
        error: 'Unable to verify HR permissions.'
      })
    }

    const allowedRoles = ['hr_manager', 'hr_officer']

    if (!profile || !allowedRoles.includes(profile.role)) {
      return res.status(403).json({
        ok: false,
        error: 'HR access is required.'
      })
    }

    return next()
  } catch {
    return res.status(503).json({
      ok: false,
      error: 'Permission verification is unavailable.'
    })
  }
}