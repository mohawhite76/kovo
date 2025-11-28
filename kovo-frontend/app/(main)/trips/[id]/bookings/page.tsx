"use client"

import { useEffect, useState } from "react"
import { ArrowLeft, Check, X, User, Users, Calendar, MapPin, MessageSquare } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { tripAPI, bookingAPI } from "@/lib/api"
import { useAuthStore } from "@/lib/store"
import { formatDate } from "@/lib/utils"

export default function TripBookingsPage({ params }: { params: { id: string } }) {
  const user = useAuthStore((state) => state.user)
  const [trip, setTrip] = useState<any>(null)
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [processingId, setProcessingId] = useState<string | null>(null)

  useEffect(() => {
    fetchData()
  }, [params.id])

  const fetchData = async () => {
    try {
      const [tripData, bookingsData] = await Promise.all([
        tripAPI.getTripById(params.id),
        bookingAPI.getTripBookings(params.id)
      ])
      setTrip(tripData.data.trip)
      setBookings(bookingsData.data.bookings)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (bookingId: string, status: 'confirmed' | 'rejected') => {
    setProcessingId(bookingId)
    try {
      await bookingAPI.updateBookingStatus(bookingId, status)
      fetchData()
    } catch (error) {
      console.error('Error updating booking:', error)
      alert('Erreur lors de la mise à jour de la réservation')
    } finally {
      setProcessingId(null)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3" />
          <div className="h-64 bg-muted rounded" />
        </div>
      </div>
    )
  }

  if (!trip || trip.driver_id !== user?.id) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="bg-card rounded-2xl shadow-sm border p-12 text-center">
          <div className="size-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
            <X className="size-8 text-destructive" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Accès non autorisé</h2>
          <p className="text-muted-foreground mb-6">Vous n'avez pas accès à cette page</p>
          <Button asChild className="h-12 px-6">
            <Link href="/">Retour à l'accueil</Link>
          </Button>
        </div>
      </div>
    )
  }

  const pendingBookings = bookings.filter((b: any) => b.status === 'pending')
  const confirmedBookings = bookings.filter((b: any) => b.status === 'confirmed')
  const rejectedBookings = bookings.filter((b: any) => b.status === 'rejected')

  return (
    <div className="container mx-auto px-4 py-6 max-w-2xl">
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/trips/${params.id}`}>
            <ArrowLeft className="size-4 mr-2" />
            Retour au trajet
          </Link>
        </Button>
      </div>

      <div className="space-y-4 mb-6">
        <h1 className="text-4xl md:text-5xl font-bold">Réservations</h1>
        <p className="text-lg text-muted-foreground">Gérez les demandes pour votre trajet</p>
      </div>

      {/* Résumé du trajet */}
      <div className="bg-card rounded-2xl shadow-sm border p-5 mb-6">
        <div className="flex items-start gap-4">
          <div className="flex flex-col items-center pt-1">
            <div className="size-3 rounded-full bg-primary" />
            <div className="w-0.5 h-6 bg-gradient-to-b from-primary to-primary/30 my-1" />
            <div className="size-3 rounded-full border-2 border-primary bg-background" />
          </div>
          <div className="flex-1">
            <p className="font-semibold">{trip.departure}</p>
            <p className="text-sm text-muted-foreground mt-4">{trip.destination}</p>
          </div>
        </div>
        <div className="flex items-center gap-4 mt-4 pt-4 border-t text-sm">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Calendar className="size-4" />
            <span>{formatDate(trip.date_time)}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Users className="size-4 text-primary" />
            <span className="font-medium">{trip.seats_available} / {trip.total_seats} places</span>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        {/* Demandes en attente */}
        {pendingBookings.length > 0 && (
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="size-10 rounded-full bg-yellow-100 dark:bg-yellow-950 flex items-center justify-center">
                <span className="text-yellow-600 font-semibold">{pendingBookings.length}</span>
              </div>
              <div>
                <h2 className="text-lg font-semibold">En attente</h2>
                <p className="text-sm text-muted-foreground">Demandes à traiter</p>
              </div>
            </div>
            <div className="space-y-3">
              {pendingBookings.map((booking: any) => (
                <div key={booking.id} className="bg-card rounded-2xl shadow-sm border p-5 space-y-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="size-12 ring-2 ring-yellow-500/20">
                      <AvatarImage src={booking.passenger?.avatar} />
                      <AvatarFallback className="bg-primary/10 text-primary font-medium">
                        {booking.passenger?.first_name[0]}{booking.passenger?.last_name[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-semibold text-lg">
                        {booking.passenger?.first_name} {booking.passenger?.last_name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {booking.passenger?.university}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-sm font-medium">
                        <Users className="size-4" />
                        {booking.seats} place{booking.seats > 1 ? 's' : ''}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(booking.created_at).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={() => handleStatusChange(booking.id, 'rejected')}
                      disabled={processingId === booking.id}
                      className="flex-1 h-11 text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <X className="size-4 mr-2" />
                      Refuser
                    </Button>
                    <Button
                      onClick={() => handleStatusChange(booking.id, 'confirmed')}
                      disabled={processingId === booking.id}
                      className="flex-1 h-11"
                    >
                      <Check className="size-4 mr-2" />
                      Accepter
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Réservations confirmées */}
        {confirmedBookings.length > 0 && (
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="size-10 rounded-full bg-green-100 dark:bg-green-950 flex items-center justify-center">
                <Check className="size-5 text-green-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Confirmées</h2>
                <p className="text-sm text-muted-foreground">{confirmedBookings.length} passager{confirmedBookings.length > 1 ? 's' : ''}</p>
              </div>
            </div>
            <div className="space-y-3">
              {confirmedBookings.map((booking: any) => (
                <div key={booking.id} className="bg-card rounded-2xl shadow-sm border p-5 bg-green-50/50 dark:bg-green-950/30">
                  <div className="flex items-center gap-4">
                    <Avatar className="size-12 ring-2 ring-green-500/20">
                      <AvatarImage src={booking.passenger?.avatar} />
                      <AvatarFallback className="bg-green-100 text-green-600 font-medium">
                        {booking.passenger?.first_name[0]}{booking.passenger?.last_name[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-semibold">
                        {booking.passenger?.first_name} {booking.passenger?.last_name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {booking.passenger?.university}
                      </p>
                      <div className="flex items-center gap-1 mt-1 text-sm text-green-600">
                        <Users className="size-3.5" />
                        {booking.seats} place{booking.seats > 1 ? 's' : ''}
                      </div>
                    </div>
                    <Button variant="outline" size="sm" asChild className="h-10">
                      <Link href={`/messages/${booking.passenger_id}`}>
                        <MessageSquare className="size-4 mr-2" />
                        Message
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Demandes refusées */}
        {rejectedBookings.length > 0 && (
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="size-10 rounded-full bg-red-100 dark:bg-red-950 flex items-center justify-center">
                <X className="size-5 text-red-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Refusées</h2>
                <p className="text-sm text-muted-foreground">{rejectedBookings.length} demande{rejectedBookings.length > 1 ? 's' : ''}</p>
              </div>
            </div>
            <div className="space-y-3">
              {rejectedBookings.map((booking: any) => (
                <div key={booking.id} className="bg-card rounded-2xl shadow-sm border p-5 opacity-60">
                  <div className="flex items-center gap-4">
                    <Avatar className="size-10">
                      <AvatarImage src={booking.passenger?.avatar} />
                      <AvatarFallback className="text-sm">
                        {booking.passenger?.first_name[0]}{booking.passenger?.last_name[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">
                        {booking.passenger?.first_name} {booking.passenger?.last_name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Refusé le {new Date(booking.updated_at).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* État vide */}
        {bookings.length === 0 && (
          <div className="bg-card rounded-2xl shadow-sm border p-12 text-center">
            <div className="size-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <Users className="size-8 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Aucune réservation</h2>
            <p className="text-muted-foreground">
              Personne n'a encore réservé ce trajet. Patience !
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
