const { Router } = require('express');
const reviewController = require('./reviewController');
const { validateGetReviews, handleValidationErrors } = require('./reviewValidation');
const router = Router();

router.route('/:companyId')
    .get(validateGetReviews, handleValidationErrors, reviewController.getReviews);