"use client"

import { Input } from "@/components/ui/input"
import { forwardRef } from "react"

interface PlateInputProps {
  value: string
  onChange: (value: string) => void
  className?: string
}

export const PlateInput = forwardRef<HTMLInputElement, PlateInputProps>(
  ({ value, onChange, className }, ref) => {
    const formatPlate = (input: string) => {

      const cleaned = input.toUpperCase().replace(/[^A-Z0-9]/g, '')

      let formatted = ''

      if (cleaned.length > 0) {
        formatted += cleaned.substring(0, 2)
      }

      if (cleaned.length > 2) {
        formatted += '-' + cleaned.substring(2, 5)
      }

      if (cleaned.length > 5) {
        formatted += '-' + cleaned.substring(5, 7)
      }

      return formatted
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const input = e.target.value
      const formatted = formatPlate(input)

      if (formatted.length <= 9) {
        onChange(formatted)
      }
    }

    return (
      <Input
        ref={ref}
        type="text"
        value={value}
        onChange={handleChange}
        placeholder="AB-123-CD"
        maxLength={9}
        className={className}
        pattern="[A-Z]{2}-[0-9]{3}-[A-Z]{2}"
        title="Format: AB-123-CD"
      />
    )
  }
)

PlateInput.displayName = "PlateInput"
