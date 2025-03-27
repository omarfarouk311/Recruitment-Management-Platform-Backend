const express = require('express');
const router = express.Router();
const profileController = require('./profileController');
const profileValidation = require('./profileValidation');
const { handleValidationErrors } = require('../../../common/util');
const { authorizeUpdateProfile, authorizeUpdateProfileImage } = require('./profileAuthorization');
const { notAllowed } = require('../../../common/errorMiddleware');

router.get('/:userId', 
    profileValidation.validateGetUser, 
    handleValidationErrors, 
    profileController.getProfile
);

router.put('/', 
    profileValidation.validateUserProfile, 
    handleValidationErrors, 
    authorizeUpdateProfile,
    profileController.updateProfile
);

router.route('/:seekerId/image')
    .get(
        profileValidation.validateGetUser, 
        profileController.getProfileImage
    )
    .post(
        profileValidation.validateGetUser,
        authorizeUpdateProfileImage,
        profileController.uploadProfileImage
    ).all(notAllowed);

module.exports = router;