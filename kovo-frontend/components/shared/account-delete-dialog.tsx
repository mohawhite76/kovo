"use client"

import { useState } from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface AccountDeleteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (password: string) => void
  loading?: boolean
}

export function AccountDeleteDialog({
  open,
  onOpenChange,
  onConfirm,
  loading = false
}: AccountDeleteDialogProps) {
  const [password, setPassword] = useState("")

  const handleConfirm = () => {
    if (password.trim()) {
      onConfirm(password)
      setPassword("")
    }
  }

  const handleCancel = () => {
    setPassword("")
    onOpenChange(false)
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Supprimer votre compte ?</AlertDialogTitle>
          <AlertDialogDescription>
            ⚠️ ATTENTION : Cette action est irréversible. Toutes vos données (trajets, réservations, messages) seront définitivement supprimées.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="py-4">
          <Label htmlFor="password" className="text-sm font-medium">
            Entrez votre mot de passe pour confirmer
          </Label>
          <Input
            id="password"
            type="password"
            placeholder="Mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-2 h-12"
            disabled={loading}
          />
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleCancel} disabled={loading}>
            Annuler
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={!password.trim() || loading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {loading ? "Suppression..." : "Supprimer mon compte"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
