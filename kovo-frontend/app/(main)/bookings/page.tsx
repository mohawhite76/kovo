"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Users, Check, X, Hourglass, Ticket, ChevronRight, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { bookingAPI } from "@/lib/api"
import { formatDate, formatCurrency } from "@/lib/utils"

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchBookings()
  }, [])

  const fetchBookings = async () => {
    try {
      const { data } = await bookingAPI.getMyBookings()
      setBookings(data.bookings || [])
    } catch (error) {
      console.error('Error fetching my bookings:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded-2xl w-1/3" />
          <div className="h-48 bg-muted rounded-2xl" />
          <div className="h-48 bg-muted rounded-2xl" />
        </div>
      </div>
    )
  }

  const pendingBookings = bookings.filter((b: any) => b.status === 'pending')
  const confirmedBookings = bookings.filter((b: any) => b.status === 'confirmed')
  const cancelledBookings = bookings.filter((b: any) => b.status === 'cancelled' || b.status === 'rejected')

  const BookingCard = ({ booking, status }: { booking: any, status: 'confirmed' | 'pending' | 'cancelled' }) => {
    const statusConfig = {
      confirmed: {
        icon: <Check className="size-3.5" />,
        text: 'Confirmée',
        color: 'text-green-600 bg-green-100 dark:bg-green-950'
      },
      pending: {
        icon: <Hourglass className="size-3.5" />,
        text: 'En attente',
        color: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-950'
      },
      cancelled: {
        icon: <X className="size-3.5" />,
        text: booking.status === 'rejected' ? 'Refusée' : 'Annulée',
        color: 'text-red-600 bg-red-100 dark:bg-red-950'
      }
    }

    const config = statusConfig[status]

    return (
      <Link href={`/trips/${booking.trip_id}`} className="group block">
        <div className={`bg-card rounded-2xl shadow-sm border p-5 hover:shadow-lg hover:border-primary/50 transition-all ${status === 'cancelled' ? 'opacity-60' : ''}`}>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="flex flex-col items-center pt-1">
                <div className="size-3 rounded-full bg-primary" />
                <div className="w-0.5 h-8 bg-gradient-to-b from-primary to-primary/30 my-1" />
                <div className="size-3 rounded-full border-2 border-primary bg-background" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-lg">{booking.trip?.departure}</p>
                <p className="text-sm text-muted-foreground mt-6">{booking.trip?.destination}</p>
              </div>
              <ChevronRight className="size-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
            </div>

            <div className="h-px bg-border" />

            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium">{formatDate(booking.trip?.date_time)}</p>
                <div className="flex items-center gap-2">
                  <Avatar className="size-7 ring-1 ring-primary/10">
                    <AvatarImage src={booking.trip?.driver?.avatar} />
                    <AvatarFallback className="text-xs bg-primary/10 text-primary">
                      {booking.trip?.driver?.first_name[0]}{booking.trip?.driver?.last_name[0]}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm text-muted-foreground">
                    {booking.trip?.driver?.first_name}
                  </span>
                </div>
              </div>

              <div className="text-right space-y-2">
                <div className="text-2xl font-bold text-primary">
                  {formatCurrency(booking.trip?.price * booking.seats)}
                </div>
                <div className="flex items-center gap-1 justify-end text-muted-foreground">
                  <Users className="size-4" />
                  <span className="text-sm">{booking.seats} place{booking.seats > 1 ? 's' : ''}</span>
                </div>
              </div>
            </div>

            <div className={`flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full ${config.color} w-fit font-medium`}>
              {config.icon}
              {config.text}
            </div>
          </div>
        </div>
      </Link>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-2xl">
      <div className="space-y-4 mb-6">
        <h1 className="text-4xl md:text-5xl font-bold">Vos réservations</h1>
        <p className="text-lg text-muted-foreground">Suivez vos trajets réservés</p>
      </div>

      {bookings.length === 0 ? (
        <div className="bg-card rounded-2xl shadow-sm border p-12 text-center">
          <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Ticket className="size-8 text-primary" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Aucune réservation</h2>
          <p className="text-muted-foreground mb-6">
            Vous n'avez pas encore réservé de trajet. Trouvez votre prochain covoiturage !
          </p>
          <Button asChild className="h-12 px-6">
            <Link href="/">Rechercher un trajet</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-8">
          {confirmedBookings.length > 0 && (
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="size-10 rounded-full bg-green-100 dark:bg-green-950 flex items-center justify-center">
                  <Check className="size-5 text-green-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold">Confirmées</h2>
                  <p className="text-sm text-muted-foreground">{confirmedBookings.length} trajet{confirmedBookings.length > 1 ? 's' : ''}</p>
                </div>
              </div>
              <div className="space-y-4">
                {confirmedBookings.map((booking: any) => (
                  <BookingCard key={booking.id} booking={booking} status="confirmed" />
                ))}
              </div>
            </div>
          )}

          {pendingBookings.length > 0 && (
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="size-10 rounded-full bg-yellow-100 dark:bg-yellow-950 flex items-center justify-center">
                  <Hourglass className="size-5 text-yellow-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold">En attente</h2>
                  <p className="text-sm text-muted-foreground">{pendingBookings.length} demande{pendingBookings.length > 1 ? 's' : ''} en cours</p>
                </div>
              </div>
              <div className="space-y-4">
                {pendingBookings.map((booking: any) => (
                  <BookingCard key={booking.id} booking={booking} status="pending" />
                ))}
              </div>
            </div>
          )}

          {cancelledBookings.length > 0 && (
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="size-10 rounded-full bg-red-100 dark:bg-red-950 flex items-center justify-center">
                  <X className="size-5 text-red-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold">Refusées ou annulées</h2>
                  <p className="text-sm text-muted-foreground">{cancelledBookings.length} trajet{cancelledBookings.length > 1 ? 's' : ''}</p>
                </div>
              </div>
              <div className="space-y-4">
                {cancelledBookings.map((booking: any) => (
                  <BookingCard key={booking.id} booking={booking} status="cancelled" />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
