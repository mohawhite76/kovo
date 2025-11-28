import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return format(date, "EEEE d MMMM yyyy 'à' HH:mm", { locale: fr })
}

export function formatCurrency(amount: number): string {
  return `${amount.toFixed(2)} €`
}
