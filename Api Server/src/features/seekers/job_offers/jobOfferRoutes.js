const express = require('express');
const router = express.Router();
const jobOfferController = require('./jobOfferController');
const jobOfferValidation = require('./jobOfferValidation');
const { handleValidationErrors } = require('../../../common/util');
const jobOfferAuthorization = require('./jobOfferAuthorization')

router.get('/', jobOfferValidation.getOffers, handleValidationErrors, jobOfferAuthorization.isJobSeeker, jobOfferController.getJobOffers);

router.get('/company-names', jobOfferValidation.validateStatus, handleValidationErrors, jobOfferController.getCompanyNames);

router.get('/:jobId', jobOfferValidation.jobOffer, handleValidationErrors, jobOfferAuthorization.isJobSeeker, jobOfferController.getJobOffer);

router.patch('/reply/:jobId', jobOfferValidation.replyToJobOffer, handleValidationErrors, jobOfferController.replyToJobOffer);

module.exports = router;