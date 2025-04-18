const { body, param } = require('express-validator');



const skillsValidation = () => body('skills')
    .custom((skills) => {
        const skillIds = skills.map(skill => skill.skillId);
        const hasDuplicates = new Set(skillIds).size !== skillIds.length;
        if (hasDuplicates) {
            throw new Error('Skill IDs must be unique');
        }
        return true;
    })
    .isArray().withMessage('Phases must be an array');

const skillIdValidation = () => body('skills.*.skillId')
    .exists().withMessage('Skill ID is required')
    .isInt({ min: 1, allow_leading_zeroes: false }).withMessage('Skill ID must be an integer greater than 0')
    .toInt()

const skillIdParamValidation = () => param('id')
    .isInt({ min: 1, allow_leading_zeroes: false }).withMessage('Skill ID must be an integer greater than 0')
    .toInt()



const skills = [
    skillsValidation(),
    skillIdValidation(),
]
    
module.exports = {
    skills,
    skillIdParamValidation
}