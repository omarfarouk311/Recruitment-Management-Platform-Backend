
const {validatePage}=require('../../common/util')
const {body,query,param}=require('express-validator')


const validateBodyName=()=>{
    return body('recruiterName').isString().withMessage('Name should be a string').isLength({min:3,max:50}).withMessage('Name should be between 3 and 50 characters')
}
const validateName=()=>{
    return query('name').optional().isString().withMessage('Name query parameter should be between [a-z]/[A-Z]/[0-9]')
}

const validateSorted=()=>{
    return query('sorted').optional().isInt().isIn(['-1','1']).toInt().withMessage('sorted query paraemeter should be 1 or -1')
}

const validateDepartment=()=>{
    return query('department').optional().isAlphanumeric().withMessage('department query parameter should be between [a-z]/[A-Z]/[0-9]')
}

const validateId=()=>{
    return param('recruiterId').isInt().withMessage('recruiterId query parameter have to be integer').toInt()
}



const validateJobTitle=()=>{
    return query('jobTitle').optional().isAlphanumeric().withMessage('jobTitle query parameter should be between [a-z]/[A-Z]/[0-9]')
}


module.exports.validateJobOffer=[
    validateJobTitle(),
    validateSorted(),
    validatePage(),
]


module.exports.validateRecruiterId=[
    validateId()
]


module.exports.validateParams=[
    validateName(),
    validateSorted(),
    validateDepartment(),
    validatePage(),
]

module.exports.validateRecruiterName= [
    validateBodyName(),
]



