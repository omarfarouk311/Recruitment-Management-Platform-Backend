let{check,body,param}=require('express-validator')



const validateEducationName=()=>{
    return body('school_name').notEmpty().withMessage('Education name is required')
}
const validateFieldName=()=>{
    return body('field').notEmpty().withMessage('Field of study is required')
}
const validateDegree=()=>{
    return body('degree').notEmpty().withMessage('Degree is required') 
}


module.exports.validateEducationId=[
    param('educationId').notEmpty().withMessage('Education Id is required').bail().isInt().toInt().withMessage("Education Id should be integer")
]
module.exports.validatSeekerId=[
    param('seekerId').notEmpty().withMessage('Seeker Id is required').bail().isInt().toInt().withMessage("seeker Id should be integer")
]
module.exports.validateEducation=[
    validateEducationName(),
    validateFieldName(),
    validateDegree(),
]