"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Camera, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { PhoneInput } from "@/components/shared/phone-input"
import { DeleteDialog } from "@/components/shared/delete-dialog"
import { useAuthStore } from "@/lib/store"
import { userAPI } from "@/lib/api"

export default function EditProfilePage() {
  const router = useRouter()
  const user = useAuthStore((state) => state.user)
  const setUser = useAuthStore((state) => state.setUser)
  const [loading, setLoading] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [error, setError] = useState("")
  const [deleteAvatarDialogOpen, setDeleteAvatarDialogOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [formData, setFormData] = useState({
    first_name: user?.first_name || "",
    last_name: user?.last_name || "",
    university: user?.university || "",
    student_id: user?.student_id || "",
    phone: user?.phone || ""
  })

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }
    setFormData({
      first_name: user.first_name || "",
      last_name: user.last_name || "",
      university: user.university || "",
      student_id: user.student_id || "",
      phone: user.phone || ""
    })
  }, [user, router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const dataToSend: any = {
        firstName: formData.first_name,
        lastName: formData.last_name,
        university: formData.university,
      }

      if (formData.student_id) {
        dataToSend.studentId = formData.student_id
      }

      if (formData.phone) {
        dataToSend.phone = formData.phone.replace(/\s/g, '')
      }

      const { data } = await userAPI.updateProfile(dataToSend)
      setUser(data.user)
      router.push('/profile')
    } catch (err: any) {
      console.error('Erreur complète:', err.response?.data)
      if (err.response?.data?.errors && Array.isArray(err.response.data.errors)) {
        const errorMessages = err.response.data.errors.map((e: any) => e.msg || e.message).join('. ')
        setError(errorMessages)
      } else if (err.response?.data?.message) {
        setError(err.response.data.message)
      } else if (err.response?.data?.error) {
        setError(err.response.data.error)
      } else {
        setError("Erreur lors de la mise à jour")
      }
    } finally {
      setLoading(false)
    }
  }

  const handleAvatarClick = () => {
    fileInputRef.current?.click()
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setError('Veuillez sélectionner une image')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('L\'image ne doit pas dépasser 5 Mo')
      return
    }

    setUploadingAvatar(true)
    setError("")

    try {
      const { data } = await userAPI.uploadAvatar(file)
      setUser(data.user)
    } catch (err: any) {
      console.error('Erreur upload avatar:', err)
      setError(err.response?.data?.error || "Erreur lors de l'upload de l'avatar")
    } finally {
      setUploadingAvatar(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleAvatarDeleteClick = () => {
    setDeleteAvatarDialogOpen(true)
  }

  const handleAvatarDeleteConfirm = async () => {
    setUploadingAvatar(true)
    setError("")
    setDeleteAvatarDialogOpen(false)

    try {
      const { data } = await userAPI.deleteAvatar()
      setUser(data.user)
    } catch (err: any) {
      console.error('Erreur suppression avatar:', err)
      setError(err.response?.data?.error || "Erreur lors de la suppression de l'avatar")
    } finally {
      setUploadingAvatar(false)
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
        <h1 className="text-4xl md:text-5xl font-bold">Modifier votre profil</h1>
        <p className="text-lg text-muted-foreground">Mettez à jour vos informations Kovo</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-card rounded-2xl shadow-sm border p-6 space-y-6">
          <div>
            <h2 className="text-lg font-semibold mb-4">Photo de profil</h2>
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <Avatar className="size-24 ring-4 ring-primary/10">
                  <AvatarImage src={user.avatar} />
                  <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                    {formData.first_name[0]}{formData.last_name[0]}
                  </AvatarFallback>
                </Avatar>
                <button
                  type="button"
                  onClick={handleAvatarClick}
                  disabled={uploadingAvatar}
                  className="absolute bottom-0 right-0 size-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors disabled:opacity-50 shadow-lg"
                  aria-label="Modifier la photo"
                >
                  <Camera className="size-5" />
                </button>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />
              {user.avatar && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAvatarDeleteClick}
                  disabled={uploadingAvatar}
                  className="text-xs h-9"
                >
                  <Trash2 className="size-3 mr-1" />
                  Supprimer la photo
                </Button>
              )}
              {uploadingAvatar && (
                <p className="text-sm text-muted-foreground">Chargement en cours...</p>
              )}
            </div>
          </div>

          <div className="border-t pt-6">
            <h2 className="text-lg font-semibold mb-4">Informations personnelles</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Prénom *</label>
                <Input
                  id="first_name"
                  name="first_name"
                  placeholder="Votre prénom"
                  value={formData.first_name}
                  onChange={handleChange}
                  required
                  className="h-14 text-base"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Nom *</label>
                <Input
                  id="last_name"
                  name="last_name"
                  placeholder="Votre nom"
                  value={formData.last_name}
                  onChange={handleChange}
                  required
                  className="h-14 text-base"
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-sm font-medium mb-2 block">Université *</label>
                <Input
                  id="university"
                  name="university"
                  placeholder="Nom de votre établissement"
                  value={formData.university}
                  onChange={handleChange}
                  required
                  className="h-14 text-base"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Numéro étudiant</label>
                <Input
                  id="student_id"
                  name="student_id"
                  placeholder="Optionnel"
                  value={formData.student_id}
                  onChange={handleChange}
                  className="h-14 text-base"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Téléphone</label>
                <PhoneInput
                  id="phone"
                  name="phone"
                  placeholder="Optionnel"
                  value={formData.phone}
                  onChange={(value) => setFormData(prev => ({ ...prev, phone: value }))}
                  className="h-14"
                />
              </div>
            </div>
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
            disabled={loading}
            className="flex-1 h-14 text-base font-medium"
          >
            {loading ? "Enregistrement..." : "Enregistrer"}
          </Button>
        </div>
      </form>

      <DeleteDialog
        open={deleteAvatarDialogOpen}
        onOpenChange={setDeleteAvatarDialogOpen}
        onConfirm={handleAvatarDeleteConfirm}
        title="Supprimer la photo de profil ?"
        description="Cette action supprimera définitivement votre photo de profil."
      />
    </div>
  )
}
