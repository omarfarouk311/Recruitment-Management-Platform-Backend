
const {validatePage}=require('../../common/util')
const {body,query,param}=require('express-validator')



const validateName=()=>{
    return query('name').optional().isAlphanumeric().withMessage('Name query parameter should be between [a-z]/[A-Z]/[0-9]')
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



const validateEmail=()=>{
    return body('email').notEmpty().withMessage('Email is required').bail().isEmail().withMessage('Email is not valid')
}

const validateDepartmentInvitation=()=>{
    return body('department').notEmpty().withMessage('department is required in req body')
}

const validateDate=()=>{
    return body('deadline').notEmpty().withMessage('deadline is required in req body').isDate().withMessage('deadline should be valid date')
}

const validateJobTitle=()=>{
    return query('jobTitle').optional().isAlphanumeric().withMessage('jobTitle query parameter should be between [a-z]/[A-Z]/[0-9]')
}


module.exports.validateJobOffer=[
    validateJobTitle(),
    validateSorted(),
    validatePage(),
]


module.exports.validateInvitationData=[
    validateEmail(),
    validateDepartmentInvitation(),
    validateDate()
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



