const { Router } = require('express');
const reviewController = require('./reviewController');
const reviewValidation = require('./reviewValidation');
const { handleValidationErrors } = require('../../common/util');
const { notAllowed } = require('../../common/errorMiddleware');
const router = Router();


router.route('/:companyId')
    .get(reviewValidation.validateGetReviews, handleValidationErrors, reviewController.getReviews)
    .all(notAllowed);

module.exports = router;