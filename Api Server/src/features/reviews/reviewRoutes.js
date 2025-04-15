const { Router } = require('express');
const reviewController = require('./reviewController');
const reviewValidation = require('./reviewValidation');
const reviewAuth = require('./reviewAuthorization');
const { handleValidationErrors } = require('../../common/util');
const { notAllowed } = require('../../common/errorMiddleware');
const router = Router();

router.route('/:companyId')
    .post(
        reviewValidation.createReviewValidator,
        handleValidationErrors,
        reviewController.createReview
    )
    .all(notAllowed);

router.route('/:reviewId')
    .put(
        reviewValidation.updateReviewValidator,
        handleValidationErrors,
        reviewAuth.authUpdateReview,
        reviewController.updateReview
    )
    .delete(
        reviewValidation.deleteReviewValidator,
        handleValidationErrors,
        reviewAuth.authDeleteReview,
        reviewController.deleteReview
    )
    .all(notAllowed);

module.exports = router;