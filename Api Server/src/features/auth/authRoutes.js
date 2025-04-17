const { Router } = require('express');
const { handleValidationErrors } = require('../../common/util');
const { notAllowed } = require('../../common/errorMiddleware');
const authController = require('./authController');
const authValidation = require('./authValidation');
const router = Router();

router.route('/signup')
    .post(
        authValidation.validateSignup,
        handleValidationErrors,
        authController.signUp
    )
    .all(notAllowed);

module.exports = router;