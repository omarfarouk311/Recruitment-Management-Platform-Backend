
const {validatePage}=require('../../common/util')
const {body,query,param}=require('express-validator')



const validateName=()=>{
    return query('name').optional().isAlphanumeric().withMessage('Name query parameter should be between [a-z]/[A-Z]/[0-9]')
}

const validateSorted=()=>{
    return query('sorted').optional().isInt().isIn(['1','2']).toInt().withMessage('sorted query paraemeter should be 1 or 2')
}

const validateDepartment=()=>{
    return query('department').optional().isAlphanumeric().withMessage('department query parameter should be between [a-z]/[A-Z]/[0-9]')
}

const validateId=()=>{
    return param('recruiterId').isInt().withMessage('recruiterId query parameter have to be integer').toInt()
}


module.exports.validateRecruiterId=[
  validateId()
]


module.exports.validateParams=[
    validateName(),
    validateSorted(),
    validateDepartment(),
    validatePage(),
]


