const express = require('express');
const router = express.Router();
const eventController = require('../../controllers/eventController');
const catchAsync = require('../../utils/catchAsync');

// Public routes to GET event Info (no auth required)
router.get('/', catchAsync(eventController.getAllPublicEvents));
router.get('/:id', catchAsync(eventController.getPublicEvent));

module.exports = router;