"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Plus, Search, Calendar as CalendarIcon, ChevronLeft, ChevronRight, Filter, Users, ArrowRight } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { TripCard } from "@/components/trip/trip-card"
import { LocationInput } from "@/components/trip/location-input"
import { tripAPI } from "@/lib/api"
import { useAuthStore } from "@/lib/store"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, startOfWeek, endOfWeek } from "date-fns"
import { fr } from "date-fns/locale"

const popularRoutes = [
  {
    route: "Paris - Lyon",
    departure: "Paris",
    destination: "Lyon",
    image: "/images/cities/paris.jpeg"
  },
  {
    route: "Marseille - Nice",
    departure: "Marseille",
    destination: "Nice",
    image: "/images/cities/marseille.jpeg"
  },
  {
    route: "Toulouse - Bordeaux",
    departure: "Toulouse",
    destination: "Bordeaux",
    image: "/images/cities/toulouse.jpeg"
  },
  {
    route: "Lille - Paris",
    departure: "Lille",
    destination: "Paris",
    image: "/images/cities/lille.jpeg"
  },
  {
    route: "Lyon - Marseille",
    departure: "Lyon",
    destination: "Marseille",
    image: "/images/cities/lyon.jpeg"
  },
  {
    route: "Bordeaux - Paris",
    departure: "Bordeaux",
    destination: "Paris",
    image: "/images/cities/bordeaux.jpeg"
  },
  {
    route: "Nantes - Paris",
    departure: "Nantes",
    destination: "Paris",
    image: "/images/cities/nantes.jpeg"
  },
  {
    route: "Strasbourg - Paris",
    departure: "Strasbourg",
    destination: "Paris",
    image: "/images/cities/strasbourg.jpeg"
  }
]

export default function HomePage() {
  const router = useRouter()
  const user = useAuthStore((state) => state.user)
  const [trips, setTrips] = useState([])
  const [loading, setLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [showCalendar, setShowCalendar] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [showSearchEdit, setShowSearchEdit] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [passengers, setPassengers] = useState(1)
  const [filters, setFilters] = useState({
    departure: "",
    destination: "",
    date: format(new Date(), "yyyy-MM-dd"),
    sortBy: "earliest",
    timeRange: [] as string[]
  })
  const [tempFilters, setTempFilters] = useState({
    departure: "",
    destination: ""
  })
  const [tempDate, setTempDate] = useState<Date>(new Date())
  const [tempPassengers, setTempPassengers] = useState(1)
  const [showLocationDialog, setShowLocationDialog] = useState<"departure" | "destination" | null>(null)
  const [locationInput, setLocationInput] = useState("")
  const [locationSuggestions, setLocationSuggestions] = useState<any[]>([])
  const [locationLoading, setLocationLoading] = useState(false)

  const fetchTrips = async () => {
    setLoading(true)
    setHasSearched(true)
    try {
      const params: any = { limit: 20 }
      if (filters.departure) params.departure = filters.departure
      if (filters.destination) params.destination = filters.destination
      if (filters.date) params.date = filters.date

      const { data } = await tripAPI.getTrips(params)
      setTrips(data.data)
    } catch (error) {
      console.error("Error fetching trips:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleLocationChange = (name: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSearch = () => {
    fetchTrips()
  }

  const handleDateSelect = (date: Date) => {
    if (showSearchEdit) {

      setTempDate(date)
      setShowCalendar(false)
      setShowSearchEdit(true)
    } else {

      setSelectedDate(date)
      setFilters(prev => ({
        ...prev,
        date: format(date, "yyyy-MM-dd")
      }))
      setShowCalendar(false)
    }
  }

  const getDaysInMonth = (month: Date) => {
    const start = startOfWeek(startOfMonth(month), { weekStartsOn: 1 })
    const end = endOfWeek(endOfMonth(month), { weekStartsOn: 1 })
    return eachDayOfInterval({ start, end })
  }

  const getMonthsToDisplay = () => {
    const months = []
    for (let i = 0; i < 12; i++) {
      months.push(addMonths(new Date(), i))
    }
    return months
  }

  useEffect(() => {
    const fetchLocationSuggestions = async () => {
      if (locationInput.length < 2) {
        setLocationSuggestions([])
        return
      }

      setLocationLoading(true)
      try {
        const response = await fetch(
          `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(locationInput)}&type=municipality&limit=10`
        )
        const data = await response.json()
        setLocationSuggestions(data.features || [])
      } catch (error) {
        console.error("Error fetching location suggestions:", error)
      } finally {
        setLocationLoading(false)
      }
    }

    const timer = setTimeout(fetchLocationSuggestions, 300)
    return () => clearTimeout(timer)
  }, [locationInput])

  return (
    <div>
      {!hasSearched && (
        <div className="bg-gradient-to-b from-primary/5 to-transparent border-b">
          <div className="container mx-auto px-4 py-12 max-w-6xl">
            <div className="text-center space-y-4 mb-8">
              <h1 className="text-4xl md:text-6xl font-bold">Voyagez entre étudiants</h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Le covoiturage étudiant qui vous emmène partout en France
              </p>
              <div className="flex flex-wrap justify-center gap-6 pt-4">
                <div className="flex items-center gap-2">
                  <div className="size-10 rounded-full bg-green-100 dark:bg-green-950 flex items-center justify-center">
                    <span className="text-green-600 font-bold">✓</span>
                  </div>
                  <span className="text-sm font-medium">Économique</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="size-10 rounded-full bg-blue-100 dark:bg-blue-950 flex items-center justify-center">
                    <span className="text-blue-600 font-bold">✓</span>
                  </div>
                  <span className="text-sm font-medium">Écologique</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="size-10 rounded-full bg-purple-100 dark:bg-purple-950 flex items-center justify-center">
                    <span className="text-purple-600 font-bold">✓</span>
                  </div>
                  <span className="text-sm font-medium">Convivial</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <div className="space-y-6">
          <div className="space-y-6">
            {hasSearched && (
              <div className="space-y-2">
                <h1 className="text-4xl md:text-5xl font-bold">Résultats de recherche</h1>
                <p className="text-lg text-muted-foreground">Trouvez le trajet parfait pour vous</p>
              </div>
            )}

            {!hasSearched ? (
              <>
                <div className="space-y-2">
                  <h2 className="text-2xl md:text-3xl font-bold">Rechercher un trajet</h2>
                  <p className="text-muted-foreground">Indiquez votre destination et trouvez un covoiturage</p>
                </div>
                <div className="bg-card rounded-2xl shadow-sm border p-6 space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setLocationInput(filters.departure)
                      setShowLocationDialog("departure")
                    }}
                    className="w-full h-14 text-base justify-start font-normal"
                  >
                    {filters.departure || "D'où partez-vous ?"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setLocationInput(filters.destination)
                      setShowLocationDialog("destination")
                    }}
                    className="w-full h-14 text-base justify-start font-normal"
                  >
                    {filters.destination || "Où allez-vous ?"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowCalendar(true)}
                    className="w-full h-14 text-base justify-start font-normal"
                  >
                    {(() => {
                      const today = new Date()
                      today.setHours(0, 0, 0, 0)
                      const tomorrow = new Date(today)
                      tomorrow.setDate(tomorrow.getDate() + 1)
                      const selected = new Date(selectedDate)
                      selected.setHours(0, 0, 0, 0)

                      if (selected.getTime() === today.getTime()) {
                        return "Aujourd'hui"
                      } else if (selected.getTime() === tomorrow.getTime()) {
                        return "Demain"
                      } else {
                        return format(selectedDate, "EEEE d MMMM yyyy", { locale: fr })
                      }
                    })()}
                  </Button>
                  <div className="flex items-center gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setPassengers(Math.max(1, passengers - 1))}
                      disabled={passengers <= 1}
                      className="h-14 w-14 text-xl"
                    >
                      -
                    </Button>
                    <div className="flex-1 text-center">
                      <div className="text-base font-medium">
                        {passengers} passager{passengers > 1 ? 's' : ''}
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setPassengers(Math.min(4, passengers + 1))}
                      disabled={passengers >= 4}
                      className="h-14 w-14 text-xl"
                    >
                      +
                    </Button>
                  </div>
                </div>

                <Button onClick={handleSearch} className="w-full h-14 text-base font-medium">
                  <Search className="size-5 mr-2" />
                  Rechercher
                </Button>
                </div>
              </>
            ) : (
              <div className="bg-card rounded-2xl shadow-sm border p-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => {
                        setTempFilters({
                          departure: filters.departure,
                          destination: filters.destination
                        })
                        setTempDate(selectedDate)
                        setTempPassengers(passengers)
                        setShowSearchEdit(true)
                      }}
                      className="flex items-center gap-2 hover:opacity-70"
                    >
                      <span className="font-medium">{filters.departure || "Départ"}</span>
                      <ArrowRight className="size-4 text-muted-foreground" />
                      <span className="font-medium">{filters.destination || "Destination"}</span>
                    </button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowFilters(true)}
                      className="h-9"
                    >
                      <Filter className="size-4 mr-1" />
                      Filtrer
                    </Button>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <button
                      onClick={() => {
                        setTempFilters({
                          departure: filters.departure,
                          destination: filters.destination
                        })
                        setTempDate(selectedDate)
                        setTempPassengers(passengers)
                        setShowSearchEdit(true)
                      }}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      {(() => {
                        const today = new Date()
                        today.setHours(0, 0, 0, 0)
                        const tomorrow = new Date(today)
                        tomorrow.setDate(tomorrow.getDate() + 1)
                        const selected = new Date(selectedDate)
                        selected.setHours(0, 0, 0, 0)

                        if (selected.getTime() === today.getTime()) {
                          return "Aujourd'hui"
                        } else if (selected.getTime() === tomorrow.getTime()) {
                          return "Demain"
                        } else {
                          return format(selectedDate, "d MMM", { locale: fr })
                        }
                      })()}
                    </button>
                    <span className="text-muted-foreground">•</span>
                    <button
                      onClick={() => {
                        setTempFilters({
                          departure: filters.departure,
                          destination: filters.destination
                        })
                        setTempDate(selectedDate)
                        setTempPassengers(passengers)
                        setShowSearchEdit(true)
                      }}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      {passengers} passager{passengers > 1 ? 's' : ''}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {!hasSearched ? (
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold">Destinations populaires</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {popularRoutes.map((item) => (
                  <button
                    key={item.route}
                    onClick={() => {
                      setFilters(prev => ({
                        ...prev,
                        departure: item.departure,
                        destination: item.destination
                      }))
                    }}
                    className="group relative h-48 overflow-hidden rounded-2xl transition-all hover:scale-[1.02] hover:shadow-lg"
                  >
                    <Image
                      src={item.image}
                      alt={item.route}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 50vw"
                      priority={popularRoutes.indexOf(item) < 2}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      <p className="text-white text-xl font-medium">{item.route}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {loading ? (
                <>
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-48 bg-muted animate-pulse rounded-2xl" />
                  ))}
                </>
              ) : trips.length === 0 ? (
                <div className="text-center py-16 space-y-4">
                  <div className="space-y-2">
                    <p className="text-2xl font-semibold">Aucun trajet disponible</p>
                    <p className="text-muted-foreground">
                      Essayez une autre date ou modifiez vos critères de recherche
                    </p>
                    <Button onClick={() => setHasSearched(false)} variant="outline" className="mt-4">
                      Nouvelle recherche
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      {trips.length} trajet{trips.length > 1 ? 's' : ''} trouvé{trips.length > 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="space-y-4">
                    {trips.map((trip: any) => (
                      <TripCard key={trip.id} trip={trip} />
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      <Dialog open={showCalendar} onOpenChange={setShowCalendar}>
        <DialogContent aria-describedby={undefined} className="!max-w-full !w-screen !h-screen !m-0 !p-0 !rounded-none !left-0 !top-0 !translate-x-0 !translate-y-0 flex flex-col !border-0">
          <DialogHeader className="p-6 pb-4 border-b">
            <DialogTitle className="text-2xl font-bold">Choisissez votre date de départ</DialogTitle>
            <p className="text-sm text-muted-foreground mt-2">Sélectionnez le jour de votre voyage</p>
          </DialogHeader>

          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="sticky top-0 bg-background z-10 px-6 py-4 border-b">
              <div className="w-full max-w-2xl mx-auto">
                <div className="grid grid-cols-7 gap-2">
                  {["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"].map((day, i) => (
                    <div key={i} className="text-center text-sm font-medium text-muted-foreground py-2">
                      {day}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-6">
              <div className="w-full max-w-2xl mx-auto space-y-8">
                {getMonthsToDisplay().map((month, monthIndex) => (
                  <div key={monthIndex}>
                    <h3 className="text-lg font-medium capitalize mb-4">
                      {format(month, "MMMM yyyy", { locale: fr })}
                    </h3>
                    <div className="grid grid-cols-7 gap-2">
                      {getDaysInMonth(month).map((day, dayIndex) => {
                        const isToday = isSameDay(day, new Date())
                        const isSelected = isSameDay(day, selectedDate)
                        const isCurrentMonth = isSameMonth(day, month)
                        const isPast = day < new Date(new Date().setHours(0, 0, 0, 0))

                        return (
                          <button
                            key={dayIndex}
                            onClick={() => !isPast && handleDateSelect(day)}
                            disabled={isPast}
                            className={`
                              aspect-square rounded-xl text-base font-medium transition-all
                              ${!isCurrentMonth && "text-muted-foreground/40"}
                              ${isPast && "opacity-30 cursor-not-allowed"}
                              ${isSelected && "bg-foreground text-background"}
                              ${!isSelected && isToday && "border-2 border-foreground"}
                              ${!isSelected && !isPast && isCurrentMonth && "hover:bg-accent"}
                            `}
                          >
                            {format(day, "d")}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showFilters} onOpenChange={setShowFilters}>
        <DialogContent aria-describedby={undefined} className="!max-w-full !w-screen !h-screen !m-0 !p-0 !rounded-none !left-0 !top-0 !translate-x-0 !translate-y-0 flex flex-col !border-0">
          <DialogHeader className="p-6 pb-4 border-b">
            <DialogTitle className="text-2xl font-bold">Affinez votre recherche</DialogTitle>
            <p className="text-sm text-muted-foreground mt-2">Trouvez le trajet qui vous convient le mieux</p>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto px-6 py-6">
            <div className="w-full max-w-2xl mx-auto space-y-8">
              <div className="space-y-3">
                <h3 className="text-lg font-semibold">Trier les trajets</h3>
                <div className="space-y-2">
                  {[
                    { value: "earliest", label: "Départ le plus tôt", desc: "Les premiers à partir" },
                    { value: "cheapest", label: "Prix le plus bas", desc: "Les plus économiques" },
                    { value: "departure", label: "Proche du départ", desc: "Point de départ pratique" },
                    { value: "arrival", label: "Proche de l'arrivée", desc: "Point d'arrivée pratique" },
                    { value: "shortest", label: "Trajet le plus court", desc: "Moins de temps de route" }
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setFilters(prev => ({ ...prev, sortBy: option.value }))}
                      className={`w-full text-left px-4 py-3 rounded-xl border transition-all ${
                        filters.sortBy === option.value
                          ? "border-primary bg-primary/10 shadow-sm"
                          : "border-border hover:border-primary/50 hover:bg-accent"
                      }`}
                    >
                      <div className="font-medium">{option.label}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{option.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-lg font-semibold">Horaires de départ</h3>
                <p className="text-sm text-muted-foreground">Sélectionnez vos créneaux préférés</p>
                <div className="space-y-2">
                  {(() => {

                    const morningCount = trips.filter((trip: any) => {
                      const hour = new Date(trip.date_time).getHours()
                      return hour >= 6 && hour <= 12
                    }).length

                    const afternoonCount = trips.filter((trip: any) => {
                      const hour = new Date(trip.date_time).getHours()
                      return hour > 12 && hour <= 18
                    }).length

                    const eveningCount = trips.filter((trip: any) => {
                      const hour = new Date(trip.date_time).getHours()
                      return hour > 18 || hour < 6
                    }).length

                    return [
                      { value: "morning", label: "Matin", time: "06:00 - 12:00", emoji: "☀️", count: morningCount },
                      { value: "afternoon", label: "Après-midi", time: "12:01 - 18:00", emoji: "🌤️", count: afternoonCount },
                      { value: "evening", label: "Soir", time: "Après 18:00", emoji: "🌙", count: eveningCount }
                    ]
                  })().map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        const newTimeRange = filters.timeRange.includes(option.value)
                          ? filters.timeRange.filter(t => t !== option.value)
                          : [...filters.timeRange, option.value]
                        setFilters(prev => ({ ...prev, timeRange: newTimeRange }))
                      }}
                      className={`w-full text-left px-4 py-3 rounded-xl border transition-all flex items-center justify-between ${
                        filters.timeRange.includes(option.value)
                          ? "border-primary bg-primary/10 shadow-sm"
                          : "border-border hover:border-primary/50 hover:bg-accent"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{option.emoji}</span>
                        <div>
                          <div className="font-medium">{option.label}</div>
                          <div className="text-xs text-muted-foreground">{option.time}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-muted-foreground">{option.count}</span>
                        {filters.timeRange.includes(option.value) && (
                          <div className="size-5 rounded-full bg-primary flex items-center justify-center">
                            <span className="text-white text-xs">✓</span>
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="border-t p-6 bg-background">
            <div className="w-full max-w-2xl mx-auto flex gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setFilters(prev => ({ ...prev, sortBy: "earliest", timeRange: [] }))
                  setShowFilters(false)
                }}
                className="flex-1 h-12"
              >
                Réinitialiser
              </Button>
              <Button
                onClick={() => {
                  setShowFilters(false)
                  fetchTrips()
                }}
                className="flex-1 h-12"
              >
                Appliquer
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showSearchEdit} onOpenChange={setShowSearchEdit}>
        <DialogContent aria-describedby={undefined} className="!max-w-full !w-screen !h-screen !m-0 !p-0 !rounded-none !left-0 !top-0 !translate-x-0 !translate-y-0 flex flex-col !border-0">
          <DialogHeader className="p-6 pb-4 border-b">
            <DialogTitle className="text-2xl font-bold">Modifier votre recherche</DialogTitle>
            <p className="text-sm text-muted-foreground mt-2">Ajustez vos critères pour trouver d'autres trajets</p>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto px-6 py-6">
            <div className="w-full max-w-2xl mx-auto space-y-5">
              <div>
                <label className="text-sm font-semibold mb-2 block text-foreground">Départ</label>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setLocationInput(tempFilters.departure)
                    setShowSearchEdit(false)
                    setShowLocationDialog("departure")
                  }}
                  className="w-full h-14 text-base justify-start font-normal"
                >
                  {tempFilters.departure || "Choisir votre ville de départ"}
                </Button>
              </div>
              <div>
                <label className="text-sm font-semibold mb-2 block text-foreground">Destination</label>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setLocationInput(tempFilters.destination)
                    setShowSearchEdit(false)
                    setShowLocationDialog("destination")
                  }}
                  className="w-full h-14 text-base justify-start font-normal"
                >
                  {tempFilters.destination || "Choisir votre destination"}
                </Button>
              </div>
              <div>
                <label className="text-sm font-semibold mb-2 block text-foreground">Date du voyage</label>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowSearchEdit(false)
                    setShowCalendar(true)
                  }}
                  className="w-full h-14 text-base justify-start font-normal"
                >
                  {(() => {
                    const today = new Date()
                    today.setHours(0, 0, 0, 0)
                    const tomorrow = new Date(today)
                    tomorrow.setDate(tomorrow.getDate() + 1)
                    const selected = new Date(tempDate)
                    selected.setHours(0, 0, 0, 0)

                    if (selected.getTime() === today.getTime()) {
                      return "Aujourd'hui"
                    } else if (selected.getTime() === tomorrow.getTime()) {
                      return "Demain"
                    } else {
                      return format(tempDate, "EEEE d MMMM yyyy", { locale: fr })
                    }
                  })()}
                </Button>
              </div>
              <div>
                <label className="text-sm font-semibold mb-2 block text-foreground">Nombre de places</label>
                <div className="flex items-center gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setTempPassengers(Math.max(1, tempPassengers - 1))}
                    disabled={tempPassengers <= 1}
                    className="h-14 w-14 text-xl"
                  >
                    -
                  </Button>
                  <div className="flex-1 text-center">
                    <div className="text-base font-medium">
                      {tempPassengers} passager{tempPassengers > 1 ? 's' : ''}
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setTempPassengers(Math.min(4, tempPassengers + 1))}
                    disabled={tempPassengers >= 4}
                    className="h-14 w-14 text-xl"
                  >
                    +
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t p-6 bg-background">
            <div className="w-full max-w-2xl mx-auto">
              <Button
                onClick={() => {
                  setFilters(prev => ({
                    ...prev,
                    departure: tempFilters.departure,
                    destination: tempFilters.destination,
                    date: format(tempDate, "yyyy-MM-dd")
                  }))
                  setSelectedDate(tempDate)
                  setPassengers(tempPassengers)
                  setShowSearchEdit(false)
                  setTimeout(() => fetchTrips(), 100)
                }}
                className="w-full h-12"
              >
                <Search className="size-4 mr-2" />
                Rechercher
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showLocationDialog !== null} onOpenChange={(open) => !open && setShowLocationDialog(null)}>
        <DialogContent aria-describedby={undefined} className="!max-w-full !w-screen !h-screen !m-0 !p-0 !rounded-none !left-0 !top-0 !translate-x-0 !translate-y-0 flex flex-col !border-0">
          <DialogHeader className="p-6 pb-4 border-b">
            <DialogTitle className="text-2xl font-bold">
              {showLocationDialog === "departure" ? "D'où partez-vous ?" : "Où allez-vous ?"}
            </DialogTitle>
            <p className="text-sm text-muted-foreground mt-2">
              {showLocationDialog === "departure"
                ? "Indiquez votre ville de départ"
                : "Indiquez votre destination"}
            </p>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto">
            <div className="p-6">
              <div className="w-full max-w-2xl mx-auto">
                <Input
                  autoFocus
                  placeholder="Rechercher une ville en France..."
                  value={locationInput}
                  onChange={(e) => setLocationInput(e.target.value)}
                  className="h-14 text-base"
                />

                <div className="mt-6 space-y-2">
                  {locationLoading ? (
                    <div className="px-4 py-12 text-center">
                      <div className="inline-block size-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
                      <p className="mt-3 text-sm text-muted-foreground">Recherche en cours...</p>
                    </div>
                  ) : locationSuggestions.length > 0 ? (
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-muted-foreground px-4 py-2">
                        {locationSuggestions.length} ville{locationSuggestions.length > 1 ? 's' : ''} trouvée{locationSuggestions.length > 1 ? 's' : ''}
                      </p>
                      {locationSuggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            const city = suggestion.properties.city || suggestion.properties.label
                            if (showSearchEdit) {
                              if (showLocationDialog === "departure") {
                                setTempFilters(prev => ({ ...prev, departure: city }))
                              } else {
                                setTempFilters(prev => ({ ...prev, destination: city }))
                              }
                              setShowLocationDialog(null)
                              setLocationInput("")
                              setLocationSuggestions([])
                              setShowSearchEdit(true)
                            } else {
                              if (showLocationDialog === "departure") {
                                setFilters(prev => ({ ...prev, departure: city }))
                              } else {
                                setFilters(prev => ({ ...prev, destination: city }))
                              }
                              setShowLocationDialog(null)
                              setLocationInput("")
                              setLocationSuggestions([])
                            }
                          }}
                          className="w-full text-left px-4 py-3 rounded-xl hover:bg-accent transition-colors border border-transparent hover:border-primary/20"
                        >
                          <div className="font-semibold">{suggestion.properties.city}</div>
                          <div className="text-sm text-muted-foreground">
                            {suggestion.properties.context}
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : locationInput.length >= 2 ? (
                    <div className="px-4 py-12 text-center space-y-2">
                      <p className="text-lg font-medium">Aucune ville trouvée</p>
                      <p className="text-sm text-muted-foreground">Essayez avec un autre nom</p>
                    </div>
                  ) : (
                    <div className="px-4 py-12 text-center space-y-2">
                      <p className="text-lg font-medium">Commencez à taper</p>
                      <p className="text-sm text-muted-foreground">Saisissez au moins 2 caractères pour rechercher</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
