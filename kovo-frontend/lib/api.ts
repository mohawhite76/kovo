import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('kovo_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('kovo_token')
      localStorage.removeItem('kovo_user')
      localStorage.removeItem('kovo-auth')
      if (typeof window !== 'undefined') {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export const authAPI = {
  register: (data: any) => api.post('/auth/register', data),
  login: (data: any) => api.post('/auth/login', data),
  verifyEmail: (data: any) => api.post('/auth/verify-email', data),
  resendCode: (email: string) => api.post('/auth/resend-code', { email }),
  requestPasswordReset: (email: string) => api.post('/auth/request-password-reset', { email }),
  resetPassword: (data: any) => api.post('/auth/reset-password', data),
  getProfile: () => api.get('/auth/me'),
}

export const userAPI = {
  updateProfile: (data: any) => api.put('/users/profile', data),
  changePassword: (data: any) => api.post('/users/change-password', data),
  getUserById: (id: string) => api.get(`/users/${id}`),
  deleteAccount: (password: string) => api.delete('/users/account', { data: { password } }),
  uploadAvatar: (file: File) => {
    const formData = new FormData()
    formData.append('avatar', file)
    return api.post('/users/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },
  deleteAvatar: () => api.delete('/users/avatar'),
  updateDriversLicense: (data: { number: string; photo?: File }) => {
    const formData = new FormData()
    formData.append('licenseNumber', data.number)
    if (data.photo) {
      formData.append('licensePhoto', data.photo)
    }
    return api.post('/users/drivers-license', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },
  updateVehicle: (data: { brand: string; model: string; color?: string; plate: string; photo?: File }) => {
    const formData = new FormData()
    formData.append('brand', data.brand)
    formData.append('model', data.model)
    formData.append('plate', data.plate)
    if (data.color) formData.append('color', data.color)
    if (data.photo) {
      formData.append('vehiclePhoto', data.photo)
    }
    return api.post('/users/vehicle', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },
  uploadStudentCard: (file: File) => {
    const formData = new FormData()
    formData.append('studentCard', file)
    return api.post('/users/student-card', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },
}

export const tripAPI = {
  getTrips: (params?: any) => api.get('/trips', { params }),
  getTripById: (id: string) => api.get(`/trips/${id}`),
  createTrip: (data: any) => api.post('/trips', data),
  updateTrip: (id: string, data: any) => api.put(`/trips/${id}`, data),
  deleteTrip: (id: string) => api.delete(`/trips/${id}`),
  getMyTrips: (params?: any) => api.get('/trips/my-trips', { params }),
}

export const bookingAPI = {
  createBooking: (data: any) => api.post('/bookings', data),
  getMyBookings: (params?: any) => api.get('/bookings/my-bookings', { params }),
  getBookingById: (id: string) => api.get(`/bookings/${id}`),
  getTripBookings: (tripId: string) => api.get(`/bookings/trip/${tripId}`),
  updateBookingStatus: (id: string, status: string) =>
    api.patch(`/bookings/${id}/status`, { status }),
}

export const messageAPI = {
  sendMessage: (data: any) => api.post('/messages', data),
  getConversations: () => api.get('/messages/conversations'),
  getConversationWith: (userId: string) => api.get(`/messages/conversation/${userId}`),
  markAsRead: (messageId: string) => api.patch(`/messages/${messageId}/read`),
  deleteMessage: (messageId: string) => api.delete(`/messages/${messageId}`),
}
