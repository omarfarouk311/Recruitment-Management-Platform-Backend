const express = require('express');
const router = express.Router();
const jobOfferRoutes = require('./job_offers/jobOfferRoutes');
const educationsRoute=require('./educations/educationsRoute')

router.use('/job-offers', jobOfferRoutes);
router.use('/educations',educationsRoute);


module.exports = router;