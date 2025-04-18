const express = require('express');
const router = express.Router();
const controller = require('./skillsController');
const { notAllowed } = require('../../../common/errorMiddleware');
const skillValidation = require('./skillsValidation');
const { handleValidationErrors } = require('../../../common/util');
const { seekerSkillAuthorization } = require('./skillsAuthorization')


// Todo: add authentication
router.route('/')
    .get(controller.getSeekerSkillsById)
    .post(seekerSkillAuthorization, skillValidation.skills, handleValidationErrors, controller.addSeekerSkills)
    .all(notAllowed)

router.route('/:id')
    .delete(seekerSkillAuthorization, skillValidation.skillIdParamValidation(), handleValidationErrors, controller.deleteSeekerSkillById)
    .all(notAllowed)

module.exports = router