"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import dynamic from "next/dynamic"
import { ArrowLeft, Users, MessageSquare, Luggage, PawPrint, Cigarette, Music, MessageCircle, Navigation, Coffee, CheckCircle, XCircle, Car } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { tripAPI, bookingAPI } from "@/lib/api"
import { useAuthStore } from "@/lib/store"
import { formatDate, formatCurrency } from "@/lib/utils"

const RouteMap = dynamic(() => import("@/components/trip/route-map").then((mod) => mod.RouteMap), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[400px] bg-muted rounded-2xl flex items-center justify-center">
      <p className="text-muted-foreground">Chargement de la carte...</p>
    </div>
  ),
})

export default function TripDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const user = useAuthStore((state) => state.user)
  const [trip, setTrip] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [booking, setBooking] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  useEffect(() => {
    fetchTrip()
  }, [params.id])

  const fetchTrip = async () => {
    try {
      const { data } = await tripAPI.getTripById(params.id)
      setTrip(data.trip)
    } catch (err) {
      console.error('Error fetching trip:', err)
      setError("Trajet non trouvé")
    } finally {
      setLoading(false)
    }
  }

  const handleBook = async () => {
    if (!user) {
      router.push('/login')
      return
    }

    setBooking(true)
    setError("")
    setSuccess("")

    try {
      const { data } = await bookingAPI.createBooking({ tripId: params.id, seats: 1 })
      fetchTrip()

      if (data.booking.status === 'confirmed') {
        setSuccess("Réservation confirmée ! Vous avez une place réservée pour ce trajet.")
      } else {
        setSuccess("Réservation envoyée ! Le conducteur doit la confirmer.")
      }
    } catch (err: any) {
      setError(err.response?.data?.error || "Erreur lors de la réservation")
    } finally {
      setBooking(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded-2xl w-1/3" />
          <div className="h-64 bg-muted rounded-2xl" />
        </div>
      </div>
    )
  }

  if (error || !trip) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        <div className="bg-card rounded-2xl shadow-sm border p-12 text-center">
          <p className="text-muted-foreground mb-4">{error || "Trajet non trouvé"}</p>
          <Button asChild className="h-12">
            <Link href="/">Retour à l'accueil</Link>
          </Button>
        </div>
      </div>
    )
  }

  const isDriver = user?.id === trip.driver_id
  const availableSeats = trip.seats_available - (trip.bookedSeats || 0)
  const userBooking = trip.bookings?.find((b: any) => b.passenger?.id === user?.id)
  const hasActiveBooking = userBooking && ['pending', 'confirmed'].includes(userBooking.status)

  return (
    <div className="container mx-auto px-4 py-6 max-w-2xl">
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/">
            <ArrowLeft className="size-4 mr-2" />
            Retour
          </Link>
        </Button>
      </div>

      <div className="space-y-4">
        <div className="bg-card rounded-2xl shadow-sm border p-6">
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="size-3 rounded-full bg-primary" />
                <h2 className="text-2xl font-bold">{trip.departure}</h2>
              </div>
              <div className="flex items-center gap-3 my-4 ml-1.5">
                <div className="h-12 w-px bg-border" />
                <span className="text-sm text-muted-foreground">
                  {trip.distance && `${trip.distance} km`}
                  {trip.duration && trip.distance && ' · '}
                  {trip.duration && (trip.duration >= 60
                    ? `${Math.floor(trip.duration / 60)}h${trip.duration % 60 > 0 ? ` ${trip.duration % 60}min` : ''}`
                    : `${trip.duration} min`)}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="size-3 rounded-full bg-primary" />
                <h2 className="text-2xl font-bold">{trip.destination}</h2>
              </div>
            </div>

            <div className="border-t pt-6 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-muted-foreground">Date et heure de départ</span>
                <span className="font-semibold">{formatDate(trip.date_time)}</span>
              </div>

              {trip.duration && (
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-muted-foreground">Arrivée estimée</span>
                  <span className="font-semibold">
                    {(() => {
                      const departureDate = new Date(trip.date_time)
                      const arrivalDate = new Date(departureDate.getTime() + trip.duration * 60000)
                      return arrivalDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
                    })()}
                  </span>
                </div>
              )}

              <div className="flex justify-between items-center py-3 bg-primary/5 rounded-lg px-4">
                <span className="text-sm font-medium">Prix par personne</span>
                <span className="text-2xl font-bold text-primary">{formatCurrency(trip.price)}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-muted-foreground">Places disponibles</span>
                <span className="font-semibold flex items-center gap-2">
                  <Users className="size-4 text-primary" />
                  {availableSeats} place{availableSeats > 1 ? 's' : ''}
                </span>
              </div>
            </div>

            {trip.meeting_point && (
              <div className="pt-4 border-t">
                <h3 className="text-sm font-semibold mb-2 text-muted-foreground">Point de rencontre</h3>
                <p className="font-medium">{trip.meeting_point}</p>
              </div>
            )}

            {trip.description && (
              <div className="pt-4 border-t">
                <h3 className="text-sm font-semibold mb-2 text-muted-foreground">Description du trajet</h3>
                <p className="text-sm leading-relaxed">{trip.description}</p>
              </div>
            )}

            <div className="pt-4 border-t">
              <h3 className="text-sm font-semibold mb-3 text-muted-foreground">Préférences de voyage</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2 text-sm p-2 rounded-lg bg-muted/50">
                  <Luggage className="size-4 text-primary" />
                  <span>
                    {trip.luggage_size === 'small' && 'Petit sac'}
                    {trip.luggage_size === 'medium' && 'Valise moyenne'}
                    {trip.luggage_size === 'large' && 'Grandes valises'}
                  </span>
                </div>

                <div className={`flex items-center gap-2 text-sm p-2 rounded-lg ${trip.pets_allowed ? 'bg-green-50 dark:bg-green-950' : 'bg-muted/50'}`}>
                  {trip.pets_allowed ? (
                    <>
                      <PawPrint className="size-4 text-green-600" />
                      <span>Animaux acceptés</span>
                    </>
                  ) : (
                    <>
                      <PawPrint className="size-4 text-muted-foreground opacity-50" />
                      <span className="text-muted-foreground">Pas d'animaux</span>
                    </>
                  )}
                </div>

                <div className={`flex items-center gap-2 text-sm p-2 rounded-lg ${trip.smoking_allowed ? 'bg-orange-50 dark:bg-orange-950' : 'bg-muted/50'}`}>
                  {trip.smoking_allowed ? (
                    <>
                      <Cigarette className="size-4 text-orange-600" />
                      <span>Fumeur autorisé</span>
                    </>
                  ) : (
                    <>
                      <Cigarette className="size-4 text-muted-foreground opacity-50" />
                      <span className="text-muted-foreground">Non-fumeur</span>
                    </>
                  )}
                </div>

                <div className={`flex items-center gap-2 text-sm p-2 rounded-lg ${trip.music_allowed ? 'bg-purple-50 dark:bg-purple-950' : 'bg-muted/50'}`}>
                  {trip.music_allowed ? (
                    <>
                      <Music className="size-4 text-purple-600" />
                      <span>Musique</span>
                    </>
                  ) : (
                    <>
                      <Music className="size-4 text-muted-foreground opacity-50" />
                      <span className="text-muted-foreground">Silence</span>
                    </>
                  )}
                </div>

                <div className="flex items-center gap-2 text-sm p-2 rounded-lg bg-muted/50">
                  <MessageCircle className="size-4 text-primary" />
                  <span>
                    {trip.conversation_level === 'talkative' && 'Bavard'}
                    {trip.conversation_level === 'moderate' && 'Modéré'}
                    {trip.conversation_level === 'quiet' && 'Calme'}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-sm p-2 rounded-lg bg-muted/50">
                  <Navigation className="size-4 text-primary" />
                  <span>
                    {trip.detours_allowed === 'yes' && 'Détours possibles'}
                    {trip.detours_allowed === 'no' && 'Trajet direct'}
                    {trip.detours_allowed === 'discuss' && 'Détours à discuter'}
                  </span>
                </div>

                {trip.instant_booking && (
                  <div className="flex items-center gap-2 text-sm col-span-2 p-2 rounded-lg bg-green-50 dark:bg-green-950">
                    <CheckCircle className="size-4 text-green-600" />
                    <span className="font-medium text-green-600">Réservation instantanée</span>
                  </div>
                )}
              </div>

              {trip.planned_stops && (
                <div className="mt-3 pt-3 border-t">
                  <div className="flex items-start gap-2 text-sm">
                    <Coffee className="size-4 text-muted-foreground mt-0.5" />
                    <div>
                      <span className="text-muted-foreground block mb-1">Arrêts prévus</span>
                      <span>{trip.planned_stops}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {success && (
            <div className="text-sm text-green-600 bg-green-50 p-3 rounded-md">
              {success}
            </div>
          )}

          {error && (
            <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
              {error}
            </div>
          )}

          {!isDriver && user && (
            <Button
              onClick={handleBook}
              disabled={booking || availableSeats === 0 || hasActiveBooking || userBooking?.status === 'rejected'}
              className="w-full h-14 text-base font-medium"
            >
              {booking
                ? "Réservation..."
                : userBooking?.status === 'confirmed'
                  ? "Accepté"
                  : userBooking?.status === 'pending'
                    ? "En attente"
                    : userBooking?.status === 'rejected'
                      ? "Refusé"
                      : availableSeats === 0
                        ? "Complet"
                        : "Réserver"}
            </Button>
          )}

          {!user && (
            <Button asChild className="w-full h-14 text-base font-medium">
              <Link href="/login">Se connecter pour réserver</Link>
            </Button>
          )}

          {isDriver && (
            <Button asChild className="w-full h-14 text-base font-medium" variant="outline">
              <Link href={`/trips/${params.id}/bookings`}>
                Gérer les réservations
              </Link>
            </Button>
          )}
        </div>
      </div>

      {trip.departure_lat && trip.departure_lng && trip.destination_lat && trip.destination_lng && (
        <div className="bg-card rounded-2xl shadow-sm border p-6">
          <h3 className="text-lg font-semibold mb-4">Itinéraire sur la carte</h3>
          <RouteMap
            departure={{
              name: trip.departure,
              lat: parseFloat(trip.departure_lat),
              lng: parseFloat(trip.departure_lng),
            }}
            destination={{
              name: trip.destination,
              lat: parseFloat(trip.destination_lat),
              lng: parseFloat(trip.destination_lng),
            }}
          />
        </div>
      )}

      <div className="bg-card rounded-2xl shadow-sm border p-6">
        <h3 className="text-lg font-medium mb-4">Conducteur</h3>
        <div className="flex items-center gap-4">
          <Avatar className="size-16">
            <AvatarImage src={trip.driver?.avatar} alt={trip.driver?.first_name} />
            <AvatarFallback className="text-lg">
              {trip.driver?.first_name?.[0]}{trip.driver?.last_name?.[0]}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="font-medium text-lg">
              {trip.driver?.first_name} {trip.driver?.last_name}
            </p>
            <p className="text-sm text-muted-foreground">{trip.driver?.university}</p>
          </div>
          {!isDriver && user && (
            <Button variant="outline" size="sm" asChild className="h-10">
              <Link href={`/messages/${trip.driver_id}?trip=${trip.id}`}>
                <MessageSquare className="size-4 mr-2" />
                Message
              </Link>
            </Button>
          )}
        </div>
      </div>

      {(trip.driver?.vehicle_brand || trip.driver?.vehicle_model) && (
        <div className="bg-card rounded-2xl shadow-sm border p-6">
          <h3 className="text-lg font-medium mb-4">Véhicule</h3>
          <div className="space-y-4">
            {trip.driver?.vehicle_photo && (
              <div className="w-full rounded-xl overflow-hidden">
                <img
                  src={trip.driver.vehicle_photo}
                  alt={`${trip.driver.vehicle_brand} ${trip.driver.vehicle_model}`}
                  className="w-full h-48 object-cover"
                />
              </div>
            )}
            <div className="flex items-start gap-4">
              <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Car className="size-8 text-primary" />
              </div>
              <div className="flex-1 space-y-2">
                <p className="font-medium text-lg">
                  {trip.driver?.vehicle_brand} {trip.driver?.vehicle_model}
                </p>
                <div className="space-y-1">
                  {trip.driver?.vehicle_color && (
                    <p className="text-sm text-muted-foreground">
                      Couleur : {trip.driver?.vehicle_color}
                    </p>
                  )}
                  {trip.driver?.vehicle_plate && (
                    <p className="text-sm">
                      <span className="font-mono font-medium bg-muted px-2 py-1 rounded">
                        {trip.driver?.vehicle_plate}
                      </span>
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
