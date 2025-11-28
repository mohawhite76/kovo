"use client"

import { useEffect, useState } from "react"
import { MapContainer, TileLayer, Marker, Polyline, Popup } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
})

interface RouteMapProps {
  departure: {
    name: string
    lat: number
    lng: number
  }
  destination: {
    name: string
    lat: number
    lng: number
  }
  onRouteCalculated?: (data: { distance: number; duration: number }) => void
}

export function RouteMap({ departure, destination, onRouteCalculated }: RouteMapProps) {
  const [route, setRoute] = useState<[number, number][]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRoute = async () => {
      try {

        const response = await fetch(
          `https://router.project-osrm.org/route/v1/driving/${departure.lng},${departure.lat};${destination.lng},${destination.lat}?overview=full&geometries=geojson`
        )
        const data = await response.json()

        if (data.routes && data.routes.length > 0) {
          const routeData = data.routes[0]
          const coordinates = routeData.geometry.coordinates.map((coord: [number, number]) => [
            coord[1],
            coord[0],
          ] as [number, number])

          setRoute(coordinates)

          const distance = Math.round(routeData.distance / 1000)
          const duration = Math.round(routeData.duration / 60)

          if (onRouteCalculated) {
            onRouteCalculated({ distance, duration })
          }
        }
      } catch (error) {
        console.error("Erreur lors du calcul du trajet:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchRoute()
  }, [departure, destination, onRouteCalculated])

  const center: [number, number] = [
    (departure.lat + destination.lat) / 2,
    (departure.lng + destination.lng) / 2,
  ]

  if (loading) {
    return (
      <div className="w-full h-[400px] bg-muted rounded-2xl flex items-center justify-center">
        <p className="text-muted-foreground">Chargement de la carte...</p>
      </div>
    )
  }

  return (
    <div className="w-full h-[400px] rounded-2xl overflow-hidden border relative z-0">
      <MapContainer
        center={center}
        zoom={7}
        scrollWheelZoom={false}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <Marker position={[departure.lat, departure.lng]}>
          <Popup>{departure.name}</Popup>
        </Marker>

        <Marker position={[destination.lat, destination.lng]}>
          <Popup>{destination.name}</Popup>
        </Marker>

        {route.length > 0 && (
          <Polyline
            positions={route}
            pathOptions={{ color: "blue", weight: 4, opacity: 0.7 }}
          />
        )}
      </MapContainer>
    </div>
  )
}
