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
import { PhoneInput } from "@/components/shared/phone-input"
import { authAPI } from "@/lib/api"

export function RegisterForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    university: "",
    studentId: "",
    phone: ""
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (formData.password !== formData.confirmPassword) {
      setError("Les mots de passe ne correspondent pas")
      return
    }

    setLoading(true)

    try {
      await authAPI.register({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        university: formData.university,
        studentId: formData.studentId,
        phone: formData.phone ? formData.phone.replace(/\s/g, '') : undefined
      })
      router.push(`/verify-email?email=${encodeURIComponent(formData.email)}`)
    } catch (err: any) {
      console.error('Registration error:', err.response?.data)
      if (err.response?.data?.errors) {
        const errorMessages = err.response.data.errors.map((e: any) => e.msg).join(', ')
        setError(errorMessages)
      } else {
        setError(err.response?.data?.error || "Erreur lors de l'inscription")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className={cn("flex flex-col gap-6", className)} onSubmit={handleSubmit} {...props}>
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Créer un compte</h1>
          <p className="text-muted-foreground text-sm text-balance">
            Rejoignez la communauté Kovo
          </p>
        </div>
        {error && (
          <div className="text-sm text-destructive text-center bg-destructive/10 p-3 rounded-md">
            {error}
          </div>
        )}
        <div className="grid grid-cols-2 gap-4">
          <Field>
            <Input
              id="firstName"
              name="firstName"
              placeholder="Prénom"
              value={formData.firstName}
              onChange={handleChange}
              required
              className="h-12"
            />
          </Field>
          <Field>
            <Input
              id="lastName"
              name="lastName"
              placeholder="Nom"
              value={formData.lastName}
              onChange={handleChange}
              required
              className="h-12"
            />
          </Field>
        </div>
        <Field>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
            className="h-12"
          />
        </Field>
        <Field>
          <Input
            id="university"
            name="university"
            placeholder="Université"
            value={formData.university}
            onChange={handleChange}
            required
            className="h-12"
          />
        </Field>
        <Field>
          <Input
            id="studentId"
            name="studentId"
            placeholder="Numéro étudiant (optionnel)"
            value={formData.studentId}
            onChange={handleChange}
            className="h-12"
          />
        </Field>
        <Field>
          <PhoneInput
            id="phone"
            name="phone"
            placeholder="Téléphone (optionnel)"
            value={formData.phone}
            onChange={(value) => setFormData({ ...formData, phone: value })}
            className="h-12"
          />
        </Field>
        <Field>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Mot de passe"
              value={formData.password}
              onChange={handleChange}
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
            Minimum 8 caractères avec majuscule, minuscule et chiffre
          </FieldDescription>
        </Field>
        <Field>
          <div className="relative">
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirmer le mot de passe"
              value={formData.confirmPassword}
              onChange={handleChange}
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
            {loading ? "Inscription..." : "S'inscrire"}
          </Button>
        </Field>
        <Field>
          <FieldDescription className="text-center">
            Déjà un compte ?{" "}
            <a href="/login" className="underline underline-offset-4">
              Se connecter
            </a>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  )
}
