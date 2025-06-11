const express = require('express');
const router = express.Router();
const ticketController = require('../../controllers/ticketController');
const validate = require('../../middleware/validate');
const { createTicketPurchaseSchema } = require('../../validations/ticketValidations');
const catchAsync = require('../../utils/catchAsync');
const upload = require('../../middleware/upload'); 

// POST Public Ticket Purchase
router.post(
  '/:id/purchase',  
  upload.single('payslip'),
  validate(createTicketPurchaseSchema),
  catchAsync(ticketController.createTicketPurchase)
);

module.exports = router;