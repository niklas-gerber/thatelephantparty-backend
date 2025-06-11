const express = require('express');
const router = express.Router();
const { protect } = require('../../middleware/auth');
const catchAsync = require('../../utils/catchAsync');
const eventController = require('../../controllers/eventController');
const ticketController = require('../../controllers/ticketController');
const validate = require('../../middleware/validate');
const { createEventSchema, updateEventSchema } = require('../../validations/eventValidations');
const upload = require('../../middleware/upload');


// All Admin Routes protected by auth middleware
// Create Event (with validation)
router.post(
  '/events',
  protect,  
  upload.single('poster'), 
  validate(createEventSchema),
  catchAsync(eventController.createEvent)
);

// Get all events
router.get(
  '/events',
  protect,
  catchAsync(eventController.getAllEvents)
);

// Read an Event
router.get(
  '/events/:id',
  protect,
  catchAsync(eventController.getEvent)
);

// Update Event (with validation)
router.patch(
  '/events/:id',
  protect,
  upload.single('poster'), // File processing first
  (req, res, next) => {
    // Skip validation if only a file was uploaded
    if (req.file && Object.keys(req.body).length === 0) {
      return next();
    }
    validate(updateEventSchema)(req, res, next);
  },
  catchAsync(eventController.updateEvent)
);

// Delete Event (no body validation needed)
router.delete(
  '/events/:id',
  protect,
  catchAsync(eventController.deleteEvent)
);

// GET all Tickets
router.get('/tickets', protect, catchAsync(ticketController.getAllTickets));

// PATCH /admin/tickets/:id (update ticket or payslip)
router.patch(
  '/tickets/:id',
  protect,
  upload.single('payslip'), // Reuse payslip upload middleware
  catchAsync(ticketController.updateTicket)
);

// DELETE /api/v1/admin/tickets/:id (delete ticket)
router.delete('/tickets/:id', protect, catchAsync(ticketController.deleteTicket));

// GET full attendee list for event
router.get(
  '/events/:eventId/attendees',
  protect,
  catchAsync(ticketController.getEventAttendees)
);

// PATCH check in/check out attendee
router.patch(
  '/attendees/:attendeeId/check-in',
  protect,
  catchAsync(ticketController.toggleAttendeeCheckIn)
);

// Increment/Decrement Walk-Ins
router.post(
  '/events/:id/walk-ins/increment',
  protect,
  catchAsync(eventController.incrementWalkIns)
);
router.post(
  '/events/:id/walk-ins/decrement',
  protect,
  catchAsync(eventController.decrementWalkIns)
);

// Get Walk-In Counts (for door service)
router.get(
  '/events/:id/walk-ins',
  protect,
  catchAsync(eventController.getWalkInCounts)
);

// Download Attendee list as PDF
router.get(
  '/events/:id/attendee-list',
  protect,
  catchAsync(eventController.generateAttendeeListPDF)
);

// Download accounting file for finished event
router.get(
  '/events/:id/accounting',
  protect,
  catchAsync(eventController.generateAccountingPDF)
);

module.exports = router;

// Download Email list of all buyers of event
router.get(
  '/events/:id/email-list',
  protect,
  catchAsync(eventController.generateEmailListPDF)
);