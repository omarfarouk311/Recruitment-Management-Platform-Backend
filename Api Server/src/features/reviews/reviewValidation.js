const { param, body } = require('express-validator');

exports.createReviewValidator = [
    body('title').isString().isLength({ min: 1 }).withMessage('Title is required'),
    body('description').isString().isLength({ min: 1 }).withMessage('Description is required'),
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be an integer between 1 and 5'),
    body('role').isString().isLength({ min: 1 }).withMessage('Role is required')
];

exports.updateReviewValidator = [
    param('reviewId').isInt({ min: 1 }).withMessage('Review ID must be a positive integer'),
    body('title').isString().isLength({ min: 1 }).withMessage('Title is required'),
    body('description').isString().isLength({ min: 1 }).withMessage('Description is required'),
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be an integer between 1 and 5'),
    body('role').isString().isLength({ min: 1 }).withMessage('Role is required')
];

exports.deleteReviewValidator = [
    param('reviewId').isInt({ min: 1 }).withMessage('Review ID must be a positive integer')
];