"use client"

import { Suspense } from "react"
import Image from "next/image"
import { useSearchParams } from "next/navigation"

import { VerifyEmailForm } from "@/components/forms/verify-email-form"

function VerifyEmailContent() {
  const searchParams = useSearchParams()
  const email = searchParams.get("email") || ""

  if (!email) {
    return (
      <div className="text-center">
        <p className="text-destructive">Email manquant</p>
      </div>
    )
  }

  return <VerifyEmailForm email={email} />
}

export default function VerifyEmailPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10 bg-background">
        <div className="flex justify-center gap-2 md:justify-start">
          <a href="/" className="text-3xl font-bold text-primary hover:opacity-80 transition-opacity">
            Kovo
          </a>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <Suspense fallback={<div className="text-center text-muted-foreground">Chargement...</div>}>
              <VerifyEmailContent />
            </Suspense>
          </div>
        </div>
      </div>
      <div className="relative hidden lg:block overflow-hidden">
        <Image
          src="/img1.jpeg"
          alt="Background"
          fill
          className="object-cover"
          sizes="50vw"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-purple-500/10 to-blue-500/20" />
      </div>
    </div>
  )
}
