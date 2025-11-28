import SibApiV3Sdk from 'sib-api-v3-sdk';
import brevoClient from '../config/brevo.js';
import { formatDate } from '../utils/helpers.js';

class EmailService {
  async sendVerificationEmail(email, firstName, code) {
    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

    sendSmtpEmail.subject = 'Bienvenue sur Kovo - Vérifiez votre adresse email 🎓';
    sendSmtpEmail.to = [{ email, name: firstName }];
    sendSmtpEmail.sender = {
      email: process.env.BREVO_SENDER_EMAIL,
      name: process.env.BREVO_SENDER_NAME
    };
    sendSmtpEmail.htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { text-align: center; padding: 20px 0; }
            .logo { font-size: 32px; font-weight: bold; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 8px; margin: 20px 0; }
            .code { font-size: 36px; font-weight: bold; letter-spacing: 8px; text-align: center; color: #000; padding: 20px; background: #fff; border-radius: 4px; margin: 20px 0; }
            .footer { text-align: center; color: #666; font-size: 14px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">Kovo</div>
            </div>
            <div class="content">
              <h2>Bienvenue ${firstName} ! 🎓</h2>
              <p>Merci de rejoindre Kovo, la communauté de covoiturage qui connecte les étudiants pour voyager ensemble en France.</p>
              <p>Pour activer votre compte et commencer à partager vos trajets, utilisez ce code de vérification :</p>
              <div class="code">${code}</div>
              <p style="color: #666; font-size: 14px;">Ce code est valide pendant 24 heures.</p>
              <p>Si vous n'avez pas créé ce compte, vous pouvez ignorer cet email en toute sécurité.</p>
            </div>
            <div class="footer">
              <p>Kovo - Le covoiturage étudiant entre étudiants</p>
            </div>
          </div>
        </body>
      </html>
    `;

    try {
      await brevoClient.sendTransacEmail(sendSmtpEmail);
    } catch (error) {
      console.error('Erreur envoi email:', error);
      throw new Error('Erreur lors de l\'envoi de l\'email');
    }
  }

  async sendPasswordResetEmail(email, firstName, resetToken) {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

    sendSmtpEmail.subject = 'Réinitialisez votre mot de passe Kovo 🔑';
    sendSmtpEmail.to = [{ email, name: firstName }];
    sendSmtpEmail.sender = {
      email: process.env.BREVO_SENDER_EMAIL,
      name: process.env.BREVO_SENDER_NAME
    };
    sendSmtpEmail.htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { text-align: center; padding: 20px 0; }
            .logo { font-size: 32px; font-weight: bold; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 8px; margin: 20px 0; }
            .button { display: inline-block; padding: 12px 30px; background: #000; color: #fff; text-decoration: none; border-radius: 4px; margin: 20px 0; }
            .footer { text-align: center; color: #666; font-size: 14px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">Kovo</div>
            </div>
            <div class="content">
              <h2>Réinitialisation de votre mot de passe</h2>
              <p>Bonjour ${firstName},</p>
              <p>Vous avez demandé à réinitialiser votre mot de passe Kovo. Pas de souci, on s'en occupe !</p>
              <p>Cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe :</p>
              <div style="text-align: center;">
                <a href="${resetUrl}" class="button">Créer un nouveau mot de passe</a>
              </div>
              <p style="color: #666; font-size: 14px;">Ce lien est valide pendant 1 heure pour des raisons de sécurité.</p>
              <p>Si vous n'avez pas demandé cette réinitialisation, vous pouvez ignorer cet email. Votre mot de passe actuel reste inchangé.</p>
            </div>
            <div class="footer">
              <p>Kovo - Le covoiturage étudiant entre étudiants</p>
            </div>
          </div>
        </body>
      </html>
    `;

    try {
      await brevoClient.sendTransacEmail(sendSmtpEmail);
    } catch (error) {
      console.error('Erreur envoi email:', error);
      throw new Error('Erreur lors de l\'envoi de l\'email');
    }
  }

  async sendBookingConfirmation(booking, trip, driver, passenger) {
    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

    sendSmtpEmail.subject = `✅ Réservation confirmée pour ${trip.departure} → ${trip.destination}`;
    sendSmtpEmail.to = [{ email: passenger.email, name: passenger.first_name }];
    sendSmtpEmail.sender = {
      email: process.env.BREVO_SENDER_EMAIL,
      name: process.env.BREVO_SENDER_NAME
    };
    sendSmtpEmail.htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { text-align: center; padding: 20px 0; }
            .logo { font-size: 32px; font-weight: bold; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 8px; margin: 20px 0; }
            .trip-details { background: #fff; padding: 20px; border-radius: 4px; margin: 20px 0; }
            .detail-row { display: flex; justify-content: space-between; margin: 10px 0; padding: 8px 0; border-bottom: 1px solid #eee; }
            .footer { text-align: center; color: #666; font-size: 14px; margin-top: 20px; }
            .success-badge { background: #4caf50; color: white; padding: 8px 16px; border-radius: 20px; display: inline-block; margin: 10px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">Kovo</div>
            </div>
            <div class="content">
              <div style="text-align: center;">
                <span class="success-badge">✅ Réservation confirmée</span>
              </div>
              <h2>C'est parti ${passenger.first_name} ! 🚗</h2>
              <p>Votre place est réservée. Voici les détails de votre trajet :</p>
              <div class="trip-details">
                <div class="detail-row">
                  <span><strong>🚩 Départ</strong></span>
                  <span>${trip.departure}</span>
                </div>
                <div class="detail-row">
                  <span><strong>📍 Arrivée</strong></span>
                  <span>${trip.destination}</span>
                </div>
                <div class="detail-row">
                  <span><strong>📅 Date et heure</strong></span>
                  <span>${formatDate(trip.date_time)}</span>
                </div>
                <div class="detail-row">
                  <span><strong>💰 Prix</strong></span>
                  <span>${trip.price}€</span>
                </div>
                <div class="detail-row">
                  <span><strong>👤 Conducteur</strong></span>
                  <span>${driver.first_name} ${driver.last_name}</span>
                </div>
              </div>
              <p><strong>Prochaines étapes :</strong></p>
              <ul>
                <li>Contactez ${driver.first_name} via la messagerie Kovo pour confirmer le point de rencontre</li>
                <li>Soyez ponctuel(le) le jour J</li>
                <li>N'oubliez pas votre contribution aux frais</li>
              </ul>
              <p>Bon voyage ! 🎒</p>
            </div>
            <div class="footer">
              <p>Kovo - Le covoiturage étudiant entre étudiants</p>
            </div>
          </div>
        </body>
      </html>
    `;

    try {
      await brevoClient.sendTransacEmail(sendSmtpEmail);
    } catch (error) {
      console.error('Erreur envoi email:', error);
    }
  }

  async sendTripReminder(trip, user) {
    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

    sendSmtpEmail.subject = `⏰ Rappel : Votre trajet demain vers ${trip.destination}`;
    sendSmtpEmail.to = [{ email: user.email, name: user.first_name }];
    sendSmtpEmail.sender = {
      email: process.env.BREVO_SENDER_EMAIL,
      name: process.env.BREVO_SENDER_NAME
    };
    sendSmtpEmail.htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { text-align: center; padding: 20px 0; }
            .logo { font-size: 32px; font-weight: bold; }
            .content { background: #fff9e6; padding: 30px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffa726; }
            .footer { text-align: center; color: #666; font-size: 14px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">Kovo</div>
            </div>
            <div class="content">
              <h2>⏰ N'oubliez pas votre trajet demain !</h2>
              <p>Bonjour ${user.first_name},</p>
              <p>Petit rappel : votre trajet <strong>${trip.departure} → ${trip.destination}</strong> est prévu pour <strong>demain à ${formatDate(trip.date_time)}</strong>.</p>
              <p><strong>Pensez à :</strong></p>
              <ul>
                <li>Vérifier l'heure et le point de rencontre avec les autres participants</li>
                <li>Préparer votre sac la veille</li>
                <li>Prévoir un peu de monnaie pour les frais</li>
              </ul>
              <p>À demain ! 👋</p>
            </div>
            <div class="footer">
              <p>Kovo - Le covoiturage étudiant entre étudiants</p>
            </div>
          </div>
        </body>
      </html>
    `;

    try {
      await brevoClient.sendTransacEmail(sendSmtpEmail);
    } catch (error) {
      console.error('Erreur envoi email:', error);
    }
  }

  async sendNewBookingEmail(driver, passenger, trip) {
    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

    sendSmtpEmail.subject = `🔔 Nouvelle demande de ${passenger.first_name} pour votre trajet`;
    sendSmtpEmail.to = [{ email: driver.email, name: driver.first_name }];
    sendSmtpEmail.sender = {
      email: process.env.BREVO_SENDER_EMAIL,
      name: process.env.BREVO_SENDER_NAME
    };
    sendSmtpEmail.htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { text-align: center; padding: 20px 0; }
            .logo { font-size: 32px; font-weight: bold; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 8px; margin: 20px 0; }
            .trip-details { background: #fff; padding: 20px; border-radius: 4px; margin: 20px 0; }
            .detail-row { display: flex; justify-content: space-between; margin: 10px 0; padding: 8px 0; border-bottom: 1px solid #eee; }
            .button { display: inline-block; padding: 12px 30px; background: #000; color: #fff; text-decoration: none; border-radius: 4px; margin: 20px 0; }
            .footer { text-align: center; color: #666; font-size: 14px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">Kovo</div>
            </div>
            <div class="content">
              <h2>🔔 Nouvelle demande de réservation</h2>
              <p>Bonjour ${driver.first_name},</p>
              <p><strong>${passenger.first_name} ${passenger.last_name}</strong> souhaite voyager avec vous !</p>
              <div class="trip-details">
                <div class="detail-row">
                  <span><strong>🚩 Départ</strong></span>
                  <span>${trip.departure}</span>
                </div>
                <div class="detail-row">
                  <span><strong>📍 Arrivée</strong></span>
                  <span>${trip.destination}</span>
                </div>
                <div class="detail-row">
                  <span><strong>📅 Date</strong></span>
                  <span>${formatDate(trip.date_time)}</span>
                </div>
                <div class="detail-row">
                  <span><strong>💰 Prix</strong></span>
                  <span>${trip.price}€</span>
                </div>
              </div>
              <div style="text-align: center;">
                <a href="${process.env.FRONTEND_URL}/my-trips" class="button">Voir les détails</a>
              </div>
              <p style="font-size: 14px; color: #666;">Connectez-vous à Kovo pour accepter ou refuser cette demande. Pensez à répondre rapidement pour ne pas faire attendre ${passenger.first_name} !</p>
            </div>
            <div class="footer">
              <p>Kovo - Le covoiturage étudiant entre étudiants</p>
            </div>
          </div>
        </body>
      </html>
    `;

    try {
      await brevoClient.sendTransacEmail(sendSmtpEmail);
    } catch (error) {
      console.error('Erreur envoi email:', error);
    }
  }

  async sendTripCancelledEmail(user, trip, cancelledBy) {
    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

    sendSmtpEmail.subject = `❌ Trajet annulé : ${trip.departure} → ${trip.destination}`;
    sendSmtpEmail.to = [{ email: user.email, name: user.first_name }];
    sendSmtpEmail.sender = {
      email: process.env.BREVO_SENDER_EMAIL,
      name: process.env.BREVO_SENDER_NAME
    };
    sendSmtpEmail.htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { text-align: center; padding: 20px 0; }
            .logo { font-size: 32px; font-weight: bold; }
            .content { background: #fff3e0; padding: 30px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ff9800; }
            .trip-details { background: #fff; padding: 20px; border-radius: 4px; margin: 20px 0; }
            .detail-row { display: flex; justify-content: space-between; margin: 10px 0; }
            .button { display: inline-block; padding: 12px 30px; background: #000; color: #fff; text-decoration: none; border-radius: 4px; margin: 20px 0; }
            .footer { text-align: center; color: #666; font-size: 14px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">Kovo</div>
            </div>
            <div class="content">
              <h2>❌ Trajet annulé</h2>
              <p>Bonjour ${user.first_name},</p>
              <p>Nous sommes désolés de vous informer que <strong>${cancelledBy.first_name} ${cancelledBy.last_name}</strong> a dû annuler le trajet suivant :</p>
              <div class="trip-details">
                <div class="detail-row">
                  <span><strong>Départ :</strong></span>
                  <span>${trip.departure}</span>
                </div>
                <div class="detail-row">
                  <span><strong>Arrivée :</strong></span>
                  <span>${trip.destination}</span>
                </div>
                <div class="detail-row">
                  <span><strong>Date :</strong></span>
                  <span>${formatDate(trip.date_time)}</span>
                </div>
              </div>
              <p>Pas de panique ! Il y a plein d'autres trajets disponibles sur Kovo.</p>
              <div style="text-align: center;">
                <a href="${process.env.FRONTEND_URL}/trips" class="button">Trouver un autre trajet</a>
              </div>
            </div>
            <div class="footer">
              <p>Kovo - Le covoiturage étudiant entre étudiants</p>
            </div>
          </div>
        </body>
      </html>
    `;

    try {
      await brevoClient.sendTransacEmail(sendSmtpEmail);
    } catch (error) {
      console.error('Erreur envoi email:', error);
    }
  }
}

export default new EmailService();
