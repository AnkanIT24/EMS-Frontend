import { createContext, useContext, useState, useCallback } from 'react'
import { authService } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => authService.getUser())

  const login = useCallback((authResponse) => {
    authService.saveSession(authResponse)
    setUser({ fullName: authResponse.fullName, email: authResponse.email, role: authResponse.role })
  }, [])

  const logout = useCallback(() => {
    authService.clearSession()
    setUser(null)
  }, [])

  const value = {
    user,
    isAuthenticated: Boolean(user) && authService.isAuthenticated(),
    login,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}