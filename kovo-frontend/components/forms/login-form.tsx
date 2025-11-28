"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Eye, EyeOff } from "lucide-react"
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

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const router = useRouter()
  const setAuth = useAuthStore((state) => state.setAuth)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const { data } = await authAPI.login({ email, password })
      setAuth(data.user, data.token)
      router.push("/")
    } catch (err: any) {
      setError(err.response?.data?.error || "Erreur de connexion")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className={cn("flex flex-col gap-6", className)} onSubmit={handleSubmit} {...props}>
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Bon retour sur Kovo !</h1>
          <p className="text-muted-foreground text-sm text-balance">
            Connectez-vous pour retrouver vos trajets
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
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Mot de passe"
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
          <a
            href="/forgot-password"
            className="text-sm underline-offset-4 hover:underline"
          >
            Mot de passe oublié ?
          </a>
        </Field>
        <Field>
          <Button type="submit" disabled={loading} className="w-full h-12">
            {loading ? "Connexion..." : "Se connecter"}
          </Button>
        </Field>
        <Field>
          <FieldDescription className="text-center">
            Pas encore de compte ?{" "}
            <a href="/register" className="underline underline-offset-4">
              S&apos;inscrire
            </a>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  )
}
