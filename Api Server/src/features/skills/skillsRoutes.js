const express = require('express');
const controller = require('./skillsController');
const router = express.Router();

router.get('/', controller.getSkills);

module.exports = router;