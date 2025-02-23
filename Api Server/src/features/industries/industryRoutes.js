const express = require('express');
const industryController = require('./industryController');
const router = express.Router();

router.get('/', industryController.getIndustries);

module.exports = router;