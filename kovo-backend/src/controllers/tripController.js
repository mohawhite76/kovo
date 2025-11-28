import { supabaseAdmin } from '../config/supabase.js';
import { AppError } from '../middlewares/errorHandler.js';
import { paginate, buildPaginatedResponse } from '../utils/helpers.js';
import logger from '../config/logger.js';

export const createTrip = async (req, res, next) => {
  try {
    logger.info('Trip creation attempt', { userId: req.user.id, departure: req.body.departure, destination: req.body.destination });

    const { data: user } = await supabaseAdmin
      .from('users')
      .select('drivers_license_number, vehicle_brand, vehicle_model, vehicle_plate')
      .eq('id', req.user.id)
      .single();

    if (!user.drivers_license_number) {
      logger.warn('Trip creation failed - missing drivers license', { userId: req.user.id });
      throw new AppError('Vous devez ajouter votre permis de conduire avant de publier un trajet', 400);
    }

    if (!user.vehicle_brand || !user.vehicle_model || !user.vehicle_plate) {
      logger.warn('Trip creation failed - missing vehicle info', { userId: req.user.id });
      throw new AppError('Vous devez ajouter les informations de votre véhicule avant de publier un trajet', 400);
    }

    const {
      departure,
      destination,
      date_time,
      seats_available,
      price,
      description,
      meeting_point,
      luggage_size,
      pets_allowed,
      smoking_allowed,
      music_allowed,
      conversation_level,
      detours_allowed,
      planned_stops,
      instant_booking,
      departure_lat,
      departure_lng,
      destination_lat,
      destination_lng,
      distance,
      duration
    } = req.body;

    const tripData = {
      driver_id: req.user.id,
      departure,
      destination,
      date_time,
      seats_available,
      total_seats: seats_available,
      price,
      description,
      meeting_point,
      status: 'active'
    };

    if (luggage_size !== undefined) tripData.luggage_size = luggage_size;
    if (pets_allowed !== undefined) tripData.pets_allowed = pets_allowed;
    if (smoking_allowed !== undefined) tripData.smoking_allowed = smoking_allowed;
    if (music_allowed !== undefined) tripData.music_allowed = music_allowed;
    if (conversation_level !== undefined) tripData.conversation_level = conversation_level;
    if (detours_allowed !== undefined) tripData.detours_allowed = detours_allowed;
    if (planned_stops !== undefined) tripData.planned_stops = planned_stops;
    if (instant_booking !== undefined) tripData.instant_booking = instant_booking;

    if (departure_lat !== undefined) tripData.departure_lat = departure_lat;
    if (departure_lng !== undefined) tripData.departure_lng = departure_lng;
    if (destination_lat !== undefined) tripData.destination_lat = destination_lat;
    if (destination_lng !== undefined) tripData.destination_lng = destination_lng;
    if (distance !== undefined) tripData.distance = distance;
    if (duration !== undefined) tripData.duration = duration;

    const { data: trip, error } = await supabaseAdmin
      .from('trips')
      .insert([tripData])
      .select(`
        *,
        driver:users!trips_driver_id_fkey(id, first_name, last_name, avatar)
      `)
      .single();

    if (error) {
      logger.error('Trip creation failed', { userId: req.user.id, error: error.message });
      throw new AppError(error.message || 'Erreur lors de la création du trajet', 500);
    }

    logger.info('Trip created successfully', { tripId: trip.id, userId: req.user.id, departure: trip.departure, destination: trip.destination });

    res.status(201).json({ trip });
  } catch (error) {
    next(error);
  }
};

export const getTrips = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      departure,
      destination,
      dateFrom,
      dateTo,
      maxPrice,
      minSeats,
      driverId
    } = req.query;

    const { offset, limit: pageLimit } = paginate(page, limit);

    let query = supabaseAdmin
      .from('trips')
      .select(`
        *,
        driver:users!trips_driver_id_fkey(id, first_name, last_name, avatar, university, vehicle_brand, vehicle_model, vehicle_color, vehicle_plate, vehicle_photo),
        bookings(id, status)
      `, { count: 'exact' })
      .eq('status', 'active')
      .gte('date_time', new Date().toISOString());

    if (departure) {
      query = query.ilike('departure', `%${departure}%`);
    }

    if (destination) {
      query = query.ilike('destination', `%${destination}%`);
    }

    if (dateFrom) {
      query = query.gte('date_time', dateFrom);
    }

    if (dateTo) {
      query = query.lte('date_time', dateTo);
    }

    if (maxPrice) {
      query = query.lte('price', parseFloat(maxPrice));
    }

    if (minSeats) {
      query = query.gte('seats_available', parseInt(minSeats));
    }

    if (driverId) {
      query = query.eq('driver_id', driverId);
    }

    const { data: trips, error, count } = await query
      .order('date_time', { ascending: true })
      .range(offset, offset + pageLimit - 1);

    if (error) {
      throw new AppError('Erreur lors de la récupération des trajets', 500);
    }

    const tripsWithBookingCount = trips.map(trip => {
      const confirmedBookings = trip.bookings?.filter(b => b.status === 'confirmed').length || 0;
      const { bookings, ...tripData } = trip;
      return {
        ...tripData,
        bookedSeats: confirmedBookings
      };
    });

    res.json(buildPaginatedResponse(tripsWithBookingCount, count, page, pageLimit));
  } catch (error) {
    next(error);
  }
};

export const getTripById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data: trip, error } = await supabaseAdmin
      .from('trips')
      .select(`
        *,
        driver:users!trips_driver_id_fkey(id, first_name, last_name, avatar, university, bio, vehicle_brand, vehicle_model, vehicle_color, vehicle_plate, vehicle_photo),
        bookings(
          id,
          status,
          seats,
          passenger:users!bookings_passenger_id_fkey(id, first_name, last_name, avatar)
        )
      `)
      .eq('id', id)
      .single();

    if (error || !trip) {
      throw new AppError('Trajet non trouvé', 404);
    }

    const confirmedBookings = trip.bookings?.filter(b => b.status === 'confirmed') || [];
    const bookedSeats = confirmedBookings.reduce((acc, b) => acc + b.seats, 0);

    res.json({
      trip: {
        ...trip,
        bookedSeats,
        passengers: confirmedBookings.map(b => ({
          ...b.passenger,
          seats: b.seats,
          bookingId: b.id
        }))
      }
    });
  } catch (error) {
    next(error);
  }
};

export const updateTrip = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      departure,
      destination,
      date_time,
      seats_available,
      price,
      description,
      meeting_point,
      status,
      luggage_size,
      pets_allowed,
      smoking_allowed,
      music_allowed,
      conversation_level,
      detours_allowed,
      planned_stops,
      instant_booking,
      departure_lat,
      departure_lng,
      destination_lat,
      destination_lng,
      distance,
      duration
    } = req.body;

    const { data: existingTrip } = await supabaseAdmin
      .from('trips')
      .select('driver_id')
      .eq('id', id)
      .single();

    if (!existingTrip) {
      throw new AppError('Trajet non trouvé', 404);
    }

    if (existingTrip.driver_id !== req.user.id) {
      throw new AppError('Non autorisé', 403);
    }

    const updateData = {};

    if (departure !== undefined) updateData.departure = departure;
    if (destination !== undefined) updateData.destination = destination;
    if (date_time !== undefined) updateData.date_time = date_time;
    if (seats_available !== undefined) {
      updateData.seats_available = seats_available;
      updateData.total_seats = seats_available;
    }
    if (price !== undefined) updateData.price = price;
    if (description !== undefined) updateData.description = description;
    if (meeting_point !== undefined) updateData.meeting_point = meeting_point;
    if (status !== undefined) updateData.status = status;

    if (luggage_size !== undefined) updateData.luggage_size = luggage_size;
    if (pets_allowed !== undefined) updateData.pets_allowed = pets_allowed;
    if (smoking_allowed !== undefined) updateData.smoking_allowed = smoking_allowed;
    if (music_allowed !== undefined) updateData.music_allowed = music_allowed;
    if (conversation_level !== undefined) updateData.conversation_level = conversation_level;
    if (detours_allowed !== undefined) updateData.detours_allowed = detours_allowed;
    if (planned_stops !== undefined) updateData.planned_stops = planned_stops;
    if (instant_booking !== undefined) updateData.instant_booking = instant_booking;

    if (departure_lat !== undefined) updateData.departure_lat = departure_lat;
    if (departure_lng !== undefined) updateData.departure_lng = departure_lng;
    if (destination_lat !== undefined) updateData.destination_lat = destination_lat;
    if (destination_lng !== undefined) updateData.destination_lng = destination_lng;
    if (distance !== undefined) updateData.distance = distance;
    if (duration !== undefined) updateData.duration = duration;

    const { data: trip, error } = await supabaseAdmin
      .from('trips')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        driver:users!trips_driver_id_fkey(id, first_name, last_name, avatar)
      `)
      .single();

    if (error) {
      throw new AppError('Erreur lors de la mise à jour du trajet', 500);
    }

    res.json({ trip });
  } catch (error) {
    next(error);
  }
};

export const deleteTrip = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data: trip } = await supabaseAdmin
      .from('trips')
      .select('driver_id')
      .eq('id', id)
      .single();

    if (!trip) {
      throw new AppError('Trajet non trouvé', 404);
    }

    if (trip.driver_id !== req.user.id) {
      throw new AppError('Non autorisé', 403);
    }

    const { error } = await supabaseAdmin
      .from('trips')
      .delete()
      .eq('id', id);

    if (error) {
      throw new AppError('Erreur lors de la suppression du trajet', 500);
    }

    res.json({ message: 'Trajet supprimé avec succès' });
  } catch (error) {
    next(error);
  }
};

export const getMyTrips = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, type = 'driver' } = req.query;
    const { offset, limit: pageLimit } = paginate(page, limit);

    let query;

    if (type === 'driver') {
      query = supabaseAdmin
        .from('trips')
        .select(`
          *,
          driver:users!trips_driver_id_fkey(id, first_name, last_name, avatar),
          bookings(id, status, seats)
        `, { count: 'exact' })
        .eq('driver_id', req.user.id);
    } else {
      query = supabaseAdmin
        .from('bookings')
        .select(`
          id,
          status,
          seats,
          created_at,
          trip:trips(
            *,
            driver:users!trips_driver_id_fkey(id, first_name, last_name, avatar)
          )
        `, { count: 'exact' })
        .eq('passenger_id', req.user.id);
    }

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + pageLimit - 1);

    if (error) {
      throw new AppError('Erreur lors de la récupération des trajets', 500);
    }

    res.json(buildPaginatedResponse(data, count, page, pageLimit));
  } catch (error) {
    next(error);
  }
};
