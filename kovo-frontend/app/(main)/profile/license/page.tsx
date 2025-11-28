"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, CreditCard, CheckCircle, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuthStore } from "@/lib/store"
import { userAPI, authAPI } from "@/lib/api"

export default function LicensePage() {
  const router = useRouter()
  const user = useAuthStore((state) => state.user)
  const setUser = useAuthStore((state) => state.setUser)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const licensePhotoRef = useRef<HTMLInputElement>(null)

  const [licenseData, setLicenseData] = useState({
    number: user?.drivers_license_number || "",
    uploading: false
  })

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }
    setLicenseData({
      number: user.drivers_license_number || "",
      uploading: false
    })
  }, [user, router])

  const handleLicenseSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!licenseData.number) {
      setError("Veuillez entrer votre numéro de permis")
      return
    }

    setLicenseData(prev => ({ ...prev, uploading: true }))
    setError("")
    setSuccess("")

    try {
      const photo = licensePhotoRef.current?.files?.[0]
      const { data } = await userAPI.updateDriversLicense({
        number: licenseData.number,
        photo
      })
      setUser(data.user)
      setSuccess("Document envoyé avec succès. En attente de vérification.")
      if (licensePhotoRef.current) licensePhotoRef.current.value = ''

      const refreshUser = async () => {
        try {
          const { data: profileData } = await authAPI.getProfile()
          setUser(profileData.user)
          if (profileData.user.drivers_license_verified) {
            setSuccess("Permis de conduire vérifié avec succès !")
            return true
          }
          return false
        } catch (err) {
          console.error('Error refreshing user data:', err)
          return false
        }
      }

      setTimeout(async () => {
        const verified = await refreshUser()
        if (!verified) {
          setTimeout(refreshUser, 12000)
        }
      }, 4000)
    } catch (err: any) {
      setError(err.response?.data?.error || "Erreur lors de la mise à jour du permis")
    } finally {
      setLicenseData(prev => ({ ...prev, uploading: false }))
    }
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded-2xl w-1/3" />
          <div className="h-64 bg-muted rounded-2xl" />
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-2xl">
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/profile">
            <ArrowLeft className="size-4 mr-2" />
            Retour
          </Link>
        </Button>
      </div>

      <div className="space-y-4 mb-6">
        <div className="flex items-center gap-3">
          <CreditCard className="size-8 text-primary" />
          <h1 className="text-4xl md:text-5xl font-bold">Permis de conduire</h1>
        </div>
        <p className="text-lg text-muted-foreground">
          Renseignez votre permis pour proposer des trajets
        </p>
      </div>

      {success && (
        <div className="text-sm text-green-600 bg-green-50 p-3 rounded-md mb-4">
          {success}
        </div>
      )}

      <div className="bg-card rounded-2xl shadow-sm border p-6 space-y-6 mb-6">
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-3">Statut de vérification</h3>
            {user.drivers_license_verified && (
              <div className="flex items-center gap-2 text-green-600 bg-green-50 dark:bg-green-950 p-3 rounded-lg">
                <CheckCircle className="size-5" />
                <span className="font-medium">✓ Permis vérifié avec succès</span>
              </div>
            )}
            {user.drivers_license_number && !user.drivers_license_verified && (
              <div className="flex items-center gap-2 text-yellow-600 bg-yellow-50 dark:bg-yellow-950 p-3 rounded-lg">
                <Clock className="size-5" />
                <span className="font-medium">⏳ Vérification en cours (sous 24h)</span>
              </div>
            )}
            {!user.drivers_license_number && (
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-muted-foreground">Aucun permis enregistré pour le moment</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <form onSubmit={handleLicenseSubmit} className="space-y-6">
        <div className="bg-card rounded-2xl shadow-sm border p-6 space-y-5">
          <h3 className="text-lg font-semibold">Informations du permis</h3>
          <div>
            <label className="text-sm font-medium block mb-2">
              Numéro de permis *
            </label>
            <Input
              placeholder="Ex: 123456789"
              value={licenseData.number}
              onChange={(e) => setLicenseData(prev => ({ ...prev, number: e.target.value }))}
              className="h-14 text-base"
              required
            />
            {user.drivers_license_number && (
              <p className="text-sm text-green-600 mt-2 flex items-center gap-1">
                <CheckCircle className="size-4" />
                Numéro enregistré: {user.drivers_license_number}
              </p>
            )}
          </div>
          <div>
            <label className="text-sm font-medium block mb-2">
              Photo du permis {user.drivers_license_photo ? '(Modifier)' : '(Optionnel)'}
            </label>
            <p className="text-xs text-muted-foreground mb-3">
              Formats acceptés: JPG, PNG (max 5 Mo)
            </p>
            <input
              ref={licensePhotoRef}
              type="file"
              accept="image/*"
              className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 file:cursor-pointer"
            />
            {user.drivers_license_photo && (
              <p className="text-sm text-green-600 mt-3 flex items-center gap-1">
                <CheckCircle className="size-4" />
                Photo du permis déjà enregistrée
              </p>
            )}
          </div>
        </div>

        {error && (
          <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
            {error}
          </div>
        )}

        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            className="flex-1 h-14 text-base"
          >
            Annuler
          </Button>
          <Button
            type="submit"
            disabled={licenseData.uploading}
            className="flex-1 h-14 text-base font-medium"
          >
            {licenseData.uploading ? "Enregistrement..." : "Enregistrer"}
          </Button>
        </div>
      </form>
    </div>
  )
}
