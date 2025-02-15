const express = require('express');
const router = express.Router();
const jobOfferController = require('./jobOfferController');
const jobOfferValidation = require('./jobOfferValidation');
const { handleValidationErrors } = require('../../../common/util');
const jobOfferAuthorization = require('./jobOfferAuthorization')

router.get('/', jobOfferValidation.getOffers, handleValidationErrors, jobOfferAuthorization.isJobSeeker, jobOfferController.getJobOffers);

router.get('/:jobId', jobOfferController.getJobOffer);

router.patch('/reply', jobOfferController.replyToJobOffer);

router.get('/company-name', jobOfferController.getCompanyName);

module.exports = router;