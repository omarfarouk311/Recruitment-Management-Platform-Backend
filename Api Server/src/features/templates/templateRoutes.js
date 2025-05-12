const express = require('express');
const templateAuth = require('./templateAuthorization');
const templateValidation = require('./templateValidation');
const templatesController = require('./templateController');
const handleValidationErrors = require('../../common/util').handleValidationErrors;

const router = express.Router();

router.get('', 
    templateValidation.validateGetAllTemplates, 
    handleValidationErrors, 
    templatesController.getAllTemplates
);


router.get('/template-details/:id', 
    templateValidation.validateGetTemplate,
    handleValidationErrors,
    templateAuth.authGetTemplate, 
    templatesController.getTemplateDetails
);


router.post('', templateValidation.validateTemplate,handleValidationErrors, templateAuth.authCreateTemplate, templatesController.addTemplate);
router.put('/:id', templateValidation.validateTemplate,handleValidationErrors, templateAuth.authUpdateTemplate, templatesController.editTemplate);
router.delete('/:id',templateValidation.validateId,handleValidationErrors, templateAuth.authDeleteTemplate, templatesController.deleteTemplate);

router.get('/offer-details/job/:jobId/seeker/:seekerId', 
    templateValidation.validateGetOfferDetails, 
    handleValidationErrors, 
    templateAuth.authOfferDetails, 
    templatesController.getOfferDetails
);

router.post('/offer-details/job/:jobId/seeker/:seekerId',
    templateValidation.validateOfferDetails,
    handleValidationErrors,
    templateAuth.authOfferDetails,
    templatesController.sendOfferDetails
);

module.exports = router;