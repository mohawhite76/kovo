import Image from "next/image"

import { ResetPasswordForm } from "@/components/forms/reset-password-form"

export default function ResetPasswordPage() {
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
            <ResetPasswordForm />
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
