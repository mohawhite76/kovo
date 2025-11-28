"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, MapPin, Clock, Users, Euro, Briefcase, MessageCircle, Music, Dog, Cigarette, Zap, Route, Coffee, Navigation, Edit } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, startOfWeek, endOfWeek, setHours, setMinutes } from "date-fns"
import { fr } from "date-fns/locale"
import { tripAPI } from "@/lib/api"
import { useAuthStore } from "@/lib/store"

export default function EditTripPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const user = useAuthStore((state) => state.user)
  const [loading, setLoading] = useState(false)
  const [fetchingTrip, setFetchingTrip] = useState(true)
  const [error, setError] = useState("")
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [showLocationDialog, setShowLocationDialog] = useState<"departure" | "destination" | null>(null)
  const [locationInput, setLocationInput] = useState("")
  const [locationSuggestions, setLocationSuggestions] = useState<any[]>([])
  const [locationLoading, setLocationLoading] = useState(false)
  const [geolocating, setGeolocating] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [selectedTime, setSelectedTime] = useState({
    hours: '10',
    minutes: '00'
  })

  const [formData, setFormData] = useState({
    departure: "",
    destination: "",
    departureCoords: { lat: 0, lng: 0 },
    destinationCoords: { lat: 0, lng: 0 },
    dateTime: "",
    seats: 1,
    price: 0,
    description: "",
    meetingPoint: "",
    distance: undefined as number | undefined,
    duration: undefined as number | undefined,
    luggageSize: "medium",
    petsAllowed: false,
    smokingAllowed: false,
    musicAllowed: true,
    conversationLevel: "moderate",
    detoursAllowed: "discuss",
    plannedStops: "",
    instantBooking: false
  })

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }
    fetchTrip()
  }, [params.id, user, router])

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

  const fetchTrip = async () => {
    try {
      const { data } = await tripAPI.getTripById(params.id)
      const trip = data.trip

      if (trip.driver_id !== user?.id) {
        router.push(`/trips/${params.id}`)
        return
      }

      const tripDate = trip.date_time ? new Date(trip.date_time) : new Date()

      setFormData({
        departure: trip.departure || "",
        destination: trip.destination || "",
        departureCoords: {
          lat: parseFloat(trip.departure_lat) || 0,
          lng: parseFloat(trip.departure_lng) || 0
        },
        destinationCoords: {
          lat: parseFloat(trip.destination_lat) || 0,
          lng: parseFloat(trip.destination_lng) || 0
        },
        dateTime: trip.date_time ? format(tripDate, "yyyy-MM-dd'T'HH:mm") : "",
        seats: trip.seats_available || 1,
        price: trip.price || 0,
        description: trip.description || "",
        meetingPoint: trip.meeting_point || "",
        distance: trip.distance,
        duration: trip.duration,
        luggageSize: trip.luggage_size || "medium",
        petsAllowed: trip.pets_allowed || false,
        smokingAllowed: trip.smoking_allowed || false,
        musicAllowed: trip.music_allowed !== false,
        conversationLevel: trip.conversation_level || "moderate",
        detoursAllowed: trip.detours_allowed || "discuss",
        plannedStops: trip.planned_stops || "",
        instantBooking: trip.instant_booking || false
      })

      setSelectedDate(tripDate)
      setSelectedTime({
        hours: format(tripDate, 'HH'),
        minutes: format(tripDate, 'mm')
      })
    } catch (err) {
      console.error('Error fetching trip:', err)
      setError("Trajet non trouvé")
    } finally {
      setFetchingTrip(false)
    }
  }

  const handleGeolocation = () => {
    if (!navigator.geolocation) {
      return
    }

    setGeolocating(true)
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const response = await fetch(
            `https://api-adresse.data.gouv.fr/reverse/?lon=${position.coords.longitude}&lat=${position.coords.latitude}`
          )
          const data = await response.json()
          if (data.features && data.features.length > 0) {
            const feature = data.features[0]
            const city = feature.properties.city || feature.properties.label
            const coords = {
              lat: feature.geometry.coordinates[1],
              lng: feature.geometry.coordinates[0]
            }
            setFormData(prev => ({
              ...prev,
              departure: city,
              departureCoords: coords
            }))

            if (formData.destinationCoords.lat !== 0) {
              calculateRoute(coords, formData.destinationCoords)
            }
          }
        } catch (error) {
          console.error("Error reverse geocoding:", error)
        } finally {
          setGeolocating(false)
          setShowLocationDialog(null)
        }
      },
      (error) => {
        console.error("Geolocation error:", error)
        setGeolocating(false)
      }
    )
  }

  const handleLocationSelect = (suggestion: any) => {
    const city = suggestion.properties.city || suggestion.properties.label
    const coords = {
      lat: suggestion.geometry.coordinates[1],
      lng: suggestion.geometry.coordinates[0]
    }

    if (showLocationDialog === "departure") {
      setFormData(prev => ({
        ...prev,
        departure: city,
        departureCoords: coords
      }))
      if (formData.destinationCoords.lat !== 0) {
        calculateRoute(coords, formData.destinationCoords)
      }
    } else {
      setFormData(prev => ({
        ...prev,
        destination: city,
        destinationCoords: coords
      }))
      if (formData.departureCoords.lat !== 0) {
        calculateRoute(formData.departureCoords, coords)
      }
    }

    setShowLocationDialog(null)
    setLocationInput("")
    setLocationSuggestions([])
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'seats' || name === 'price' ? Number(value) : value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const tripData: any = {
        departure: formData.departure,
        destination: formData.destination,
        departure_lat: formData.departureCoords.lat,
        departure_lng: formData.departureCoords.lng,
        destination_lat: formData.destinationCoords.lat,
        destination_lng: formData.destinationCoords.lng,
        distance: formData.distance,
        duration: formData.duration,
        date_time: formData.dateTime,
        price: formData.price,
        seats_available: formData.seats,
        meeting_point: formData.meetingPoint || undefined,
        description: formData.description || undefined,
        luggage_size: formData.luggageSize,
        pets_allowed: formData.petsAllowed,
        smoking_allowed: formData.smokingAllowed,
        music_allowed: formData.musicAllowed,
        conversation_level: formData.conversationLevel,
        detours_allowed: formData.detoursAllowed,
        planned_stops: formData.plannedStops || undefined,
        instant_booking: formData.instantBooking
      }

      await tripAPI.updateTrip(params.id, tripData)
      router.push(`/trips/${params.id}`)
    } catch (err: any) {
      console.error('Update trip error:', err.response?.data)
      setError(err.response?.data?.error || "Erreur lors de la modification du trajet")
    } finally {
      setLoading(false)
    }
  }

  const calculateRoute = async (departure: { lat: number; lng: number }, destination: { lat: number; lng: number }) => {
    try {
      const response = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${departure.lng},${departure.lat};${destination.lng},${destination.lat}?overview=false`
      )
      const data = await response.json()

      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0]
        const distance = Math.round(route.distance / 1000)
        const duration = Math.round(route.duration / 60)

        setFormData(prev => ({
          ...prev,
          distance,
          duration
        }))
      }
    } catch (error) {
      console.error("Erreur lors du calcul du trajet:", error)
    }
  }

  const handleDateTimeConfirm = () => {
    const dateWithTime = setMinutes(setHours(selectedDate, parseInt(selectedTime.hours)), parseInt(selectedTime.minutes))
    const formattedDateTime = format(dateWithTime, "yyyy-MM-dd'T'HH:mm")
    setFormData(prev => ({
      ...prev,
      dateTime: formattedDateTime
    }))
    setShowDatePicker(false)
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

  const getDateTimeDisplay = () => {
    if (!formData.dateTime) {
      return "Date et heure du départ"
    }
    const date = new Date(formData.dateTime)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    const selectedDay = new Date(date)
    selectedDay.setHours(0, 0, 0, 0)

    let dateStr = ""
    if (selectedDay.getTime() === today.getTime()) {
      dateStr = "Aujourd'hui"
    } else if (selectedDay.getTime() === tomorrow.getTime()) {
      dateStr = "Demain"
    } else {
      dateStr = format(date, "EEEE d MMMM", { locale: fr })
    }
    return `${dateStr} à ${format(date, "HH:mm")}`
  }

  if (!user || fetchingTrip) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded-2xl w-1/3" />
          <div className="h-64 bg-muted rounded-2xl" />
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="bg-gradient-to-b from-primary/5 to-transparent border-b">
        <div className="container mx-auto px-4 py-12 max-w-6xl">
          <div className="mb-6">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/my-trips">
                <ArrowLeft className="size-4 mr-2" />
                Retour
              </Link>
            </Button>
          </div>
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-6xl font-bold">Modifier le trajet</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Mettez à jour les informations de votre trajet
            </p>
            <div className="flex flex-wrap justify-center gap-6 pt-4">
              <div className="flex items-center gap-2">
                <div className="size-10 rounded-full bg-green-100 dark:bg-green-950 flex items-center justify-center">
                  <Euro className="size-5 text-green-600" />
                </div>
                <span className="text-sm font-medium">Économisez</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="size-10 rounded-full bg-blue-100 dark:bg-blue-950 flex items-center justify-center">
                  <Users className="size-5 text-blue-600" />
                </div>
                <span className="text-sm font-medium">Rencontrez</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="size-10 rounded-full bg-purple-100 dark:bg-purple-950 flex items-center justify-center">
                  <MapPin className="size-5 text-purple-600" />
                </div>
                <span className="text-sm font-medium">Voyagez</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="text-sm text-destructive bg-destructive/10 p-4 rounded-xl border border-destructive/20">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center">
                <MapPin className="size-5 text-primary" />
              </div>
              <h2 className="text-2xl font-bold">Itinéraire</h2>
            </div>
            <div className="bg-card rounded-2xl shadow-sm border p-6 space-y-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setLocationInput(formData.departure)
                  setShowLocationDialog("departure")
                }}
                className="w-full h-14 text-base justify-start font-normal"
              >
                {formData.departure || "D'où partez-vous ?"}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setLocationInput(formData.destination)
                  setShowLocationDialog("destination")
                }}
                className="w-full h-14 text-base justify-start font-normal"
              >
                {formData.destination || "Où allez-vous ?"}
              </Button>

              {formData.distance && formData.duration && (
                <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-xl">
                  <div className="flex items-center gap-2">
                    <Route className="size-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{formData.distance} km</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="size-4 text-muted-foreground" />
                    <span className="text-sm font-medium">
                      {Math.floor(formData.duration / 60)}h{formData.duration % 60 > 0 ? `${formData.duration % 60}min` : ''}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Clock className="size-5 text-primary" />
              </div>
              <h2 className="text-2xl font-bold">Date et heure</h2>
            </div>
            <div className="bg-card rounded-2xl shadow-sm border p-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowDatePicker(true)}
                className="w-full h-14 text-base justify-start font-normal"
              >
                {getDateTimeDisplay()}
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Users className="size-5 text-primary" />
              </div>
              <h2 className="text-2xl font-bold">Places et prix</h2>
            </div>
            <div className="bg-card rounded-2xl shadow-sm border p-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Nombre de places</Label>
                  <div className="relative">
                    <Input
                      id="seats"
                      name="seats"
                      type="number"
                      min="1"
                      max="4"
                      value={formData.seats}
                      onChange={handleChange}
                      required
                      className="h-14 text-base pr-16"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground pointer-events-none">
                      places
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Prix par personne</Label>
                  <div className="relative">
                    <Input
                      id="price"
                      name="price"
                      type="number"
                      min="0"
                      max="500"
                      step="0.5"
                      value={formData.price}
                      onChange={handleChange}
                      required
                      className="h-14 text-base pr-12"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground pointer-events-none">
                      €
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center">
                <MessageCircle className="size-5 text-primary" />
              </div>
              <h2 className="text-2xl font-bold">Informations</h2>
            </div>
            <div className="bg-card rounded-2xl shadow-sm border p-6 space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Point de rencontre (optionnel)</Label>
                <Input
                  id="meetingPoint"
                  name="meetingPoint"
                  placeholder="Ex: Devant la gare, parking du centre commercial..."
                  value={formData.meetingPoint}
                  onChange={handleChange}
                  className="h-14 text-base"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Description (optionnel)</Label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Décrivez votre trajet, vos horaires flexibles, etc."
                  className="flex min-h-[120px] w-full rounded-xl border border-input bg-background px-4 py-3 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  maxLength={500}
                />
                <p className="text-sm text-muted-foreground text-right">
                  {formData.description.length}/500 caractères
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Briefcase className="size-5 text-primary" />
              </div>
              <h2 className="text-2xl font-bold">Préférences</h2>
            </div>
            <div className="bg-card rounded-2xl shadow-sm border p-6 space-y-5">
              <div className="space-y-3">
                <Label className="text-sm font-semibold">Taille des bagages acceptés</Label>
                <Select value={formData.luggageSize} onValueChange={(value) => setFormData(prev => ({ ...prev, luggageSize: value }))}>
                  <SelectTrigger className="h-14 text-base">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="small">Petit sac à dos</SelectItem>
                    <SelectItem value="medium">Valise moyenne</SelectItem>
                    <SelectItem value="large">Grandes valises</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-semibold">Ambiance durant le trajet</Label>
                <Select value={formData.conversationLevel} onValueChange={(value) => setFormData(prev => ({ ...prev, conversationLevel: value }))}>
                  <SelectTrigger className="h-14 text-base">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="talkative">Bavard - J'aime discuter</SelectItem>
                    <SelectItem value="moderate">Modéré - Selon l'envie</SelectItem>
                    <SelectItem value="quiet">Calme - Je préfère le silence</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-semibold">Options du trajet</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, petsAllowed: !prev.petsAllowed }))}
                    className={`flex items-center gap-3 p-4 rounded-xl border transition-all ${
                      formData.petsAllowed
                        ? 'border-green-500 bg-green-50 dark:bg-green-950'
                        : 'border-border hover:border-primary/50 hover:bg-accent'
                    }`}
                  >
                    <div className={`size-10 rounded-full flex items-center justify-center ${
                      formData.petsAllowed ? 'bg-green-100 dark:bg-green-900' : 'bg-muted'
                    }`}>
                      <Dog className={`size-5 ${formData.petsAllowed ? 'text-green-600' : 'text-muted-foreground'}`} />
                    </div>
                    <span className={`font-medium ${formData.petsAllowed ? 'text-green-700 dark:text-green-300' : ''}`}>Animaux</span>
                    {formData.petsAllowed && (
                      <div className="ml-auto size-5 rounded-full bg-green-500 flex items-center justify-center">
                        <span className="text-white text-xs">✓</span>
                      </div>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, smokingAllowed: !prev.smokingAllowed }))}
                    className={`flex items-center gap-3 p-4 rounded-xl border transition-all ${
                      formData.smokingAllowed
                        ? 'border-orange-500 bg-orange-50 dark:bg-orange-950'
                        : 'border-border hover:border-primary/50 hover:bg-accent'
                    }`}
                  >
                    <div className={`size-10 rounded-full flex items-center justify-center ${
                      formData.smokingAllowed ? 'bg-orange-100 dark:bg-orange-900' : 'bg-muted'
                    }`}>
                      <Cigarette className={`size-5 ${formData.smokingAllowed ? 'text-orange-600' : 'text-muted-foreground'}`} />
                    </div>
                    <span className={`font-medium ${formData.smokingAllowed ? 'text-orange-700 dark:text-orange-300' : ''}`}>Fumeur</span>
                    {formData.smokingAllowed && (
                      <div className="ml-auto size-5 rounded-full bg-orange-500 flex items-center justify-center">
                        <span className="text-white text-xs">✓</span>
                      </div>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, musicAllowed: !prev.musicAllowed }))}
                    className={`flex items-center gap-3 p-4 rounded-xl border transition-all ${
                      formData.musicAllowed
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-950'
                        : 'border-border hover:border-primary/50 hover:bg-accent'
                    }`}
                  >
                    <div className={`size-10 rounded-full flex items-center justify-center ${
                      formData.musicAllowed ? 'bg-purple-100 dark:bg-purple-900' : 'bg-muted'
                    }`}>
                      <Music className={`size-5 ${formData.musicAllowed ? 'text-purple-600' : 'text-muted-foreground'}`} />
                    </div>
                    <span className={`font-medium ${formData.musicAllowed ? 'text-purple-700 dark:text-purple-300' : ''}`}>Musique</span>
                    {formData.musicAllowed && (
                      <div className="ml-auto size-5 rounded-full bg-purple-500 flex items-center justify-center">
                        <span className="text-white text-xs">✓</span>
                      </div>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, instantBooking: !prev.instantBooking }))}
                    className={`flex items-center gap-3 p-4 rounded-xl border transition-all ${
                      formData.instantBooking
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
                        : 'border-border hover:border-primary/50 hover:bg-accent'
                    }`}
                  >
                    <div className={`size-10 rounded-full flex items-center justify-center ${
                      formData.instantBooking ? 'bg-blue-100 dark:bg-blue-900' : 'bg-muted'
                    }`}>
                      <Zap className={`size-5 ${formData.instantBooking ? 'text-blue-600' : 'text-muted-foreground'}`} />
                    </div>
                    <span className={`font-medium ${formData.instantBooking ? 'text-blue-700 dark:text-blue-300' : ''}`}>Instantané</span>
                    {formData.instantBooking && (
                      <div className="ml-auto size-5 rounded-full bg-blue-500 flex items-center justify-center">
                        <span className="text-white text-xs">✓</span>
                      </div>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Route className="size-5 text-primary" />
              </div>
              <h2 className="text-2xl font-bold">Flexibilité</h2>
            </div>
            <div className="bg-card rounded-2xl shadow-sm border p-6 space-y-5">
              <div className="space-y-3">
                <Label className="text-sm font-semibold">Détours possibles</Label>
                <Select value={formData.detoursAllowed} onValueChange={(value) => setFormData(prev => ({ ...prev, detoursAllowed: value }))}>
                  <SelectTrigger className="h-14 text-base">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yes">Oui, je peux faire des détours</SelectItem>
                    <SelectItem value="no">Non, trajet direct uniquement</SelectItem>
                    <SelectItem value="discuss">À discuter</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-semibold">Arrêts prévus (optionnel)</Label>
                <div className="relative">
                  <Coffee className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
                  <Input
                    id="plannedStops"
                    name="plannedStops"
                    placeholder="Ex: Pause café à mi-chemin, arrêt essence..."
                    value={formData.plannedStops}
                    onChange={handleChange}
                    className="h-14 text-base pl-12"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              className="flex-1 h-14 text-base"
            >
              Annuler
            </Button>
            <Button type="submit" disabled={loading} className="flex-1 h-14 text-base font-medium">
              {loading ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </div>
        </form>
      </div>

      <Dialog open={showDatePicker} onOpenChange={setShowDatePicker}>
        <DialogContent className="!max-w-full !w-screen !h-screen !m-0 !p-0 !rounded-none !left-0 !top-0 !translate-x-0 !translate-y-0 flex flex-col !border-0">
          <DialogHeader className="p-6 pb-4 border-b">
            <DialogTitle className="text-2xl font-bold">Quand partez-vous ?</DialogTitle>
            <p className="text-sm text-muted-foreground mt-2">Sélectionnez la date et l'heure de départ</p>
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
                            onClick={() => !isPast && setSelectedDate(day)}
                            disabled={isPast}
                            type="button"
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

            <div className="border-t p-6 bg-background">
              <div className="w-full max-w-2xl mx-auto space-y-4">
                <div>
                  <label className="text-sm font-semibold mb-2 block">Heure de départ</label>
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      type="number"
                      min="0"
                      max="23"
                      value={selectedTime.hours}
                      onChange={(e) => setSelectedTime(prev => ({ ...prev, hours: e.target.value.padStart(2, '0') }))}
                      placeholder="HH"
                      className="h-14 text-center text-lg"
                    />
                    <Input
                      type="number"
                      min="0"
                      max="59"
                      value={selectedTime.minutes}
                      onChange={(e) => setSelectedTime(prev => ({ ...prev, minutes: e.target.value.padStart(2, '0') }))}
                      placeholder="MM"
                      className="h-14 text-center text-lg"
                    />
                  </div>
                </div>
                <Button onClick={handleDateTimeConfirm} className="w-full h-14 text-base font-medium">
                  Confirmer
                </Button>
              </div>
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

                {showLocationDialog === "departure" && (
                  <button
                    type="button"
                    onClick={handleGeolocation}
                    disabled={geolocating}
                    className="w-full mt-4 flex items-center gap-3 p-4 rounded-xl border border-primary/20 bg-primary/5 hover:bg-primary/10 transition-colors"
                  >
                    <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Navigation className={`size-5 text-primary ${geolocating ? 'animate-pulse' : ''}`} />
                    </div>
                    <span className="font-medium">
                      {geolocating ? "Localisation en cours..." : "Utiliser ma position actuelle"}
                    </span>
                  </button>
                )}

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
                          type="button"
                          onClick={() => handleLocationSelect(suggestion)}
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
