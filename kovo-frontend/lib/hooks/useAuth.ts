import { useEffect } from 'react'
import { useAuthStore } from '../store'
import { socketService, oneSignalService } from '../services'

export const useAuth = () => {
  const { user, token, isAuthenticated, setAuth, setUser, logout } = useAuthStore()

  useEffect(() => {
    if (isAuthenticated && token && user) {
      socketService.connect(token)
      oneSignalService.initialize().then(() => {
        oneSignalService.setExternalUserId(user.id)
      })
    } else {
      socketService.disconnect()
      oneSignalService.removeExternalUserId()
    }

    return () => {
      socketService.disconnect()
    }
  }, [isAuthenticated, token, user])

  const handleLogout = () => {
    socketService.disconnect()
    oneSignalService.removeExternalUserId()
    logout()
  }

  return {
    user,
    token,
    isAuthenticated,
    setAuth,
    setUser,
    logout: handleLogout,
  }
}
