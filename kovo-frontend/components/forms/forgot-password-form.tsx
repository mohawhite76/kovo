"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldGroup,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { authAPI } from "@/lib/api"

export function ForgotPasswordForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      await authAPI.requestPasswordReset(email)
      setSuccess(true)
    } catch (err: any) {
      setError(err.response?.data?.error || "Erreur lors de l'envoi de l'email")
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className={cn("flex flex-col gap-6", className)}>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Email envoye !</h1>
          <p className="text-muted-foreground text-sm text-balance">
            Consultez votre boite email. Un lien de reinitialisation vous a ete envoye
          </p>
        </div>
        <Button onClick={() => router.push('/login')} className="w-full h-12">
          Retour a la connexion
        </Button>
      </div>
    )
  }

  return (
    <form className={cn("flex flex-col gap-6", className)} onSubmit={handleSubmit} {...props}>
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Mot de passe oublié ?</h1>
          <p className="text-muted-foreground text-sm text-balance">
            Pas de souci ! Entrez votre email et nous vous enverrons un lien pour le réinitialiser
          </p>
        </div>
        {error && (
          <div className="text-sm text-destructive text-center bg-destructive/10 p-3 rounded-md">
            {error}
          </div>
        )}
        <Field>
          <Input
            id="email"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="h-12"
          />
        </Field>
        <Field>
          <Button type="submit" disabled={loading} className="w-full h-12">
            {loading ? "Envoi..." : "Envoyer le lien"}
          </Button>
        </Field>
        <Field>
          <FieldDescription className="text-center">
            Vous vous souvenez de votre mot de passe ?{" "}
            <a href="/login" className="underline underline-offset-4">
              Se connecter
            </a>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  )
}
