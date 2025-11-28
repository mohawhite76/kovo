import express from 'express';
import * as tripController from '../controllers/tripController.js';
import { authenticateToken, optionalAuth } from '../middlewares/auth.js';
import { tripValidation, idValidation, paginationValidation } from '../utils/validators.js';
import { body } from 'express-validator';
import { validateRequest } from '../utils/validators.js';

const router = express.Router();

router.get('/', optionalAuth, paginationValidation, tripController.getTrips);

router.get('/my-trips', authenticateToken, paginationValidation, tripController.getMyTrips);

router.get('/:id', optionalAuth, idValidation, tripController.getTripById);

router.post('/', authenticateToken, tripValidation, tripController.createTrip);

router.put('/:id', authenticateToken, idValidation, [
  body('dateTime').optional().isISO8601(),
  body('seats').optional().isInt({ min: 1, max: 8 }),
  body('price').optional().isFloat({ min: 0, max: 500 }),
  body('description').optional().trim().isLength({ max: 500 }),
  body('meetingPoint').optional().trim().isLength({ max: 200 }),
  body('status').optional().isIn(['active', 'completed', 'cancelled']),
  validateRequest
], tripController.updateTrip);

router.delete('/:id', authenticateToken, idValidation, tripController.deleteTrip);

export default router;
