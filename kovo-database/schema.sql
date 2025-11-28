-- Extension pour générer des UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table des utilisateurs (étudiants)
-- Stocke toutes les informations des utilisateurs de la plateforme Kovo
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Informations de connexion
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,

  -- Informations personnelles
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  university VARCHAR(200) NOT NULL,
  student_id VARCHAR(100),
  phone VARCHAR(20),
  bio TEXT,
  avatar TEXT,

  -- Vérification email
  verified BOOLEAN DEFAULT FALSE,
  verification_code VARCHAR(6),
  verification_code_expires TIMESTAMPTZ,

  -- Réinitialisation mot de passe
  reset_password_token VARCHAR(255),
  reset_password_expires TIMESTAMPTZ,

  -- Permis de conduire (validé automatiquement après 15 secondes)
  drivers_license_number VARCHAR(50),
  drivers_license_photo TEXT,
  drivers_license_verified BOOLEAN DEFAULT FALSE,

  -- Véhicule
  vehicle_brand VARCHAR(100),
  vehicle_model VARCHAR(100),
  vehicle_color VARCHAR(50),
  vehicle_plate VARCHAR(20),
  vehicle_photo TEXT,

  -- Vérification étudiant (validée automatiquement après 15 secondes)
  student_card_photo TEXT,
  student_verification_status VARCHAR(20) DEFAULT 'pending',

  -- Horodatage
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table des trajets
-- Stocke tous les trajets proposés par les conducteurs sur Kovo
CREATE TABLE trips (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  driver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Informations de départ et destination
  departure VARCHAR(200) NOT NULL,
  destination VARCHAR(200) NOT NULL,
  departure_lat DECIMAL(10, 8) NOT NULL,
  departure_lng DECIMAL(11, 8) NOT NULL,
  destination_lat DECIMAL(10, 8) NOT NULL,
  destination_lng DECIMAL(11, 8) NOT NULL,

  -- Informations du trajet
  date_time TIMESTAMPTZ NOT NULL,
  seats_available INTEGER NOT NULL CHECK (seats_available >= 0),
  total_seats INTEGER NOT NULL CHECK (total_seats > 0),
  price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
  description TEXT,
  meeting_point VARCHAR(200),
  distance DECIMAL(10, 2),
  duration INTEGER,

  -- Options et statut
  instant_booking BOOLEAN DEFAULT FALSE,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),

  -- Horodatage
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table des réservations
-- Gère les demandes de réservation des passagers pour les trajets
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  passenger_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  seats INTEGER NOT NULL DEFAULT 1 CHECK (seats > 0),

  -- Statut : pending (en attente), confirmed (acceptée), rejected (refusée), cancelled (annulée)
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'rejected', 'cancelled')),

  -- Horodatage
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Un passager ne peut réserver qu'une seule fois le même trajet
  UNIQUE(trip_id, passenger_id)
);

-- Table des messages
-- Stocke la messagerie entre utilisateurs (conducteurs et passagers)
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,

  -- Le trajet associé au message (optionnel)
  trip_id UUID REFERENCES trips(id) ON DELETE SET NULL,

  -- Statut de lecture
  read BOOLEAN DEFAULT FALSE,

  -- Horodatage
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour optimiser les performances des requêtes

-- Index pour les trajets
CREATE INDEX idx_trips_driver ON trips(driver_id);
CREATE INDEX idx_trips_date ON trips(date_time);
CREATE INDEX idx_trips_status ON trips(status);
CREATE INDEX idx_trips_departure ON trips(departure);
CREATE INDEX idx_trips_destination ON trips(destination);

-- Index pour les réservations
CREATE INDEX idx_bookings_trip ON bookings(trip_id);
CREATE INDEX idx_bookings_passenger ON bookings(passenger_id);
CREATE INDEX idx_bookings_status ON bookings(status);

-- Index pour les messages
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_recipient ON messages(recipient_id);
CREATE INDEX idx_messages_created ON messages(created_at DESC);
CREATE INDEX idx_messages_read ON messages(read);

-- Fonction pour mettre à jour automatiquement la colonne updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers pour mettre à jour automatiquement updated_at lors d'une modification
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_trips_updated_at BEFORE UPDATE ON trips
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_messages_updated_at BEFORE UPDATE ON messages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Fonction pour gérer automatiquement les places disponibles dans les trajets
-- Diminue les places disponibles quand une réservation est confirmée
-- Augmente les places disponibles quand une réservation confirmée est annulée/supprimée
CREATE OR REPLACE FUNCTION update_trip_seats()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT' AND NEW.status = 'confirmed') OR
     (TG_OP = 'UPDATE' AND OLD.status != 'confirmed' AND NEW.status = 'confirmed') THEN
    UPDATE trips
    SET seats_available = seats_available - NEW.seats
    WHERE id = NEW.trip_id;
  ELSIF (TG_OP = 'DELETE' AND OLD.status = 'confirmed') OR
        (TG_OP = 'UPDATE' AND OLD.status = 'confirmed' AND NEW.status != 'confirmed') THEN
    UPDATE trips
    SET seats_available = seats_available + COALESCE(OLD.seats, NEW.seats)
    WHERE id = COALESCE(OLD.trip_id, NEW.trip_id);
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger pour mettre à jour les places disponibles automatiquement
CREATE TRIGGER update_trip_seats_on_booking
  AFTER INSERT OR UPDATE OR DELETE ON bookings
  FOR EACH ROW EXECUTE FUNCTION update_trip_seats();
