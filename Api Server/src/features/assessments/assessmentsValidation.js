const { check, body,validationResult } = require('express-validator');


const checkResults=async(req,res,next)=>{
    const errors=validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({
            success: false,
            errors: errors.array()
        })
    }
    next();
}

module.exports.assessmentBodyValidation=[
    body('name').not().isEmpty().withMessage('Name is required').isLength({min:3}).withMessage('Name must be at least 3 characters')
    .isLength({max:10}).withMessage('Name must be at most 10 characters'),

    body('assessmentTime').not().isEmpty().withMessage('Assessment Time is required')
    .isNumeric().withMessage('Assessment Time must be a number'),

    body('jobTitle').not().isEmpty().withMessage('Job Title is required').isLength({min:3}).withMessage('Job Title must be at least 3 characters')
    .isLength({max:10}).withMessage('Job Title must be at most 10 characters'),

    body('metaData,*.questions').not().isEmpty().withMessage('Questions are required'),
    body('metaData,*.answers').isArray().withMessage('Answers must be array').not().isEmpty().withMessage('Answers are required'),
    body('metaData,*.correctAnswers').isArray().withMessage('Correct Answers must be array').not().isEmpty().withMessage('Correct Answers are required'),

    checkResults()
]

