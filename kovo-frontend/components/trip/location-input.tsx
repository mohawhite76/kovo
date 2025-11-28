"use client"

import { useState, useEffect, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface LocationInputProps {
  name: string
  placeholder: string
  value: string
  onChange: (value: string, coords?: { lat: number; lng: number }) => void
  className?: string
  showGeolocation?: boolean
}

interface Suggestion {
  properties: {
    label: string
    city: string
    context: string
  }
  geometry: {
    coordinates: [number, number]
  }
}

export function LocationInput({
  name,
  placeholder,
  value,
  onChange,
  className,
  showGeolocation = false
}: LocationInputProps) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [loading, setLoading] = useState(false)
  const [geoLoading, setGeoLoading] = useState(false)
  const inputRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (value.length < 2) {
        setSuggestions([])
        return
      }

      setLoading(true)
      try {
        const response = await fetch(
          `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(value)}&type=municipality&limit=5`
        )
        const data = await response.json()
        setSuggestions(data.features || [])
        setShowSuggestions(true)
      } catch (error) {
        console.error("Error fetching suggestions:", error)
      } finally {
        setLoading(false)
      }
    }

    const timer = setTimeout(fetchSuggestions, 300)
    return () => clearTimeout(timer)
  }, [value])

  const handleGeolocation = async () => {
    if (!navigator.geolocation) {
      alert("La géolocalisation n'est pas supportée par votre navigateur")
      return
    }

    setGeoLoading(true)
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords
          const response = await fetch(
            `https://api-adresse.data.gouv.fr/reverse/?lon=${longitude}&lat=${latitude}`
          )
          const data = await response.json()
          if (data.features && data.features.length > 0) {
            const city = data.features[0].properties.city || data.features[0].properties.label
            onChange(city)
          }
        } catch (error) {
          console.error("Error fetching location:", error)
        } finally {
          setGeoLoading(false)
        }
      },
      (error) => {
        console.error("Geolocation error:", error)
        alert("Impossible d'obtenir votre position")
        setGeoLoading(false)
      }
    )
  }

  const handleSuggestionClick = (suggestion: Suggestion) => {
    const coords = {
      lat: suggestion.geometry.coordinates[1],
      lng: suggestion.geometry.coordinates[0]
    }
    onChange(suggestion.properties.city || suggestion.properties.label, coords)
    setShowSuggestions(false)
  }

  return (
    <div ref={inputRef} className="relative">
      <div className="relative">
        <Input
          name={name}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cn("h-14 text-base", showGeolocation && "pr-12", className)}
        />
        {showGeolocation && (
          <div
            onClick={geoLoading ? undefined : handleGeolocation}
            className={cn(
              "absolute right-3 top-1/2 -translate-y-1/2",
              !geoLoading && "cursor-pointer"
            )}
            aria-label="Utiliser ma position actuelle"
          >
            {geoLoading ? (
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            ) : (
              <svg
                width="1em"
                height="1em"
                viewBox="0 0 24 24"
                fill="none"
                className="h-5 w-5 text-muted-foreground hover:text-foreground transition-colors"
              >
                <path
                  d="M10.5 13.5.5 11 21 3l-8 20.5-2.5-10Z"
                  fill="currentColor"
                />
              </svg>
            )}
          </div>
        )}
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-background border rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handleSuggestionClick(suggestion)}
              className="w-full text-left px-4 py-3 hover:bg-accent transition-colors border-b last:border-b-0"
            >
              <div className="font-medium">{suggestion.properties.city}</div>
              <div className="text-sm text-muted-foreground">
                {suggestion.properties.context}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
