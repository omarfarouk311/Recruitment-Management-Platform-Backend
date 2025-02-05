const express = require('express');
const { authCreateTemplate, authUpdateTemplate, authDeleteTemplate, authGetTemplate } = require('./templateAuthorization');
const templatesController = require('./templateController');

const router = express.Router();

router.get('/templates/:companyId', authGetTemplate, templatesController.getTemplateDetails);
router.post('/templates', authCreateTemplate, templatesController.addTemplate);
router.put('/templates/:id', authUpdateTemplate, templatesController.editTemplate);
router.delete('/templates/:id', authDeleteTemplate, templatesController.deleteTemplate);

module.exports = router;