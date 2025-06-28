const { query } = require('express');
const { check, body,validationResult } = require('express-validator');




const validateName=()=>{
    return  body('name').not().isEmpty().withMessage('Name is required').bail().isLength({min:3})
            .withMessage('Name must be at least 3 characters').bail()
            .isLength({max:50}).withMessage('Name must be at most 50 characters')
}
const validateAssessmentTime=()=>{
    return body('assessmentTime').not().isEmpty().withMessage('Assessment Time is required').bail()
    .isInt().toInt().withMessage('Assessment Time must be a number')
}
const validateJobTitle=()=>{
    return body('jobTitle').not().isEmpty().withMessage('Job Title is required').bail().isLength({min:2}).withMessage('Job Title must be at least 2 characters')
    .bail().isLength({max:50}).withMessage('Job Title must be at most 50 characters')
}

const validateMetaData=()=>{
    return body('metaData[*].questions').not().isEmpty().withMessage('Questions are required').bail(),
    body('metaData[*].answers').isArray().withMessage('Answers must be array').bail().custom((value) => value.length > 0).withMessage('Answers cannot be empty'),
    body('metaData[*].correctAnswers').isArray().withMessage('Correct Answers must be array').custom((value) => value.length > 0).withMessage('Correct Answers cannot be empty')
}

const validateQuestions = () => body('metaData')
    .isArray({ min: 1 })
    .withMessage(`Assessment must contain at least 1 question`);

const validateId=(parm)=>{
   
    return check(parm).not().isEmpty().withMessage('id has to passed in req').
    isInt().toInt()
}

module.exports.assessmentParamsValidation=[
    validateId('id')
]

module.exports.jobParamsValidation=[
    validateId('jobId')
]
module.exports.seekerParamsValidation=[
    validateId('jobSeekerId')
]


module.exports.assessmentBodyValidation=[
    validateName(),
    validateAssessmentTime(),
    validateJobTitle(),
    validateMetaData(),
    validateQuestions()
]


