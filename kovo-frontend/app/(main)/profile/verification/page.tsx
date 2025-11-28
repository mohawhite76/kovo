"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, FileText, CheckCircle, Clock, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuthStore } from "@/lib/store"
import { userAPI, authAPI } from "@/lib/api"

export default function VerificationPage() {
  const router = useRouter()
  const user = useAuthStore((state) => state.user)
  const setUser = useAuthStore((state) => state.setUser)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [studentCardUploading, setStudentCardUploading] = useState(false)
  const studentCardRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!user) {
      router.push('/login')
    }
  }, [user, router])

  const handleStudentCardUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
      setError('Veuillez sélectionner une image ou un PDF')
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('Le fichier ne doit pas dépasser 10 Mo')
      return
    }

    setStudentCardUploading(true)
    setError("")
    setSuccess("")

    try {
      const { data } = await userAPI.uploadStudentCard(file)
      setUser(data.user)
      setSuccess("Document étudiant envoyé avec succès. En attente de vérification.")
      if (studentCardRef.current) studentCardRef.current.value = ''

      const refreshUser = async () => {
        try {
          const { data: profileData } = await authAPI.getProfile()
          setUser(profileData.user)
          if (profileData.user.student_verification_status === 'approved') {
            setSuccess("Document étudiant vérifié avec succès !")
            return true
          }
          return false
        } catch (err) {
          console.error('Error refreshing user data:', err)
          return false
        }
      }

      setTimeout(async () => {
        const approved = await refreshUser()
        if (!approved) {
          setTimeout(refreshUser, 12000)
        }
      }, 4000)
    } catch (err: any) {
      setError(err.response?.data?.error || "Erreur lors de l'upload du document")
    } finally {
      setStudentCardUploading(false)
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
          <FileText className="size-8 text-primary" />
          <h1 className="text-4xl md:text-5xl font-bold">Vérification étudiant</h1>
        </div>
        <p className="text-lg text-muted-foreground">
          Confirmez votre statut étudiant pour accéder à Kovo
        </p>
      </div>

      {success && (
        <div className="text-sm text-green-600 bg-green-50 p-3 rounded-md mb-4">
          {success}
        </div>
      )}

      {error && (
        <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md mb-4">
          {error}
        </div>
      )}

      <div className="bg-card rounded-2xl shadow-sm border p-6 space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-3">Statut de vérification</h3>
          {user.student_verification_status === 'approved' && (
            <div className="flex items-center gap-2 text-green-600 bg-green-50 dark:bg-green-950 p-3 rounded-lg">
              <CheckCircle className="size-5" />
              <span className="font-medium">✓ Compte étudiant vérifié avec succès</span>
            </div>
          )}
          {user.student_verification_status === 'pending' && (
            <div className="flex items-center gap-2 text-yellow-600 bg-yellow-50 dark:bg-yellow-950 p-3 rounded-lg">
              <Clock className="size-5" />
              <span className="font-medium">⏳ Vérification en cours (sous 24h)</span>
            </div>
          )}
          {user.student_verification_status === 'rejected' && (
            <div className="flex items-center gap-2 text-red-600 bg-red-50 dark:bg-red-950 p-3 rounded-lg">
              <XCircle className="size-5" />
              <span className="font-medium">✗ Document refusé - Veuillez soumettre un nouveau document</span>
            </div>
          )}
          {!user.student_verification_status && (
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-muted-foreground">Aucun document soumis pour le moment</p>
            </div>
          )}
        </div>

        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold mb-3">
            {user.student_card_photo ? 'Soumettre un nouveau document' : 'Soumettre votre justificatif étudiant'}
          </h3>
          {user.student_card_photo && (
            <div className="mb-4 p-3 bg-green-50 dark:bg-green-950 rounded-lg">
              <p className="text-sm text-green-600 flex items-center gap-1">
                <CheckCircle className="size-4" />
                Document déjà envoyé
              </p>
            </div>
          )}
          <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
            <p className="text-sm text-blue-700 dark:text-blue-300 font-medium mb-2">
              Documents acceptés :
            </p>
            <ul className="text-sm text-blue-600 dark:text-blue-400 space-y-1 ml-4 list-disc">
              <li>Carte étudiante en cours de validité</li>
              <li>Certificat de scolarité</li>
              <li>Attestation d'inscription</li>
            </ul>
          </div>
          <p className="text-xs text-muted-foreground mb-3">
            Formats acceptés: JPG, PNG, PDF (max 10 Mo)
          </p>
          <input
            ref={studentCardRef}
            type="file"
            accept="image/*,application/pdf"
            onChange={handleStudentCardUpload}
            disabled={studentCardUploading}
            className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 disabled:opacity-50 file:cursor-pointer"
          />
          {studentCardUploading && (
            <p className="text-sm text-muted-foreground mt-2">Envoi en cours...</p>
          )}
        </div>
      </div>

      <div className="mt-6">
        <Button
          variant="outline"
          onClick={() => router.back()}
          className="w-full h-14 text-base"
        >
          Retour au profil
        </Button>
      </div>
    </div>
  )
}
