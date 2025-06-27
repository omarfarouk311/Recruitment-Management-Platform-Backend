const { Router } = require('express');
const experienceController = require('./experienceController');
const experienceValidation = require('./experienceValidation');
const experienceAuth = require('./experienceAuthorization.js');
const { handleValidationErrors } = require('../../../common/util');
const { authorizeAccess } = require('../jobs_applied_for/jobsAppliedForAuthorization.js');
const router = Router();

router.get(
    '/:userId',
    experienceValidation.validateUserId,
    handleValidationErrors,
    experienceController.getAllExperiences
);

router.post(
    '/',
    experienceValidation.addExperienceValidator,
    handleValidationErrors,
    authorizeAccess,
    experienceController.addExperience
);

router.put(
    '/:experienceId',
    experienceValidation.updateExperienceValidator,
    handleValidationErrors,
    experienceAuth.authUpdateExperience,
    experienceController.updateExperience
);

router.delete(
    '/:experienceId',
    experienceValidation.validateExperienceId,
    handleValidationErrors,
    experienceAuth.authDeleteExperience,
    experienceController.deleteExperience
);

module.exports = router;