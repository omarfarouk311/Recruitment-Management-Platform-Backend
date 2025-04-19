const express = require('express');
const router = express.Router();
const profileController = require('./profileController');
const profileValidation = require('./profileValidation');
const { handleValidationErrors, validateFileNameHeader } = require('../../../common/util');
const { authorizeUpdateProfile, authorizeUpdateProfileImage } = require('./profileAuthorization');
const { notAllowed } = require('../../../common/errorMiddleware');

router.route('/finish-profile')
    .post(
        profileValidation.validateUserProfile,
        handleValidationErrors,
        authorizeUpdateProfile,
        profileController.finishProfile
    )
    .all(notAllowed);

router.route('/')
    .put(
        profileValidation.validateUserProfile,
        handleValidationErrors,
        authorizeUpdateProfile,
        profileController.updateProfile
    )
    .all(notAllowed);

router.route('/:seekerId')
    .get(
        profileValidation.validateGetUser,
        handleValidationErrors,
        profileController.getProfile
    )
    .all(notAllowed);

router.route('/:seekerId/image')
    .get(
        profileValidation.validateGetUser,
        handleValidationErrors,
        profileController.getProfileImage
    )
    .post(
        profileValidation.validateGetUser,
        validateFileNameHeader(),
        handleValidationErrors,
        authorizeUpdateProfileImage,
        profileController.uploadProfileImage
    )
    .all(notAllowed);

module.exports = router;