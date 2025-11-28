"use client"

import { Users, PawPrint, Cigarette, Music, CheckCircle, Edit, Trash2, Clock } from "lucide-react"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { formatDate, formatCurrency } from "@/lib/utils"

interface Trip {
  id: string
  departure: string
  destination: string
  date_time: string
  price: number
  seats_available: number
  bookedSeats?: number
  bookings?: any[]
  duration?: number
  pets_allowed?: boolean
  smoking_allowed?: boolean
  music_allowed?: boolean
  instant_booking?: boolean
  driver: {
    id: string
    first_name: string
    last_name: string
    avatar?: string
  }
}

interface TripCardProps {
  trip: Trip
  showActions?: boolean
  onEdit?: (tripId: string) => void
  onDelete?: (tripId: string) => void
}

export function TripCard({ trip, showActions = false, onEdit, onDelete }: TripCardProps) {
  const availableSeats = trip.seats_available - (trip.bookedSeats || 0)
  const pendingBookings = trip.bookings?.filter((b: any) => b.status === 'pending').length || 0

  const departureDate = new Date(trip.date_time)
  const departureTime = departureDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })

  let arrivalTime = ''
  let durationText = ''
  if (trip.duration) {
    const arrivalDate = new Date(departureDate.getTime() + trip.duration * 60000)
    arrivalTime = arrivalDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })

    const hours = Math.floor(trip.duration / 60)
    const minutes = trip.duration % 60
    if (hours > 0) {
      durationText = minutes > 0 ? `${hours}h${minutes.toString().padStart(2, '0')}` : `${hours}h`
    } else {
      durationText = `${minutes}min`
    }
  }

  return (
    <div className="bg-card rounded-2xl shadow-sm border p-6 hover:shadow-lg hover:border-primary/50 transition-all relative group">
      {pendingBookings > 0 && !showActions && (
        <div className="absolute top-4 right-4 bg-amber-500 text-white text-xs px-3 py-1.5 rounded-full font-medium shadow-sm">
          {pendingBookings} demande{pendingBookings > 1 ? 's' : ''} en attente
        </div>
      )}

      {showActions && (
        <div className="flex justify-end gap-2 mb-4">
          {pendingBookings > 0 && (
            <div className="bg-amber-500 text-white text-xs px-3 py-1.5 rounded-full font-medium shadow-sm mr-auto">
              {pendingBookings} demande{pendingBookings > 1 ? 's' : ''} en attente
            </div>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              onEdit?.(trip.id)
            }}
            className="h-8"
          >
            <Edit className="size-3 mr-1" />
            Modifier
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              onDelete?.(trip.id)
            }}
            className="h-8"
          >
            <Trash2 className="size-3 mr-1" />
            Supprimer
          </Button>
        </div>
      )}

      <Link href={`/trips/${trip.id}`} className="block">
        <div className="space-y-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-lg font-semibold text-primary">{departureTime}</span>
              <h3 className="text-xl font-medium">{trip.departure}</h3>
            </div>
            {trip.duration && (
              <div className="flex items-center gap-2 my-3 ml-2">
                <div className="h-8 w-px bg-border" />
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Clock className="size-3.5" />
                  <span>{durationText}</span>
                </div>
              </div>
            )}
            <div className="flex items-center gap-3">
              {arrivalTime && <span className="text-lg font-semibold text-primary">{arrivalTime}</span>}
              <h3 className="text-xl font-medium">{trip.destination}</h3>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">{formatDate(trip.date_time)}</p>
              <div className="flex items-center gap-2">
                <Avatar className="size-8">
                  <AvatarImage src={trip.driver.avatar} alt={trip.driver.first_name} />
                  <AvatarFallback className="text-xs">
                    {trip.driver.first_name[0]}{trip.driver.last_name[0]}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm text-muted-foreground">
                  {trip.driver.first_name} {trip.driver.last_name}
                </span>
              </div>
            </div>

            <div className="text-right space-y-2">
              <div className="text-2xl font-medium">
                {formatCurrency(trip.price)}
              </div>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Users className="size-4" />
                <span>{availableSeats} place{availableSeats > 1 ? 's' : ''}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-3 border-t">
            {trip.pets_allowed && (
              <div className="flex items-center gap-1 text-xs text-green-600" title="Animaux acceptés">
                <PawPrint className="size-3.5" />
              </div>
            )}
            {!trip.smoking_allowed && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground" title="Non-fumeur">
                <Cigarette className="size-3.5 line-through" />
              </div>
            )}
            {trip.music_allowed && (
              <div className="flex items-center gap-1 text-xs text-purple-600" title="Musique">
                <Music className="size-3.5" />
              </div>
            )}
            {trip.instant_booking && (
              <div className="flex items-center gap-1 text-xs text-green-600 font-medium bg-green-50 dark:bg-green-950 px-2 py-1 rounded-md" title="Réservation instantanée">
                <CheckCircle className="size-3.5" />
                <span>Réservation instantanée</span>
              </div>
            )}
          </div>
        </div>
      </Link>
    </div>
  )
}
