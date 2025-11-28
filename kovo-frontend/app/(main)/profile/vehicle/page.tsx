"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Car, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PlateInput } from "@/components/shared/plate-input"
import { useAuthStore } from "@/lib/store"
import { userAPI } from "@/lib/api"

const CAR_BRANDS = [

  "Renault", "Peugeot", "Citroën", "DS Automobiles", "Alpine", "Bugatti", "Dacia",

  "Volkswagen", "Audi", "BMW", "Mercedes-Benz", "Opel", "Porsche", "Mini",

  "Fiat", "Alfa Romeo", "Lancia", "Ferrari", "Lamborghini", "Maserati",

  "Toyota", "Honda", "Nissan", "Mazda", "Suzuki", "Mitsubishi", "Subaru", "Lexus",

  "Hyundai", "Kia", "SsangYong",

  "Ford", "Chevrolet", "Jeep", "Tesla", "Cadillac",

  "Land Rover", "Jaguar", "Aston Martin", "Bentley", "Rolls-Royce",

  "Seat", "Cupra",

  "Skoda",

  "Volvo", "Saab",

  "Autre"
].sort()

const CAR_COLORS = [
  "Blanc",
  "Noir",
  "Gris",
  "Argent",
  "Rouge",
  "Bleu",
  "Bleu foncé",
  "Vert",
  "Beige",
  "Marron",
  "Orange",
  "Jaune",
  "Violet",
  "Rose",
  "Autre"
]

export default function VehiclePage() {
  const router = useRouter()
  const user = useAuthStore((state) => state.user)
  const setUser = useAuthStore((state) => state.setUser)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const vehiclePhotoRef = useRef<HTMLInputElement>(null)

  const [vehicleData, setVehicleData] = useState({
    brand: user?.vehicle_brand || "",
    model: user?.vehicle_model || "",
    color: user?.vehicle_color || "",
    plate: user?.vehicle_plate || "",
    uploading: false
  })

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }
    setVehicleData({
      brand: user.vehicle_brand || "",
      model: user.vehicle_model || "",
      color: user.vehicle_color || "",
      plate: user.vehicle_plate || "",
      uploading: false
    })
  }, [user, router])

  const handleVehicleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!vehicleData.brand || !vehicleData.model || !vehicleData.plate) {
      setError("Veuillez remplir tous les champs obligatoires du véhicule")
      return
    }

    setVehicleData(prev => ({ ...prev, uploading: true }))
    setError("")
    setSuccess("")

    try {
      const photo = vehiclePhotoRef.current?.files?.[0]
      const { data } = await userAPI.updateVehicle({
        brand: vehicleData.brand,
        model: vehicleData.model,
        color: vehicleData.color,
        plate: vehicleData.plate,
        photo
      })
      setUser(data.user)
      setSuccess("Informations du véhicule mises à jour avec succès")
      if (vehiclePhotoRef.current) vehiclePhotoRef.current.value = ''
    } catch (err: any) {
      setError(err.response?.data?.error || "Erreur lors de la mise à jour du véhicule")
    } finally {
      setVehicleData(prev => ({ ...prev, uploading: false }))
    }
  }

  if (!user) {
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
    <div className="container mx-auto px-4 py-6 max-w-2xl">
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/profile">
            <ArrowLeft className="size-4 mr-2" />
            Retour
          </Link>
        </Button>
      </div>

      <div className="space-y-4 mb-6">
        <div className="flex items-center gap-3">
          <Car className="size-8 text-primary" />
          <h1 className="text-4xl md:text-5xl font-bold">Votre véhicule</h1>
        </div>
        <p className="text-lg text-muted-foreground">
          Enregistrez votre voiture pour proposer des covoiturages
        </p>
      </div>

      {success && (
        <div className="text-sm text-green-600 bg-green-50 p-3 rounded-md mb-4">
          {success}
        </div>
      )}

      <form onSubmit={handleVehicleSubmit} className="space-y-6">
        <div className="bg-card rounded-2xl shadow-sm border p-6 space-y-5">
          <h3 className="text-lg font-semibold">Informations du véhicule</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Marque *</label>
              <Select
                value={vehicleData.brand}
                onValueChange={(value) => setVehicleData(prev => ({ ...prev, brand: value }))}
                required
              >
                <SelectTrigger className="h-14">
                  <SelectValue placeholder="Choisissez la marque" />
                </SelectTrigger>
                <SelectContent>
                  {CAR_BRANDS.map((brand) => (
                    <SelectItem key={brand} value={brand}>
                      {brand}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Modèle *</label>
              <Input
                placeholder="Ex: 208, Clio, Golf..."
                value={vehicleData.model}
                onChange={(e) => setVehicleData(prev => ({ ...prev, model: e.target.value }))}
                className="h-14 text-base"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Couleur</label>
              <Select
                value={vehicleData.color}
                onValueChange={(value) => setVehicleData(prev => ({ ...prev, color: value }))}
              >
                <SelectTrigger className="h-14">
                  <SelectValue placeholder="Couleur (optionnel)" />
                </SelectTrigger>
                <SelectContent>
                  {CAR_COLORS.map((color) => (
                    <SelectItem key={color} value={color}>
                      {color}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Plaque d'immatriculation *</label>
              <PlateInput
                value={vehicleData.plate}
                onChange={(value) => setVehicleData(prev => ({ ...prev, plate: value }))}
                className="h-14"
              />
            </div>
          </div>
          <div className="border-t pt-5">
            <label className="text-sm font-medium block mb-2">
              Photo du véhicule (Optionnel)
            </label>
            <p className="text-xs text-muted-foreground mb-3">
              Aidez vos passagers à identifier votre voiture (JPG, PNG - max 5 Mo)
            </p>
            <input
              ref={vehiclePhotoRef}
              type="file"
              accept="image/*"
              className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 file:cursor-pointer"
            />
          </div>
          {user.vehicle_photo && (
            <p className="text-sm text-green-600 flex items-center gap-1">
              <CheckCircle className="size-4" />
              Photo du véhicule ajoutée
            </p>
          )}
        </div>

        {error && (
          <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
            {error}
          </div>
        )}

        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            className="flex-1 h-14 text-base"
          >
            Annuler
          </Button>
          <Button
            type="submit"
            disabled={vehicleData.uploading}
            className="flex-1 h-14 text-base font-medium"
          >
            {vehicleData.uploading ? "Enregistrement..." : "Enregistrer"}
          </Button>
        </div>
      </form>
    </div>
  )
}
