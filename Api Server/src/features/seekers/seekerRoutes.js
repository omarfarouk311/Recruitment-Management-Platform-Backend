const express = require('express');
const router = express.Router();
const jobOfferRoutes = require('./job_offers/jobOfferRoutes');

router.use('/job-offers', jobOfferRoutes);


module.exports = router;