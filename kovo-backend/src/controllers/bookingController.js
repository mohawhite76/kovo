import { supabaseAdmin } from '../config/supabase.js';
import { AppError } from '../middlewares/errorHandler.js';
import logger from '../config/logger.js';
import notificationService from '../services/notificationService.js';

export const createBooking = async (req, res, next) => {
  try {
    const { tripId, seats = 1 } = req.body;

    logger.info('Booking creation attempt', { userId: req.user.id, tripId, seats });

    const { data: user } = await supabaseAdmin
      .from('users')
      .select('student_card_photo, student_verification_status')
      .eq('id', req.user.id)
      .single();

    if (!user.student_card_photo) {
      throw new AppError('Vous devez ajouter votre carte étudiante, attestation ou certificat de scolarité avant de réserver un trajet', 400);
    }

    if (user.student_verification_status !== 'approved') {
      throw new AppError('Votre document étudiant est en cours de vérification. Vous pourrez réserver une fois votre statut approuvé.', 400);
    }

    const { data: trip, error: tripError } = await supabaseAdmin
      .from('trips')
      .select(`
        *,
        driver:users!trips_driver_id_fkey(id, first_name, last_name, email),
        bookings(id, status, seats)
      `)
      .eq('id', tripId)
      .single();

    if (tripError || !trip) {
      throw new AppError('Trajet non trouvé', 404);
    }

    if (trip.driver_id === req.user.id) {
      throw new AppError('Vous ne pouvez pas réserver votre propre trajet', 400);
    }

    if (trip.status !== 'active') {
      throw new AppError('Ce trajet n\'est plus disponible', 400);
    }

    if (new Date(trip.date_time) <= new Date()) {
      throw new AppError('Ce trajet est déjà passé', 400);
    }

    const existingBooking = await supabaseAdmin
      .from('bookings')
      .select('id')
      .eq('trip_id', tripId)
      .eq('passenger_id', req.user.id)
      .in('status', ['pending', 'confirmed'])
      .single();

    if (existingBooking.data) {
      throw new AppError('Vous avez déjà réservé ce trajet', 400);
    }

    const confirmedBookings = trip.bookings?.filter(b => b.status === 'confirmed') || [];
    const bookedSeats = confirmedBookings.reduce((acc, b) => acc + b.seats, 0);

    if (bookedSeats + seats > trip.seats_available) {
      throw new AppError('Pas assez de places disponibles', 400);
    }

    const bookingStatus = trip.instant_booking ? 'confirmed' : 'pending';

    const { data: booking, error } = await supabaseAdmin
      .from('bookings')
      .insert([
        {
          trip_id: tripId,
          passenger_id: req.user.id,
          seats,
          status: bookingStatus
        }
      ])
      .select(`
        *,
        trip:trips(*),
        passenger:users!bookings_passenger_id_fkey(id, first_name, last_name, avatar)
      `)
      .single();

    if (error) {
      throw new AppError('Erreur lors de la création de la réservation', 500);
    }

    if (trip.instant_booking) {
      await notificationService.notifyBookingAccepted(req.user, trip.driver, trip, booking);
    } else {
      await notificationService.notifyNewBooking(trip.driver, req.user, trip);
    }

    logger.info('Booking created successfully', { bookingId: booking.id, tripId, userId: req.user.id, status: bookingStatus });

    res.status(201).json({ booking });
  } catch (error) {
    next(error);
  }
};

export const updateBookingStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['confirmed', 'rejected', 'cancelled'].includes(status)) {
      throw new AppError('Statut invalide', 400);
    }

    const { data: booking, error: bookingError } = await supabaseAdmin
      .from('bookings')
      .select(`
        *,
        trip:trips(
          *,
          driver:users!trips_driver_id_fkey(*)
        ),
        passenger:users!bookings_passenger_id_fkey(*)
      `)
      .eq('id', id)
      .single();

    if (bookingError || !booking) {
      throw new AppError('Réservation non trouvée', 404);
    }

    if (status === 'cancelled' && booking.passenger_id !== req.user.id) {
      throw new AppError('Non autorisé', 403);
    }

    if ((status === 'confirmed' || status === 'rejected') && booking.trip.driver_id !== req.user.id) {
      throw new AppError('Non autorisé', 403);
    }

    const { data: updatedBooking, error } = await supabaseAdmin
      .from('bookings')
      .update({ status })
      .eq('id', id)
      .select(`
        *,
        trip:trips(*),
        passenger:users!bookings_passenger_id_fkey(*)
      `)
      .single();

    if (error) {
      throw new AppError('Erreur lors de la mise à jour de la réservation', 500);
    }

    if (status === 'confirmed') {
      await notificationService.notifyBookingAccepted(booking.passenger, booking.trip.driver, booking.trip, updatedBooking);
    } else if (status === 'rejected') {
      await notificationService.notifyBookingRejected(booking.passenger, booking.trip.driver, booking.trip);
    }

    res.json({ booking: updatedBooking });
  } catch (error) {
    next(error);
  }
};

export const getBookingById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data: booking, error } = await supabaseAdmin
      .from('bookings')
      .select(`
        *,
        trip:trips(
          *,
          driver:users!trips_driver_id_fkey(id, first_name, last_name, avatar, university)
        ),
        passenger:users!bookings_passenger_id_fkey(id, first_name, last_name, avatar, university)
      `)
      .eq('id', id)
      .single();

    if (error || !booking) {
      throw new AppError('Réservation non trouvée', 404);
    }

    if (booking.passenger_id !== req.user.id && booking.trip.driver_id !== req.user.id) {
      throw new AppError('Non autorisé', 403);
    }

    res.json({ booking });
  } catch (error) {
    next(error);
  }
};

export const getMyBookings = async (req, res, next) => {
  try {
    const { status } = req.query;

    let query = supabaseAdmin
      .from('bookings')
      .select(`
        *,
        trip:trips(
          *,
          driver:users!trips_driver_id_fkey(id, first_name, last_name, avatar)
        )
      `)
      .eq('passenger_id', req.user.id);

    if (status) {
      query = query.eq('status', status);
    }

    const { data: bookings, error } = await query
      .order('created_at', { ascending: false });

    if (error) {
      throw new AppError('Erreur lors de la récupération des réservations', 500);
    }

    res.json({ bookings });
  } catch (error) {
    next(error);
  }
};

export const getTripBookings = async (req, res, next) => {
  try {
    const { tripId } = req.params;

    const { data: trip } = await supabaseAdmin
      .from('trips')
      .select('driver_id')
      .eq('id', tripId)
      .single();

    if (!trip) {
      throw new AppError('Trajet non trouvé', 404);
    }

    if (trip.driver_id !== req.user.id) {
      throw new AppError('Non autorisé', 403);
    }

    const { data: bookings, error } = await supabaseAdmin
      .from('bookings')
      .select(`
        *,
        passenger:users!bookings_passenger_id_fkey(id, first_name, last_name, avatar, university)
      `)
      .eq('trip_id', tripId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new AppError('Erreur lors de la récupération des réservations', 500);
    }

    res.json({ bookings });
  } catch (error) {
    next(error);
  }
};
