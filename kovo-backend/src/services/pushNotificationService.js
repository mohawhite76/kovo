import { client, APP_ID } from '../config/onesignal.js';
import logger from '../config/logger.js';

class PushNotificationService {
  async sendToUser(userId, title, message, data = {}) {
    try {
      const notification = {
        app_id: APP_ID,
        include_external_user_ids: [userId],
        headings: { en: title, fr: title },
        contents: { en: message, fr: message },
        data
      };

      const response = await client.createNotification(notification);

      logger.info('Notification push envoyée', {
        userId,
        title,
        notificationId: response.id
      });

      return response;
    } catch (error) {
      logger.error('Erreur lors de l\'envoi de la notification push', {
        userId,
        title,
        error: error.message
      });
      throw error;
    }
  }

  async sendToMultipleUsers(userIds, title, message, data = {}) {
    try {
      const notification = {
        app_id: APP_ID,
        include_external_user_ids: userIds,
        headings: { en: title, fr: title },
        contents: { en: message, fr: message },
        data
      };

      const response = await client.createNotification(notification);

      logger.info('Notification push envoyée à plusieurs utilisateurs', {
        userCount: userIds.length,
        title,
        notificationId: response.id
      });

      return response;
    } catch (error) {
      logger.error('Erreur lors de l\'envoi de la notification push groupée', {
        userCount: userIds.length,
        title,
        error: error.message
      });
      throw error;
    }
  }

  async sendNewBookingNotification(driverId, passenger, trip) {
    const title = '🚗 Nouvelle demande de réservation';
    const message = `${passenger.first_name} ${passenger.last_name} souhaite rejoindre votre trajet ${trip.departure} → ${trip.destination}`;

    return this.sendToUser(driverId, title, message, {
      type: 'new_booking',
      tripId: trip.id,
      passengerId: passenger.id
    });
  }

  async sendBookingAcceptedNotification(passengerId, driver, trip) {
    const title = '✅ Réservation confirmée !';
    const message = `${driver.first_name} a accepté votre demande pour le trajet ${trip.departure} → ${trip.destination}. Bon voyage !`;

    return this.sendToUser(passengerId, title, message, {
      type: 'booking_accepted',
      tripId: trip.id,
      driverId: driver.id
    });
  }

  async sendBookingRejectedNotification(passengerId, driver, trip) {
    const title = 'Réservation non acceptée';
    const message = `Votre demande pour le trajet ${trip.departure} → ${trip.destination} n'a pas été acceptée. D'autres trajets sont disponibles !`;

    return this.sendToUser(passengerId, title, message, {
      type: 'booking_rejected',
      tripId: trip.id,
      driverId: driver.id
    });
  }

  async sendNewMessageNotification(recipientId, sender, preview) {
    const title = `💬 Nouveau message de ${sender.first_name}`;
    const message = preview.length > 50 ? preview.substring(0, 50) + '...' : preview;

    return this.sendToUser(recipientId, title, message, {
      type: 'new_message',
      senderId: sender.id
    });
  }

  async sendTripReminderNotification(userId, trip, hoursBeforeDeparture) {
    const title = `⏰ Rappel : votre trajet dans ${hoursBeforeDeparture}h`;
    const message = `N'oubliez pas ! Départ prévu : ${trip.departure} → ${trip.destination}`;

    return this.sendToUser(userId, title, message, {
      type: 'trip_reminder',
      tripId: trip.id,
      hoursBeforeDeparture
    });
  }

  async sendTripCancelledNotification(userIds, trip, cancelledBy) {
    const title = '🚫 Trajet annulé';
    const message = `Le trajet ${trip.departure} → ${trip.destination} a été annulé. Retrouvez d'autres trajets sur Kovo !`;

    return this.sendToMultipleUsers(userIds, title, message, {
      type: 'trip_cancelled',
      tripId: trip.id,
      cancelledBy
    });
  }
}

export default new PushNotificationService();
