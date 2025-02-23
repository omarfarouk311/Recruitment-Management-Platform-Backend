const express = require('express');
const router = express.Router();
const profileController = require('./profileController');
const profileValidation = require('./profileValidation');
const { handleValidationErrors } = require('../../../common/util');
const { authorizeUpdateProfile } = require('./profileAuthorization');

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

module.exports = router;