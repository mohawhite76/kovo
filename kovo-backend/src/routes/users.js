import express from 'express';
import multer from 'multer';
import * as userController from '../controllers/userController.js';
import { authenticateToken } from '../middlewares/auth.js';
import { uploadLimiter } from '../middlewares/rateLimiter.js';
import { body } from 'express-validator';
import { validateRequest, idValidation } from '../utils/validators.js';

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Seuls les fichiers image sont acceptés'), false);
    }
  }
});

const uploadDocument = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Seuls les fichiers image et PDF sont acceptés'), false);
    }
  }
});

router.put('/profile', authenticateToken, [
  body('firstName').optional().trim().isLength({ min: 2, max: 50 }).withMessage('Le prénom doit contenir entre 2 et 50 caractères'),
  body('lastName').optional().trim().isLength({ min: 2, max: 50 }).withMessage('Le nom doit contenir entre 2 et 50 caractères'),
  body('university').optional().trim().isLength({ min: 2, max: 100 }).withMessage('L\'université doit contenir entre 2 et 100 caractères'),
  body('studentId').optional().trim().isLength({ min: 3, max: 50 }).withMessage('Le numéro étudiant doit contenir entre 3 et 50 caractères'),
  body('phone').optional().trim().custom((value) => {
    if (!value) return true;
    const phoneRegex = /^(\+33|0)[1-9]\d{8}$/;
    if (!phoneRegex.test(value.replace(/\s/g, ''))) {
      throw new Error('Le numéro de téléphone doit être au format français (ex: +33612345678 ou 0612345678)');
    }
    return true;
  }),
  body('bio').optional().trim().isLength({ max: 500 }).withMessage('La bio ne peut pas dépasser 500 caractères'),
  body('avatar').optional().isURL().withMessage('L\'avatar doit être une URL valide'),
  validateRequest
], userController.updateProfile);

router.post('/change-password', authenticateToken, [
  body('currentPassword').notEmpty(),
  body('newPassword')
    .isLength({ min: 8 })
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/),
  validateRequest
], userController.changePassword);

router.get('/:id', idValidation, userController.getUserById);

router.delete('/account', authenticateToken, [
  body('password').notEmpty(),
  validateRequest
], userController.deleteAccount);

router.post('/avatar', authenticateToken, uploadLimiter, upload.single('avatar'), userController.uploadAvatar);

router.delete('/avatar', authenticateToken, userController.deleteAvatar);

router.post('/drivers-license', authenticateToken, uploadLimiter, upload.single('licensePhoto'), userController.updateDriversLicense);

router.post('/vehicle', authenticateToken, uploadLimiter, upload.single('vehiclePhoto'), userController.updateVehicle);

router.post('/student-card', authenticateToken, uploadLimiter, uploadDocument.single('studentCard'), userController.uploadStudentCard);

export default router;
