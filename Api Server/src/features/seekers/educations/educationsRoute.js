const express = require('express');
const router = express();
const educationController = require('./educationsController')
const { validateEducation, validateSeekerId, validateEducationId } = require('./educationsValidation')
const { handleValidationErrors } = require('../../../common/util')
const { authUpdateEducation, authDeleteEducation } = require('./educationsAuthorization')
const { authorizeAccess } = require('../jobs_applied_for/jobsAppliedForAuthorization');

router.post('/add',
    validateEducation,
    handleValidationErrors,
    authorizeAccess,
    educationController.addEducationController
)

router.get('/:seekerId',
    validateSeekerId,
    handleValidationErrors,
    educationController.getEducationController
)

router.delete('/:educationId',
    validateEducationId,
    handleValidationErrors,
    authDeleteEducation,
    educationController.deleteEducationController
)

router.patch('/:educationId',
    validateEducationId,
    validateEducation,
    handleValidationErrors,
    authUpdateEducation,
    educationController.editEducationController
)

module.exports = router;