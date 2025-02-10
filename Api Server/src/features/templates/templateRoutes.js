const express = require('express');
const { authCreateTemplate, authUpdateTemplate, authDeleteTemplate, authGetTemplate,authGetAllTemplates } = require('./templateAuthorization');
const templateValidation = require('./templateValidation');
const templatesController = require('./templateController');
const handleValidationErrors = require('../../common/util').handleValidationErrors;

const router = express.Router();

router.get('', authGetAllTemplates, templatesController.getAllTemplates);
router.get('/template-details/:id', templateValidation.validateId,handleValidationErrors,authGetTemplate, templatesController.getTemplateDetails);
router.post('', templateValidation.validateTemplate,handleValidationErrors,authCreateTemplate, templatesController.addTemplate);
router.put('/:id', templateValidation.validateTemplate,handleValidationErrors,authUpdateTemplate, templatesController.editTemplate);
router.delete('/:id',templateValidation.validateId,handleValidationErrors, authDeleteTemplate, templatesController.deleteTemplate);

module.exports = router;