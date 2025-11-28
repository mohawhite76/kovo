import { body, param, query, validationResult } from 'express-validator';

export const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

export const registerValidation = [
  body('email')
    .isEmail()
    .withMessage('Email invalide')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Le mot de passe doit contenir au moins 8 caractères')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Le mot de passe doit contenir une majuscule, une minuscule et un chiffre'),
  body('firstName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Le prénom doit contenir entre 2 et 50 caractères'),
  body('lastName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Le nom doit contenir entre 2 et 50 caractères'),
  body('university')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('L\'université doit contenir entre 2 et 100 caractères'),
  body('studentId')
    .optional({ values: 'falsy' })
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage('L\'identifiant étudiant doit contenir entre 3 et 50 caractères'),
  body('phone')
    .optional({ values: 'falsy' })
    .trim(),
  validateRequest
];

export const loginValidation = [
  body('email')
    .isEmail()
    .withMessage('Email invalide')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Mot de passe requis'),
  validateRequest
];

export const tripValidation = [
  body('departure')
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage('Le lieu de départ doit contenir entre 2 et 200 caractères'),
  body('destination')
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage('La destination doit contenir entre 2 et 200 caractères'),
  body('date_time')
    .isISO8601()
    .withMessage('Date et heure invalides')
    .custom((value) => {
      if (new Date(value) <= new Date()) {
        throw new Error('La date doit être dans le futur');
      }
      return true;
    }),
  body('seats_available')
    .isInt({ min: 1, max: 8 })
    .withMessage('Le nombre de places doit être entre 1 et 8'),
  body('price')
    .isFloat({ min: 0, max: 500 })
    .withMessage('Le prix doit être entre 0 et 500€'),
  body('meeting_point')
    .optional({ values: 'falsy' })
    .trim()
    .isLength({ max: 200 })
    .withMessage('Le point de rencontre ne peut pas dépasser 200 caractères'),
  body('description')
    .optional({ values: 'falsy' })
    .trim()
    .isLength({ max: 500 })
    .withMessage('La description ne peut pas dépasser 500 caractères'),
  body('luggage_size')
    .optional()
    .isIn(['small', 'medium', 'large'])
    .withMessage('La taille des bagages doit être small, medium ou large'),
  body('pets_allowed')
    .optional()
    .isBoolean()
    .withMessage('pets_allowed doit être un booléen'),
  body('smoking_allowed')
    .optional()
    .isBoolean()
    .withMessage('smoking_allowed doit être un booléen'),
  body('music_allowed')
    .optional()
    .isBoolean()
    .withMessage('music_allowed doit être un booléen'),
  body('conversation_level')
    .optional()
    .isIn(['talkative', 'moderate', 'quiet'])
    .withMessage('conversation_level doit être talkative, moderate ou quiet'),
  body('detours_allowed')
    .optional()
    .isIn(['yes', 'no', 'discuss'])
    .withMessage('detours_allowed doit être yes, no ou discuss'),
  body('planned_stops')
    .optional({ values: 'falsy' })
    .trim()
    .isLength({ max: 500 })
    .withMessage('Les arrêts prévus ne peuvent pas dépasser 500 caractères'),
  body('instant_booking')
    .optional()
    .isBoolean()
    .withMessage('instant_booking doit être un booléen'),
  body('departure_lat')
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage('La latitude de départ doit être entre -90 et 90'),
  body('departure_lng')
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage('La longitude de départ doit être entre -180 et 180'),
  body('destination_lat')
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage('La latitude de destination doit être entre -90 et 90'),
  body('destination_lng')
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage('La longitude de destination doit être entre -180 et 180'),
  body('distance')
    .optional()
    .isInt({ min: 0 })
    .withMessage('La distance doit être un entier positif'),
  body('duration')
    .optional()
    .isInt({ min: 0 })
    .withMessage('La durée doit être un entier positif'),
  validateRequest
];

export const messageValidation = [
  body('recipientId')
    .isUUID()
    .withMessage('ID destinataire invalide'),
  body('content')
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Le message doit contenir entre 1 et 1000 caractères'),
  validateRequest
];

export const idValidation = [
  param('id')
    .isUUID()
    .withMessage('ID invalide'),
  validateRequest
];

export const paginationValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Le numéro de page doit être un entier positif'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('La limite doit être entre 1 et 100'),
  validateRequest
];
