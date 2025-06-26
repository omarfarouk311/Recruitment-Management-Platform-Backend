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

router.route('/login')
    .post(
        authValidation.validateLogin,
        handleValidationErrors,
        authController.login
    )
    .all(notAllowed);

router.route('/refresh-token')
    .post(authController.refreshToken)
    .all(notAllowed);

router.route('/check-auth')
    .get(authController.checkAuth)
    .all(notAllowed);

router.route('/logout')
    .post(authController.logout)
    .all(notAllowed);

module.exports = router;