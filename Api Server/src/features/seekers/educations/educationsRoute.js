
const express = require('express');
const router=express();

const educationController=require('./educationsController')
const {validateEducation,validatSeekerId,validateEducationId}=require('./educationsValidation')
const {handleValidationErrors}=require('../../../common/util')
const {authorizeSeeker}=require('./educationsAuthorization')





router.post('/add',
    validateEducation,
    handleValidationErrors,
    authorizeSeeker,
    educationController.addEducationController)

router.get('/:seekerId',
    validatSeekerId,
    handleValidationErrors,
    educationController.getEducationController)

router.delete('/:educationId',
    validateEducationId,
    handleValidationErrors,
    authorizeSeeker,
    educationController.deleteEducationController
)

router.patch('/:educationId',
        validateEducation,
        handleValidationErrors,
        authorizeSeeker,
        educationController.editEducationController)




module.exports=router