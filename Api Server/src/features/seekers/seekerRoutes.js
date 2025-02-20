const express = require('express');
const router = express.Router();
const jobOfferRoutes = require('./job_offers/jobOfferRoutes');
const jobsAppliedForRoutes = require('./jobs_applied_for/jobsAppliedForRoutes');

router.use('/job-offers', jobOfferRoutes);

router.use('/jobs-applied-for', jobsAppliedForRoutes);

module.exports = router;