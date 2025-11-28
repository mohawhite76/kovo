import OneSignal from 'react-onesignal'

class OneSignalService {
  private initialized = false

  async initialize() {
    if (this.initialized || typeof window === 'undefined') {
      return
    }

    const appId = process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID

    if (!appId) {
      console.warn('OneSignal App ID not found')
      return
    }

    try {
      await OneSignal.init({
        appId,
        allowLocalhostAsSecureOrigin: true,
      })

      this.initialized = true
      console.log('OneSignal initialized')
    } catch (error) {
      console.error('OneSignal initialization error:', error)
    }
  }

  async setExternalUserId(userId: string) {
    if (!this.initialized) {
      await this.initialize()
    }

    try {
      // @ts-ignore
      if (OneSignal.login) {
        await OneSignal.login(userId)
      }
      console.log('OneSignal external user ID set:', userId)
    } catch (error) {
      console.error('Error setting OneSignal external user ID:', error)
    }
  }

  async removeExternalUserId() {
    if (!this.initialized) {
      return
    }

    try {
      // @ts-ignore
      if (OneSignal.logout) {
        await OneSignal.logout()
      }
      console.log('OneSignal external user ID removed')
    } catch (error) {
      console.error('Error removing OneSignal external user ID:', error)
    }
  }

  async requestPermission() {
    if (!this.initialized) {
      await this.initialize()
    }

    try {
      const permission = await OneSignal.Notifications.requestPermission()
      console.log('OneSignal notification permission:', permission)
      return permission
    } catch (error) {
      console.error('Error requesting OneSignal permission:', error)
      return false
    }
  }

  async getPermissionStatus() {
    if (!this.initialized) {
      return false
    }

    try {
      return await OneSignal.Notifications.permission
    } catch (error) {
      console.error('Error getting OneSignal permission status:', error)
      return false
    }
  }
}

export const oneSignalService = new OneSignalService()
