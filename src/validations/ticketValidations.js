// File: /src/validations/ticketValidations.js
const Joi = require('joi');

exports.createTicketPurchaseSchema = Joi.object({
  quantity: Joi.number().integer().min(1).max(10).required(),
  buyer_name: Joi.string().max(100).required(),
  phone: Joi.string().max(20).required(),
  email: Joi.string().email().max(100).required(),
  reference_number: Joi.string().max(50).required(),
  // payslip_url handled separately (file upload)
  attendees: Joi.array().items(
    Joi.object({
      name: Joi.string().max(100).required()
    })
  ).min(1).required() // At least 1 attendee
}).options({ abortEarly: false });