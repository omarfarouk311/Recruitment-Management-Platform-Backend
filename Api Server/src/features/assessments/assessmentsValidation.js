const { check, body,validationResult } = require('express-validator');


const checkResults=(req,res,next)=>{
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
    .isLength({max:50}).withMessage('Name must be at most 50 characters'),

    body('assessmentTime').not().isEmpty().withMessage('Assessment Time is required')
    .isInt().withMessage('Assessment Time must be a number'),

    body('jobTitle').not().isEmpty().withMessage('Job Title is required').isLength({min:2}).withMessage('Job Title must be at least 2 characters')
    .isLength({max:50}).withMessage('Job Title must be at most 50 characters'),

    body('metaData[*].questions').not().isEmpty().withMessage('Questions are required'),
    body('metaData,[*].answers').isArray().withMessage('Answers must be array').custom((value) => value.length > 0).withMessage('Answers cannot be empty'),
    body('metaData[*].correctAnswers').isArray().withMessage('Correct Answers must be array').custom((value) => value.length > 0).withMessage('Correct Answers cannot be empty'),

    checkResults
]

