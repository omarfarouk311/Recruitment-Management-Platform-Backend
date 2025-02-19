const express = require('express');
const router = express.Router();
const jobOfferRoutes = require('./job_offers/jobOfferRoutes');
const skillRoutes = require('./skills/skillsRoutes')

router.use('/job-offers', jobOfferRoutes);

router.use('/skills', skillRoutes)

module.exports = router;