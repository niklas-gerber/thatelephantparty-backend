const express = require('express');
const router = express.Router();
const staticContentController = require('../../controllers/staticContentController');
const logger = require('../../services/logger');
const errorHandler = require('../../middleware/errorHandler');
const catchAsync = require('../../utils/catchAsync');

// GET Public static page contents.
router.get('/:pageName', catchAsync(staticContentController.getPage));

module.exports = router;