"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Moon, Sun, Bell, BellOff, Shield, FileText, Scale, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { useAuthStore, useThemeStore } from "@/lib/store"
import Link from "next/link"

export default function SettingsPage() {
  const router = useRouter()
  const user = useAuthStore((state) => state.user)
  const theme = useThemeStore((state) => state.theme)
  const toggleTheme = useThemeStore((state) => state.toggleTheme)
  const [mounted, setMounted] = useState(false)
  const [notificationsEnabled, setNotificationsEnabled] = useState(false)
  const [notificationsLoading, setNotificationsLoading] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted && !user) {
      router.push('/login')
    }
  }, [mounted, user, router])

  useEffect(() => {
    const checkNotificationStatus = async () => {
      if (typeof window !== 'undefined' && window.OneSignal) {
        try {
          const permission = await window.OneSignal.Notifications.permissionNative
          setNotificationsEnabled(permission === 'granted')
        } catch (err) {
          console.error('Error checking notification status:', err)
        }
      }
    }
    checkNotificationStatus()
  }, [])

  const handleToggleNotifications = async () => {
    if (typeof window === 'undefined' || !window.OneSignal) return

    setNotificationsLoading(true)
    try {
      if (notificationsEnabled) {
        await window.OneSignal.User.PushSubscription.optOut()
        setNotificationsEnabled(false)
      } else {
        const permission = await window.OneSignal.Notifications.requestPermission()
        setNotificationsEnabled(permission === true)
      }
    } catch (err) {
      console.error('Error toggling notifications:', err)
    } finally {
      setNotificationsLoading(false)
    }
  }

  if (!mounted || !user) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded-2xl w-1/3" />
          <div className="h-48 bg-muted rounded-2xl" />
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-2xl">
      <div className="space-y-4 mb-6">
        <h1 className="text-4xl md:text-5xl font-bold">Paramètres</h1>
        <p className="text-lg text-muted-foreground">Personnalisez votre expérience Kovo</p>
      </div>

      <div className="space-y-4">
        {/* Apparence */}
        <div className="bg-card rounded-2xl shadow-sm border p-6">
          <h2 className="text-xl font-semibold mb-4">Apparence</h2>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {theme === 'dark' ? (
                <Moon className="size-5 text-muted-foreground" />
              ) : (
                <Sun className="size-5 text-muted-foreground" />
              )}
              <div>
                <p className="font-medium">Thème {theme === 'dark' ? 'sombre' : 'clair'}</p>
                <p className="text-sm text-muted-foreground">
                  Basculer entre le mode clair et sombre
                </p>
              </div>
            </div>
            <Switch
              checked={theme === 'dark'}
              onCheckedChange={toggleTheme}
            />
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-card rounded-2xl shadow-sm border p-6">
          <h2 className="text-xl font-semibold mb-4">Notifications</h2>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {notificationsEnabled ? (
                <Bell className="size-5 text-muted-foreground" />
              ) : (
                <BellOff className="size-5 text-muted-foreground" />
              )}
              <div>
                <p className="font-medium">Notifications push</p>
                <p className="text-sm text-muted-foreground">
                  Recevez des alertes pour vos trajets et messages
                </p>
              </div>
            </div>
            <Switch
              checked={notificationsEnabled}
              onCheckedChange={handleToggleNotifications}
              disabled={notificationsLoading}
            />
          </div>
        </div>

        {/* Confidentialité et légal */}
        <div className="bg-card rounded-2xl shadow-sm border p-6">
          <h2 className="text-xl font-semibold mb-4">Confidentialité et légal</h2>
          <div className="space-y-3">
            <Link href="/legal/privacy">
              <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                <div className="flex items-center gap-3">
                  <Shield className="size-5 text-muted-foreground" />
                  <p className="font-medium">Politique de confidentialité</p>
                </div>
                <ChevronRight className="size-5 text-muted-foreground" />
              </div>
            </Link>

            <Link href="/legal/terms">
              <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                <div className="flex items-center gap-3">
                  <FileText className="size-5 text-muted-foreground" />
                  <p className="font-medium">Conditions générales d'utilisation</p>
                </div>
                <ChevronRight className="size-5 text-muted-foreground" />
              </div>
            </Link>

            <Link href="/legal/mentions">
              <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                <div className="flex items-center gap-3">
                  <Scale className="size-5 text-muted-foreground" />
                  <p className="font-medium">Mentions légales</p>
                </div>
                <ChevronRight className="size-5 text-muted-foreground" />
              </div>
            </Link>
          </div>
        </div>

        {/* Version */}
        <div className="bg-card rounded-2xl shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Version de l'application</p>
              <p className="text-sm text-muted-foreground">Kovo v1.0.0</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
