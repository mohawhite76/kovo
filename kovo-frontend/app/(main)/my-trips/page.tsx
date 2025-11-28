"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DeleteDialog } from "@/components/shared/delete-dialog"
import { tripAPI } from "@/lib/api"
import { TripCard } from "@/components/trip/trip-card"

export default function MyTripsPage() {
  const router = useRouter()
  const [trips, setTrips] = useState([])
  const [loading, setLoading] = useState(true)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [tripToDelete, setTripToDelete] = useState<string | null>(null)

  useEffect(() => {
    fetchTrips()
  }, [])

  const fetchTrips = async () => {
    try {
      const { data } = await tripAPI.getMyTrips()
      setTrips(data.data || [])
    } catch (error) {
      console.error('Error fetching my trips:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (tripId: string) => {
    router.push(`/trips/${tripId}/edit`)
  }

  const handleDeleteClick = (tripId: string) => {
    setTripToDelete(tripId)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!tripToDelete) return

    try {
      await tripAPI.deleteTrip(tripToDelete)
      setTrips(trips.filter((t: any) => t.id !== tripToDelete))
      setDeleteDialogOpen(false)
      setTripToDelete(null)
    } catch (error: any) {
      alert(error.response?.data?.error || 'Erreur lors de la suppression du trajet')
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

  return (
    <div className="container mx-auto px-4 py-6 max-w-2xl">
      <div className="space-y-4 mb-6">
        <div className="flex items-center justify-between">
          <h1 className="text-4xl md:text-5xl font-bold">Vos trajets</h1>
          <Button asChild className="h-12 font-medium">
            <Link href="/trips/new">
              <Plus className="size-4 mr-2" />
              Nouveau trajet
            </Link>
          </Button>
        </div>
        <p className="text-lg text-muted-foreground">Gérez et suivez les trajets que vous proposez</p>
      </div>

      {trips.length === 0 ? (
        <div className="bg-card rounded-2xl shadow-sm border p-12 text-center space-y-4">
          <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
            <Plus className="size-8 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-2">Aucun trajet publié</h2>
            <p className="text-muted-foreground mb-6">
              Publiez votre premier trajet et commencez à covoiturer !
            </p>
          </div>
          <Button asChild className="h-14 text-base font-medium">
            <Link href="/trips/new">
              <Plus className="size-4 mr-2" />
              Publier mon premier trajet
            </Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {trips.map((trip: any) => (
            <TripCard
              key={trip.id}
              trip={trip}
              showActions={true}
              onEdit={handleEdit}
              onDelete={handleDeleteClick}
            />
          ))}
        </div>
      )}

      <DeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        title="Supprimer ce trajet ?"
        description="Cette action est irréversible. Le trajet et toutes les réservations associées seront définitivement supprimés."
      />
    </div>
  )
}
