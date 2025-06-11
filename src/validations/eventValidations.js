const Joi = require('joi');

// Strict validation for POST (full event creation)
exports.createEventSchema = Joi.object({
  title: Joi.string().max(200).required(),
  display_date: Joi.string().max(50).required(),
  venue_name: Joi.string().max(100).required(),
  venue_address: Joi.string().required(),
  event_time: Joi.string().max(50).required(),
  description: Joi.string().required(),
  email_template_content: Joi.string().required(),
  ticket_price_regular: Joi.number().integer().min(0).required(),
  ticket_price_bundle: Joi.number().integer().min(0).allow(null),
  bundle_size: Joi.number().integer().min(0).allow(null),
  max_tickets: Joi.number().integer().min(1).required(),
  ticket_deadline: Joi.date().iso().required(),
  is_active: Joi.boolean().required(),
  inactive_message: Joi.string().allow(null),
  start_date: Joi.date().iso().required(),
  walk_in_price: Joi.number().integer().min(0).default(0),
  walk_in_cash_count: Joi.number().integer().min(0).default(0),
  walk_in_gcash_count: Joi.number().integer().min(0).default(0),
  poster_image_url: Joi.string().uri().allow(null)
}).options({ abortEarly: false }); // Return ALL validation errors

// Lenient validation for PATCH (partial updates)
exports.updateEventSchema = Joi.object({
  title: Joi.string().max(200),
  display_date: Joi.string().max(50),
  venue_name: Joi.string().max(100),
  venue_address: Joi.string(),
  event_time: Joi.string().max(50),
  description: Joi.string(),
  email_template_content: Joi.string(),
  ticket_price_regular: Joi.number().integer().min(0),
  ticket_price_bundle: Joi.number().integer().min(0).allow(null),
  bundle_size: Joi.number().integer().min(0).allow(null),
  max_tickets: Joi.number().integer().min(1), //sold_tickets: Joi.number().integer().min(1),
  ticket_deadline: Joi.date().iso(),
  is_active: Joi.boolean(),
  inactive_message: Joi.string().allow(null),
  start_date: Joi.date().iso(),
  walk_in_price: Joi.number().integer().min(0),
  poster_image_url: Joi.string().uri().allow(null)
}).min(1); // Require at least one field