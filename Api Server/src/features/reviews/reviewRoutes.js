const { Router } = require('express');
const reviewController = require('./reviewController');
const reviewValidation = require('./reviewValidation');
const reviewAuthorization = require('./reviewAuthorization');
const { handleValidationErrors } = require('../../common/util');
const { notAllowed } = require('../../common/errorMiddleware');
const router = Router();

router.route('/')
    .post(
        reviewAuthorization.authorizeCreateReview,
        reviewValidation.createReviewValidator,
        handleValidationErrors,
        reviewController.createReview
    )
    .all(notAllowed);

router.route('/:reviewId')
    .put(
        reviewValidation.updateReviewValidator,
        handleValidationErrors,
        reviewAuthorization.authorizeModifyReview(1),
        reviewController.updateReview
    )
    .delete(
        reviewValidation.deleteReviewValidator,
        handleValidationErrors,
        reviewAuthorization.authorizeModifyReview(0),
        reviewController.deleteReview
    )
    .all(notAllowed);

module.exports = router;