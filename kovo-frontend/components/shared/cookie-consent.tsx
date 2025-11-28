"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { X, Cookie } from "lucide-react"
import { Button } from "@/components/ui/button"

export function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false)

  useEffect(() => {
    // Vérifier si l'utilisateur a déjà consenti
    const consent = localStorage.getItem('kovo-cookie-consent')
    if (!consent) {
      // Afficher le banner après 1 seconde
      const timer = setTimeout(() => {
        setShowBanner(true)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [])

  const acceptAll = () => {
    localStorage.setItem('kovo-cookie-consent', 'all')
    setShowBanner(false)
  }

  const acceptEssential = () => {
    localStorage.setItem('kovo-cookie-consent', 'essential')
    setShowBanner(false)
  }

  const closeBanner = () => {
    setShowBanner(false)
  }

  if (!showBanner) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 safe-bottom">
      <div className="container mx-auto max-w-4xl">
        <div className="bg-card border shadow-lg rounded-2xl p-4 md:p-6">
          <div className="flex items-start gap-4">
            <div className="shrink-0">
              <Cookie className="size-6 text-primary" />
            </div>

            <div className="flex-1 space-y-3">
              <div>
                <h3 className="font-semibold text-lg mb-1">Cookies et confidentialité</h3>
                <p className="text-sm text-muted-foreground">
                  Nous utilisons des cookies pour améliorer votre expérience, analyser le trafic et personnaliser le contenu.
                  En cliquant sur "Tout accepter", vous consentez à l'utilisation de tous les cookies.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button onClick={acceptAll} className="flex-1 sm:flex-none">
                  Tout accepter
                </Button>
                <Button onClick={acceptEssential} variant="outline" className="flex-1 sm:flex-none">
                  Cookies essentiels uniquement
                </Button>
                <Link href="/legal/privacy" className="flex-1 sm:flex-none">
                  <Button variant="ghost" className="w-full">
                    En savoir plus
                  </Button>
                </Link>
              </div>

              <p className="text-xs text-muted-foreground">
                En continuant à naviguer sur ce site, vous acceptez notre{" "}
                <Link href="/legal/privacy" className="text-primary hover:underline">
                  politique de confidentialité
                </Link>
                {" "}et nos{" "}
                <Link href="/legal/terms" className="text-primary hover:underline">
                  conditions d'utilisation
                </Link>
                .
              </p>
            </div>

            <button
              onClick={closeBanner}
              className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Fermer"
            >
              <X className="size-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
