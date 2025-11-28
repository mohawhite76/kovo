"use client"

import { useState, useEffect } from "react"
import { Search, MapPin, Navigation } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { TripCard } from "@/components/trip/trip-card"
import { tripAPI } from "@/lib/api"

export default function SearchPage() {
  const [trips, setTrips] = useState([])
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState({
    departure: "",
    destination: ""
  })

  useEffect(() => {
    searchTrips()
  }, [])

  const searchTrips = async () => {
    setLoading(true)
    try {
      const params: any = {}
      if (filters.departure) params.departure = filters.departure
      if (filters.destination) params.destination = filters.destination

      const { data } = await tripAPI.getTrips(params)
      setTrips(data.data)
    } catch (error) {
      console.error('Error searching trips:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    searchTrips()
  }

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ ...filters, [e.target.name]: e.target.value })
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-2xl">
      <div className="space-y-4 mb-6">
        <h1 className="text-4xl md:text-5xl font-bold">Rechercher</h1>
        <p className="text-lg text-muted-foreground">Trouvez votre prochain covoiturage</p>
      </div>

      <div className="bg-card rounded-2xl shadow-sm border p-6 mb-6">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="space-y-3">
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
              <Input
                name="departure"
                value={filters.departure}
                onChange={handleFilterChange}
                placeholder="Ville de départ"
                className="h-14 text-base pl-12"
              />
            </div>
            <div className="relative">
              <Navigation className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
              <Input
                name="destination"
                value={filters.destination}
                onChange={handleFilterChange}
                placeholder="Ville d'arrivée"
                className="h-14 text-base pl-12"
              />
            </div>
          </div>

          <Button type="submit" disabled={loading} className="w-full h-14 text-base font-medium">
            <Search className="size-5 mr-2" />
            {loading ? "Recherche..." : "Rechercher"}
          </Button>
        </form>
      </div>

      <div className="space-y-4">
        {loading ? (
          <>
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-40 bg-muted animate-pulse rounded-2xl" />
            ))}
          </>
        ) : trips.length === 0 ? (
          <div className="bg-card rounded-2xl shadow-sm border p-12 text-center">
            <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Search className="size-8 text-primary" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Aucun trajet trouvé</h2>
            <p className="text-muted-foreground">
              Essayez de modifier vos critères de recherche
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground font-medium">
              {trips.length} trajet{trips.length > 1 ? 's' : ''} trouvé{trips.length > 1 ? 's' : ''}
            </p>
            <div className="space-y-4">
              {trips.map((trip: any) => (
                <TripCard key={trip.id} trip={trip} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
