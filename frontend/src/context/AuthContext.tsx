import { createContext, useContext, useEffect, useState } from 'react'
import { getMeApi, loginApi, signupApi } from '../api/authApi'

const TOKEN_KEY = 'joblens_token'

export interface AuthUser {
  email: string
  name: string | null
}

interface AuthContextValue {
  user: AuthUser | null
  token: string | null
  restoring: boolean
  /** Logs in and returns the authenticated user. Throws on bad credentials. */
  login: (email: string, password: string) => Promise<AuthUser>
  /** Creates the account. Does NOT log the user in — caller shows the toast and switches to login. Throws on duplicate email. */
  signup: (email: string, password: string, name?: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [restoring, setRestoring] = useState(true)

  // On mount: restore session from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(TOKEN_KEY)
    if (!stored) {
      setRestoring(false)
      return
    }
    getMeApi(stored)
      .then(me => {
        setToken(stored)
        setUser({ email: me.email, name: me.name })
      })
      .catch(() => localStorage.removeItem(TOKEN_KEY))
      .finally(() => setRestoring(false))
  }, [])

  const login = async (email: string, password: string): Promise<AuthUser> => {
    const res = await loginApi({ email, password })
    localStorage.setItem(TOKEN_KEY, res.token)
    setToken(res.token)
    const authed: AuthUser = { email: res.email, name: res.name }
    setUser(authed)
    return authed
  }

  const signup = async (email: string, password: string, name?: string): Promise<void> => {
    // Intentionally does NOT set auth state — user must explicitly log in after signup.
    await signupApi({ email, password, name })
  }

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY)
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, token, restoring, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
