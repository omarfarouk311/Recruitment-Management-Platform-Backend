const express = require('express');
const router = express.Router();
const jobOfferRoutes = require('./job_offers/jobOfferRoutes');
const educationsRoute = require('./educations/educationsRoute')
const skillRoutes = require('./skills/skillsRoutes');
const companyRoutes = require('./companies/companyRoutes');
const jobsAppliedForRoutes = require('./jobs_applied_for/jobsAppliedForRoutes');
const experienceRoutes = require('./experience/experienceRoutes');
const statsRoutes = require('./stats/statsRoutes');
const jobRoutes = require('./jobs/jobRoutes');
const profileRoutes = require('./profiles/profileRouter');

router.use('/job-offers', jobOfferRoutes);
router.use('/educations', educationsRoute);
router.use('/skills', skillRoutes);
router.use('/companies', companyRoutes);
router.use('/jobs-applied-for', jobsAppliedForRoutes);
router.use('/experiences', experienceRoutes);
router.use('/stats', statsRoutes);
router.use('/jobs', jobRoutes);
router.use('/profiles', profileRoutes);

module.exports = router;