import { createContext } from 'react'
import type { Session, User } from '@supabase/supabase-js'

export type AuthValue = {
  session: Session | null
  user: User | null
  loading: boolean
  error: string | null
}

export const AuthContext = createContext<AuthValue | null>(null)
