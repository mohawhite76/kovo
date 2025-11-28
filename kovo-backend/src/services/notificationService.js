import logger from '../config/logger.js';
import pushNotificationService from './pushNotificationService.js';
import emailService from './emailService.js';

class NotificationService {
  async notifyNewBooking(driver, passenger, trip) {
    try {
      await pushNotificationService.sendNewBookingNotification(driver.id, passenger, trip);
      logger.info('Notification de nouvelle réservation envoyée', { driverId: driver.id, passengerId: passenger.id, tripId: trip.id });
    } catch (error) {
      logger.error('Erreur lors de l\'envoi de la notification de réservation', { driverId: driver.id, error: error.message });
    }

    try {
      await emailService.sendNewBookingEmail(driver, passenger, trip);
    } catch (error) {
      logger.error('Erreur lors de l\'envoi de l\'email de réservation', { driverId: driver.id, error: error.message });
    }
  }

  async notifyBookingAccepted(passenger, driver, trip, booking) {
    try {
      await pushNotificationService.sendBookingAcceptedNotification(passenger.id, driver, trip);
      logger.info('Notification de réservation acceptée envoyée', { passengerId: passenger.id, driverId: driver.id, tripId: trip.id });
    } catch (error) {
      logger.error('Erreur lors de l\'envoi de la notification d\'acceptation', { passengerId: passenger.id, error: error.message });
    }

    try {
      await emailService.sendBookingConfirmation(booking, trip, driver, passenger);
    } catch (error) {
      logger.error('Erreur lors de l\'envoi de l\'email de confirmation', { passengerId: passenger.id, error: error.message });
    }
  }

  async notifyBookingRejected(passenger, driver, trip) {
    try {
      await pushNotificationService.sendBookingRejectedNotification(passenger.id, driver, trip);
      logger.info('Notification de réservation refusée envoyée', { passengerId: passenger.id, driverId: driver.id, tripId: trip.id });
    } catch (error) {
      logger.error('Erreur lors de l\'envoi de la notification de refus', { passengerId: passenger.id, error: error.message });
    }
  }

  async notifyNewMessage(recipient, sender, messagePreview) {
    try {
      await pushNotificationService.sendNewMessageNotification(recipient.id, sender, messagePreview);
      logger.info('Notification de nouveau message envoyée', { recipientId: recipient.id, senderId: sender.id });
    } catch (error) {
      logger.error('Erreur lors de l\'envoi de la notification de message', { recipientId: recipient.id, error: error.message });
    }
  }

  async notifyTripReminder(user, trip, hoursBeforeDeparture = 24) {
    try {
      await pushNotificationService.sendTripReminderNotification(user.id, trip, hoursBeforeDeparture);
      logger.info('Notification de rappel de trajet envoyée', { userId: user.id, tripId: trip.id });
    } catch (error) {
      logger.error('Erreur lors de l\'envoi de la notification de rappel', { userId: user.id, error: error.message });
    }

    try {
      await emailService.sendTripReminder(trip, user);
    } catch (error) {
      logger.error('Erreur lors de l\'envoi de l\'email de rappel', { userId: user.id, error: error.message });
    }
  }

  async notifyTripCancelled(users, trip, cancelledBy) {
    const userIds = users.map(u => u.id);

    try {
      await pushNotificationService.sendTripCancelledNotification(userIds, trip, cancelledBy);
      logger.info('Notification d\'annulation de trajet envoyée', { userCount: users.length, tripId: trip.id });
    } catch (error) {
      logger.error('Erreur lors de l\'envoi de la notification d\'annulation', { tripId: trip.id, error: error.message });
    }

    for (const user of users) {
      try {
        await emailService.sendTripCancelledEmail(user, trip, cancelledBy);
      } catch (error) {
        logger.error('Erreur lors de l\'envoi de l\'email d\'annulation', { userId: user.id, error: error.message });
      }
    }
  }
}

export default new NotificationService();
