export const BOOKING_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  REJECTED: 'rejected',
  CANCELLED: 'cancelled'
};

export const TRIP_STATUS = {
  ACTIVE: 'active',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
};

export const STUDENT_VERIFICATION_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected'
};

export const LUGGAGE_SIZE = {
  SMALL: 'small',
  MEDIUM: 'medium',
  LARGE: 'large'
};

export const CONVERSATION_LEVEL = {
  TALKATIVE: 'talkative',
  MODERATE: 'moderate',
  QUIET: 'quiet'
};

export const DETOURS_ALLOWED = {
  YES: 'yes',
  NO: 'no',
  DISCUSS: 'discuss'
};

export const FILE_UPLOAD = {
  MAX_IMAGE_SIZE: 5 * 1024 * 1024,
  MAX_DOCUMENT_SIZE: 10 * 1024 * 1024,
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'],
  ALLOWED_DOCUMENT_TYPES: ['image/jpeg', 'image/png', 'image/jpg', 'image/webp', 'application/pdf']
};

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100
};

export const PASSWORD = {
  MIN_LENGTH: 8,
  SALT_ROUNDS: 12
};

export const TOKEN = {
  RESET_EXPIRY: '1h',
  DEFAULT_EXPIRY: '7d'
};

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500
};
