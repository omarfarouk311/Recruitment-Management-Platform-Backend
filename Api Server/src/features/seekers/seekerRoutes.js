const express = require('express');
const router = express.Router();
const jobOfferRoutes = require('./job_offers/jobOfferRoutes');
const educationsRoute=require('./educations/educationsRoute')
const skillRoutes = require('./skills/skillsRoutes')

router.use('/job-offers', jobOfferRoutes);
router.use('/educations',educationsRoute);

router.use('/skills', skillRoutes)

module.exports = router;