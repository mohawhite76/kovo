"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { authAPI } from "@/lib/api"
import { useAuthStore } from "@/lib/store"

export function VerifyEmailForm({
  email,
  className,
  ...props
}: React.ComponentProps<"form"> & { email: string }) {
  const router = useRouter()
  const setAuth = useAuthStore((state) => state.setAuth)
  const [code, setCode] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const { data } = await authAPI.verifyEmail({ email, code })
      setAuth(data.user, data.token)
      router.push("/")
    } catch (err: any) {
      console.error('Verification error:', err.response?.data)
      if (err.response?.data?.errors) {
        const errorMessages = err.response.data.errors.map((e: any) => e.msg).join(', ')
        setError(errorMessages)
      } else {
        setError(err.response?.data?.error || "Code de vérification invalide")
      }
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    setError("")
    setResending(true)

    try {
      await authAPI.resendCode(email)
      setError("✅ Un nouveau code a été envoyé à votre email")
    } catch (err: any) {
      setError(err.response?.data?.error || "Erreur lors de l'envoi du code")
    } finally {
      setResending(false)
    }
  }

  return (
    <form className={cn("flex flex-col gap-6", className)} onSubmit={handleSubmit} {...props}>
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Vérifiez votre email 📧</h1>
          <p className="text-muted-foreground text-sm text-balance">
            Nous avons envoyé un code de vérification à<br />
            <strong>{email}</strong>
          </p>
        </div>
        {error && (
          <div className={cn(
            "text-sm text-center p-3 rounded-md",
            error.includes("nouveau code")
              ? "text-green-600 bg-green-50 dark:bg-green-950"
              : "text-destructive bg-destructive/10"
          )}>
            {error}
          </div>
        )}
        <Field>
          <Input
            id="code"
            type="text"
            placeholder="Code de vérification"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            maxLength={6}
            required
            className="h-12 text-center text-2xl tracking-widest"
          />
          <FieldDescription>
            Entrez le code à 6 chiffres reçu par email
          </FieldDescription>
        </Field>
        <Field>
          <Button type="submit" disabled={loading || code.length !== 6} className="w-full h-12">
            {loading ? "Vérification..." : "Vérifier"}
          </Button>
        </Field>
        <Field>
          <FieldDescription className="text-center">
            Vous n&apos;avez pas reçu le code ?{" "}
            <button
              type="button"
              onClick={handleResend}
              disabled={resending}
              className="underline underline-offset-4 hover:text-foreground"
            >
              {resending ? "Envoi..." : "Renvoyer"}
            </button>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  )
}
