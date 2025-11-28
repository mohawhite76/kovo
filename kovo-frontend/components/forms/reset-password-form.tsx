"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Eye, EyeOff } from "lucide-react"
import { Suspense } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldGroup,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { authAPI } from "@/lib/api"

function ResetPasswordContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token") || ""

  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  if (!token) {
    return (
      <div className="text-center">
        <p className="text-destructive">Token manquant ou invalide</p>
        <Button onClick={() => router.push('/forgot-password')} className="mt-4 w-full h-12">
          Demander un nouveau lien
        </Button>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas")
      return
    }

    setLoading(true)

    try {
      await authAPI.resetPassword({ token, password })
      router.push('/login')
    } catch (err: any) {
      setError(err.response?.data?.error || "Erreur lors de la réinitialisation")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Créez un nouveau mot de passe</h1>
          <p className="text-muted-foreground text-sm text-balance">
            Choisissez un mot de passe sécurisé pour votre compte Kovo
          </p>
        </div>
        {error && (
          <div className="text-sm text-destructive text-center bg-destructive/10 p-3 rounded-md">
            {error}
          </div>
        )}
        <Field>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Nouveau mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="h-12 pr-10"
            />
            <div
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
              aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5 text-muted-foreground hover:text-foreground transition-colors" />
              ) : (
                <Eye className="h-5 w-5 text-muted-foreground hover:text-foreground transition-colors" />
              )}
            </div>
          </div>
          <FieldDescription>
            Au moins 8 caractères avec majuscule, minuscule et chiffre
          </FieldDescription>
        </Field>
        <Field>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirmer le mot de passe"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="h-12 pr-10"
            />
            <div
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
              aria-label={showConfirmPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
            >
              {showConfirmPassword ? (
                <EyeOff className="h-5 w-5 text-muted-foreground hover:text-foreground transition-colors" />
              ) : (
                <Eye className="h-5 w-5 text-muted-foreground hover:text-foreground transition-colors" />
              )}
            </div>
          </div>
        </Field>
        <Field>
          <Button type="submit" disabled={loading} className="w-full h-12">
            {loading ? "Réinitialisation..." : "Réinitialiser"}
          </Button>
        </Field>
      </FieldGroup>
    </form>
  )
}

export function ResetPasswordForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div className={cn(className)} {...props}>
      <Suspense fallback={<div>Chargement...</div>}>
        <ResetPasswordContent />
      </Suspense>
    </div>
  )
}
