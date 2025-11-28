import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { supabaseAdmin } from '../config/supabase.js';
import { AppError } from '../middlewares/errorHandler.js';
import { generateVerificationCode } from '../utils/helpers.js';
import logger from '../config/logger.js';
import emailService from './emailService.js';

class AuthService {
  async register(userData) {
    const { email, password, firstName, lastName, university, studentId, phone } = userData;

    logger.info('User registration attempt', { email, university });

    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      logger.warn('Registration failed - email already exists', { email });
      throw new AppError('Cet email est déjà utilisé', 400);
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const verificationCode = generateVerificationCode();

    const { data: user, error } = await supabaseAdmin
      .from('users')
      .insert([
        {
          email,
          password: hashedPassword,
          first_name: firstName,
          last_name: lastName,
          university,
          student_id: studentId,
          phone,
          verification_code: verificationCode,
          verified: false
        }
      ])
      .select()
      .single();

    if (error) {
      logger.error('User registration failed', { email, error: error.message });
      throw new AppError('Erreur lors de la création du compte', 500);
    }

    await emailService.sendVerificationEmail(email, firstName, verificationCode);

    logger.info('User registered successfully', { userId: user.id, email });

    return this.sanitizeUser(user);
  }

  async login(email, password) {
    logger.info('User login attempt', { email });

    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !user) {
      logger.warn('Login failed - user not found', { email });
      throw new AppError('Email ou mot de passe incorrect', 401);
    }

    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      logger.warn('Login failed - invalid password', { email, userId: user.id });
      throw new AppError('Email ou mot de passe incorrect', 401);
    }

    if (!user.verified) {
      logger.warn('Login failed - email not verified', { email, userId: user.id });
      throw new AppError('Veuillez vérifier votre email avant de vous connecter', 403);
    }

    const token = this.generateToken(user.id);

    logger.info('User logged in successfully', { userId: user.id, email });

    return {
      token,
      user: this.sanitizeUser(user)
    };
  }

  async verifyEmail(email, code) {
    logger.info('Email verification attempt', { email });

    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('email', email)
      .eq('verification_code', code)
      .single();

    if (error || !user) {
      logger.warn('Email verification failed - invalid code', { email });
      throw new AppError('Code de vérification invalide', 400);
    }

    const { error: updateError } = await supabaseAdmin
      .from('users')
      .update({
        verified: true,
        verification_code: null
      })
      .eq('id', user.id);

    if (updateError) {
      logger.error('Email verification update failed', { userId: user.id, error: updateError.message });
      throw new AppError('Erreur lors de la vérification', 500);
    }

    const token = this.generateToken(user.id);

    logger.info('Email verified successfully', { userId: user.id, email });

    return {
      token,
      user: this.sanitizeUser(user)
    };
  }

  async resendVerificationCode(email) {
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !user) {
      throw new AppError('Utilisateur non trouvé', 404);
    }

    if (user.verified) {
      throw new AppError('Cet email est déjà vérifié', 400);
    }

    const verificationCode = generateVerificationCode();

    const { error: updateError } = await supabaseAdmin
      .from('users')
      .update({ verification_code: verificationCode })
      .eq('id', user.id);

    if (updateError) {
      throw new AppError('Erreur lors de l\'envoi du code', 500);
    }

    await emailService.sendVerificationEmail(email, user.first_name, verificationCode);

    return { message: 'Code de vérification renvoyé' };
  }

  async requestPasswordReset(email) {
    const { data: user } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (!user) {
      return { message: 'Si cet email existe, un lien de réinitialisation a été envoyé' };
    }

    const resetToken = jwt.sign(
      { userId: user.id, type: 'password-reset' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    await emailService.sendPasswordResetEmail(email, user.first_name, resetToken);

    return { message: 'Si cet email existe, un lien de réinitialisation a été envoyé' };
  }

  async resetPassword(token, newPassword) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      if (decoded.type !== 'password-reset') {
        throw new AppError('Token invalide', 400);
      }

      const hashedPassword = await bcrypt.hash(newPassword, 12);

      const { error } = await supabaseAdmin
        .from('users')
        .update({ password: hashedPassword })
        .eq('id', decoded.userId);

      if (error) {
        throw new AppError('Erreur lors de la réinitialisation', 500);
      }

      return { message: 'Mot de passe réinitialisé avec succès' };
    } catch (error) {
      throw new AppError('Token invalide ou expiré', 400);
    }
  }

  generateToken(userId) {
    return jwt.sign({ userId }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN
    });
  }

  sanitizeUser(user) {
    const { password, verification_code, ...sanitizedUser } = user;
    return sanitizedUser;
  }
}

export default new AuthService();
