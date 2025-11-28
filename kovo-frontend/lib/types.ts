export interface User {
  id: string
  email: string
  first_name: string
  last_name: string
  university: string
  student_id?: string
  phone?: string
  bio?: string
  avatar?: string
  verified: boolean
  drivers_license_number?: string
  drivers_license_photo?: string
  drivers_license_verified?: boolean
  vehicle_brand?: string
  vehicle_model?: string
  vehicle_color?: string
  vehicle_plate?: string
  vehicle_photo?: string
  student_card_photo?: string
  student_verification_status?: 'pending' | 'approved' | 'rejected'
  created_at: string
  updated_at: string
}

export interface Trip {
  id: string
  driver_id: string
  departure: string
  destination: string
  departure_lat: number
  departure_lng: number
  destination_lat: number
  destination_lng: number
  date_time: string
  seats_available: number
  total_seats: number
  price: number
  description?: string
  meeting_point?: string
  distance?: number
  duration?: number
  instant_booking: boolean
  status: 'active' | 'completed' | 'cancelled'
  created_at: string
  updated_at: string
  driver?: User
  bookedSeats?: number
  passengers?: Passenger[]
}

export interface Passenger extends User {
  seats: number
  bookingId: string
}

export interface Booking {
  id: string
  trip_id: string
  passenger_id: string
  seats: number
  status: 'pending' | 'confirmed' | 'rejected' | 'cancelled'
  created_at: string
  updated_at: string
  trip?: Trip
  passenger?: User
}

export interface Message {
  id: string
  sender_id: string
  recipient_id: string
  content: string
  trip_id?: string
  read: boolean
  created_at: string
  updated_at: string
  sender?: User
  recipient?: User
}

export interface Conversation {
  user: User
  lastMessage: Message
  unreadCount: number
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    total: number
    page: number
    limit: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export interface Location {
  lat: number
  lng: number
}

export interface GeocodeResult {
  displayName: string
  lat: number
  lng: number
  address: any
}

export interface RouteInfo {
  distance: number
  duration: number
  geometry?: any
}
