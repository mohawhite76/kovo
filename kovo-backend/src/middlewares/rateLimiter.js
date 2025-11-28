import rateLimit from 'express-rate-limit';
import logger from '../config/logger.js';

export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Trop de requêtes depuis cette IP, veuillez réessayer dans 15 minutes',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn('Rate limit exceeded', {
      ip: req.ip,
      url: req.originalUrl
    });
    res.status(429).json({
      error: 'Trop de requêtes depuis cette IP, veuillez réessayer dans 15 minutes'
    });
  }
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Trop de tentatives de connexion, veuillez réessayer dans 15 minutes',
  skipSuccessfulRequests: true,
  handler: (req, res) => {
    logger.warn('Auth rate limit exceeded', {
      ip: req.ip,
      email: req.body.email
    });
    res.status(429).json({
      error: 'Trop de tentatives de connexion, veuillez réessayer dans 15 minutes'
    });
  }
});

export const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: 'Trop d\'uploads, veuillez réessayer dans 1 heure',
  handler: (req, res) => {
    logger.warn('Upload rate limit exceeded', {
      ip: req.ip,
      userId: req.user?.id
    });
    res.status(429).json({
      error: 'Trop d\'uploads, veuillez réessayer dans 1 heure'
    });
  }
});
