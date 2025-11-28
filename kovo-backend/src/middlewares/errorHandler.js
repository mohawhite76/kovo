import logger from '../config/logger.js';

export const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Erreur serveur interne';

  const errorLog = {
    message,
    statusCode,
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userId: req.user?.id
  };

  if (statusCode >= 500) {
    logger.error('Server error', { ...errorLog, stack: err.stack });
  } else {
    logger.warn('Client error', errorLog);
  }

  res.status(statusCode).json({
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

export class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}
