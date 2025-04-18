const { query, body, param } = require('express-validator');
const { validatePage } = require('../../../common/util');
const constants = require('../../../../config/config');

const companyId = () => query('companyId').optional().isInt({min: 1, max: 999999999}).withMessage('companyId must be an integer greater than 1');

const country = () => query('country').optional().isString().withMessage('country must be a string');

const city = () => query('city').optional().isString().withMessage('city must be a string');

const status = () => query('status')
                    .optional()
                    .isIn([
                        constants.candidate_status_accepted, 
                        constants.candidate_status_pending, 
                        constants.candidate_status_rejected
                    ]).withMessage('status must be one of the following: 1 (pending), 2 (accepted), 3 (rejected)');

const sort = () => query('sort')
                    .optional()
                    .isIn([constants.desc_order, constants.asc_order])
                    .withMessage('sort must be one of the following: -1 (descending), 1 (ascending)');

const jobId = () => param('jobId').isInt({min: 1, max: 999999999}).withMessage('jobId must be an integer greater than 1');

const jobOfferStatus = () => body('status').isBoolean().withMessage('status must be a boolean');

exports.getOffers = [
    validatePage(),
    companyId(),
    country(),
    city(),
    status(),
    sort()
]

exports.jobOffer = [
    jobId()
]

exports.replyToJobOffer = [
    jobId(),
    jobOfferStatus()
]

exports.validateStatus = [
    status()
]