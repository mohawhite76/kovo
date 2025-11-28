"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { LogOut, Edit, Car, Package, CreditCard, FileText, CheckCircle, XCircle, Clock, Trash2, ChevronRight, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { AccountDeleteDialog } from "@/components/shared/account-delete-dialog"
import { useAuthStore } from "@/lib/store"
import { authAPI, userAPI } from "@/lib/api"

export default function ProfilePage() {
  const router = useRouter()
  const user = useAuthStore((state) => state.user)
  const setUser = useAuthStore((state) => state.setUser)
  const logout = useAuthStore((state) => state.logout)
  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [deleteAccountDialogOpen, setDeleteAccountDialogOpen] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted && !user) {
      router.push('/login')
    }
  }, [mounted, user, router])

  useEffect(() => {
    const refreshUserData = async () => {
      if (mounted && user) {
        try {
          const { data } = await authAPI.getProfile()
          setUser(data.user)
        } catch (err) {
          console.error('Error refreshing user data:', err)
        }
      }
    }
    refreshUserData()
  }, [mounted])

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  const handleDeleteAccountClick = () => {
    setDeleteAccountDialogOpen(true)
  }

  const handleDeleteAccountConfirm = async (password: string) => {
    setLoading(true)
    setError("")

    try {
      await userAPI.deleteAccount(password)
      setDeleteAccountDialogOpen(false)
      logout()
      router.push('/')
    } catch (err: any) {
      setError(err.response?.data?.error || "Erreur lors de la suppression du compte")
      setDeleteAccountDialogOpen(false)
    } finally {
      setLoading(false)
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
        <h1 className="text-4xl md:text-5xl font-bold">Votre profil</h1>
        <p className="text-lg text-muted-foreground">Gérez vos informations et paramètres Kovo</p>
      </div>

      {error && (
        <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md mb-4">
          {error}
        </div>
      )}

      <div className="space-y-6">
        <div className="bg-card rounded-2xl shadow-sm border p-6 hover:shadow-md transition-shadow">
          <div className="space-y-6">
            <div className="flex flex-col items-center gap-4">
              <Avatar className="size-24 ring-4 ring-primary/10">
                <AvatarImage src={user.avatar} />
                <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                  {user.first_name[0]}{user.last_name[0]}
                </AvatarFallback>
              </Avatar>

              <div className="text-center">
                <h2 className="text-2xl font-bold">
                  {user.first_name} {user.last_name}
                </h2>
                <p className="text-muted-foreground mt-1 font-medium">{user.university}</p>
                <p className="text-sm text-muted-foreground mt-1">{user.email}</p>
                {user.phone && (
                  <p className="text-sm text-muted-foreground">{user.phone}</p>
                )}
                {user.student_id && (
                  <p className="text-xs text-muted-foreground mt-2 bg-muted px-3 py-1 rounded-full inline-block">
                    N° étudiant: {user.student_id}
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <Button variant="outline" asChild className="h-12 hover:bg-primary/5 hover:border-primary/50">
                <Link href="/profile/edit">
                  <Edit className="size-4 mr-2" />
                  Modifier le profil
                </Link>
              </Button>
              <Button variant="outline" asChild className="h-12 hover:bg-primary/5 hover:border-primary/50">
                <Link href="/settings">
                  <Settings className="size-4 mr-2" />
                  Paramètres
                </Link>
              </Button>
              <Button
                variant="outline"
                onClick={handleLogout}
                className="h-12 hover:bg-muted"
              >
                <LogOut className="size-4 mr-2" />
                Se déconnecter
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteAccountClick}
                disabled={loading}
                className="h-12"
              >
                <Trash2 className="size-4 mr-2" />
                Supprimer le compte
              </Button>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-3">Documents et vérifications</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link href="/profile/license">
              <div className="bg-card rounded-2xl shadow-sm border p-6 hover:shadow-lg hover:border-primary/50 transition-all cursor-pointer group">
                <div className="flex items-center gap-4">
                  <div className="size-14 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <CreditCard className="size-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">Permis de conduire</h3>
                    <p className="text-sm text-muted-foreground">
                      {user.drivers_license_verified && '✓ Vérifié'}
                      {user.drivers_license_number && !user.drivers_license_verified && '⏳ En attente de vérification'}
                      {!user.drivers_license_number && 'À renseigner'}
                    </p>
                  </div>
                  {user.drivers_license_verified && (
                    <CheckCircle className="size-5 text-green-600" />
                  )}
                  {user.drivers_license_number && !user.drivers_license_verified && (
                    <Clock className="size-5 text-yellow-600" />
                  )}
                  {!user.drivers_license_number && (
                    <ChevronRight className="size-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                  )}
                </div>
              </div>
            </Link>

            <Link href="/profile/vehicle">
              <div className="bg-card rounded-2xl shadow-sm border p-6 hover:shadow-lg hover:border-primary/50 transition-all cursor-pointer group">
                <div className="flex items-center gap-4">
                  <div className="size-14 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <Car className="size-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">Véhicule</h3>
                    <p className="text-sm text-muted-foreground">
                      {user.vehicle_brand && user.vehicle_model ?
                        `${user.vehicle_brand} ${user.vehicle_model}${user.vehicle_plate ? ` - ${user.vehicle_plate}` : ''}` :
                        'À renseigner'}
                    </p>
                  </div>
                  {user.vehicle_brand && user.vehicle_model && user.vehicle_plate ? (
                    <CheckCircle className="size-5 text-green-600" />
                  ) : (
                    <ChevronRight className="size-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                  )}
                </div>
              </div>
            </Link>

            <Link href="/profile/verification">
              <div className="bg-card rounded-2xl shadow-sm border p-6 hover:shadow-lg hover:border-primary/50 transition-all cursor-pointer md:col-span-2 group">
                <div className="flex items-center gap-4">
                  <div className="size-14 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <FileText className="size-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">Vérification étudiant</h3>
                    <p className="text-sm text-muted-foreground">
                      {user.student_verification_status === 'approved' && '✓ Compte étudiant vérifié'}
                      {user.student_verification_status === 'pending' && user.student_card_photo && '⏳ En cours de vérification'}
                      {user.student_verification_status === 'rejected' && '✗ Vérification refusée - Réessayer'}
                      {(!user.student_verification_status || !user.student_card_photo) && 'Vérifiez votre statut étudiant'}
                    </p>
                  </div>
                  {user.student_verification_status === 'approved' && (
                    <CheckCircle className="size-5 text-green-600" />
                  )}
                  {user.student_verification_status === 'pending' && user.student_card_photo && (
                    <Clock className="size-5 text-yellow-600" />
                  )}
                  {user.student_verification_status === 'rejected' && (
                    <XCircle className="size-5 text-red-600" />
                  )}
                  {(!user.student_verification_status || !user.student_card_photo) && (
                    <ChevronRight className="size-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                  )}
                </div>
              </div>
            </Link>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-3">Votre activité</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link href="/my-trips">
              <div className="bg-card rounded-2xl shadow-sm border p-6 hover:shadow-lg hover:border-primary/50 transition-all cursor-pointer group">
                <div className="flex items-center gap-4">
                  <div className="size-14 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <Car className="size-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">Vos trajets</h3>
                    <p className="text-sm text-muted-foreground">Trajets que vous proposez</p>
                  </div>
                  <ChevronRight className="size-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>

            <Link href="/bookings">
              <div className="bg-card rounded-2xl shadow-sm border p-6 hover:shadow-lg hover:border-primary/50 transition-all cursor-pointer group">
                <div className="flex items-center gap-4">
                  <div className="size-14 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <Package className="size-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">Vos réservations</h3>
                    <p className="text-sm text-muted-foreground">Trajets que vous avez réservés</p>
                  </div>
                  <ChevronRight className="size-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>

      <AccountDeleteDialog
        open={deleteAccountDialogOpen}
        onOpenChange={setDeleteAccountDialogOpen}
        onConfirm={handleDeleteAccountConfirm}
        loading={loading}
      />
    </div>
  )
}
