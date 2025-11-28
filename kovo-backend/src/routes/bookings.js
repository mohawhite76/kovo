import express from 'express';
import * as bookingController from '../controllers/bookingController.js';
import { authenticateToken } from '../middlewares/auth.js';
import { body } from 'express-validator';
import { validateRequest, idValidation } from '../utils/validators.js';

const router = express.Router();

router.post('/', authenticateToken, [
  body('tripId').isUUID(),
  body('seats').optional().isInt({ min: 1, max: 8 }),
  validateRequest
], bookingController.createBooking);

router.get('/my-bookings', authenticateToken, bookingController.getMyBookings);

router.get('/trip/:tripId', authenticateToken, bookingController.getTripBookings);

router.get('/:id', authenticateToken, idValidation, bookingController.getBookingById);

router.patch('/:id/status', authenticateToken, idValidation, [
  body('status').isIn(['confirmed', 'rejected', 'cancelled']),
  validateRequest
], bookingController.updateBookingStatus);

export default router;
