const express = require('express');
const router = express.Router();
const jobOfferRoutes = require('./job_offers/jobOfferRoutes');
const companyRoutes = require('./companies/companyRoutes');

router.use('/job-offers', jobOfferRoutes);

router.use('/companies', companyRoutes);


module.exports = router;