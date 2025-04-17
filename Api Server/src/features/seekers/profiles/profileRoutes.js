const express = require('express');
const router = express.Router();
const profileController = require('./profileController');
const profileValidation = require('./profileValidation');
const { handleValidationErrors } = require('../../../common/util');
const { authorizeUpdateProfile, authorizeUpdateProfileImage } = require('./profileAuthorization');
const { notAllowed } = require('../../../common/errorMiddleware');

router.route('/finish-profile')
    .post(
        profileValidation.validateUserProfile,
        handleValidationErrors,
        authorizeUpdateProfile,
        profileController.insertProfile
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

router.route('/:userId')
    .get(
        profileValidation.validateGetUser,
        handleValidationErrors,
        profileController.getProfile
    )
    .all(notAllowed);

router.route('/:seekerId/image')
    .get(
        profileValidation.validateGetUser,
        profileController.getProfileImage
    )
    .post(
        profileValidation.validateGetUser,
        authorizeUpdateProfileImage,
        profileController.uploadProfileImage
    )
    .all(notAllowed);

module.exports = router;