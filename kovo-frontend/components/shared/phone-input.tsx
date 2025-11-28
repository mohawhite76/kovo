"use client"

import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface PhoneInputProps {
  value: string
  onChange: (value: string) => void
  className?: string
  placeholder?: string
  id?: string
  name?: string
}

export function PhoneInput({ value, onChange, className = "", placeholder, id, name }: PhoneInputProps) {
  const formatPhoneNumber = (input: string) => {

    let cleaned = input.replace(/[^\d+]/g, '')

    if (cleaned.startsWith('0')) {
      cleaned = '+33' + cleaned.substring(1)
    }

    if (!cleaned.startsWith('+33') && cleaned.length > 0) {
      cleaned = '+33' + cleaned
    }

    if (cleaned.startsWith('+33')) {
      const digits = cleaned.substring(3)
      if (digits.length > 9) {
        cleaned = '+33' + digits.substring(0, 9)
      }
    }

    return cleaned
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value)
    onChange(formatted)
  }

  const displayValue = () => {
    if (!value) return ''

    if (value.startsWith('+33')) {
      const digits = value.substring(3)
      if (digits.length === 0) return '+33 '

      let formatted = '+33 '
      for (let i = 0; i < digits.length; i++) {
        if (i > 0 && i % 2 === 0) {
          formatted += ' '
        }
        formatted += digits[i]
      }
      return formatted
    }

    return value
  }

  return (
    <div className="relative">
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-base pointer-events-none z-10">
        🇫🇷
      </div>
      <Input
        id={id}
        name={name}
        type="tel"
        value={displayValue()}
        onChange={handleChange}
        placeholder={placeholder || "+33 6 12 34 56 78"}
        className={cn("text-base pl-12", !className.includes('h-') && "h-14", className)}
      />
    </div>
  )
}
