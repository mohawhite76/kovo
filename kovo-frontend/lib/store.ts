import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { User } from './types'

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  setAuth: (user: User, token: string) => void
  setUser: (user: User) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      setAuth: (user, token) => {
        localStorage.setItem('kovo_token', token)
        localStorage.setItem('kovo_user', JSON.stringify(user))
        set({ user, token, isAuthenticated: true })
      },
      setUser: (user) => {
        localStorage.setItem('kovo_user', JSON.stringify(user))
        set({ user })
      },
      logout: () => {
        localStorage.removeItem('kovo_token')
        localStorage.removeItem('kovo_user')
        set({ user: null, token: null, isAuthenticated: false })
      },
    }),
    {
      name: 'kovo-auth',
    }
  )
)

interface ThemeState {
  theme: 'light' | 'dark'
  toggleTheme: () => void
  setTheme: (theme: 'light' | 'dark') => void
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'light',
      toggleTheme: () =>
        set((state) => {
          const newTheme = state.theme === 'light' ? 'dark' : 'light'
          if (typeof window !== 'undefined') {
            document.documentElement.classList.toggle('dark', newTheme === 'dark')
          }
          return { theme: newTheme }
        }),
      setTheme: (theme) => {
        if (typeof window !== 'undefined') {
          document.documentElement.classList.toggle('dark', theme === 'dark')
        }
        set({ theme })
      },
    }),
    {
      name: 'kovo-theme',
    }
  )
)
