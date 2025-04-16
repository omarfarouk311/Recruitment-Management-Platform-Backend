const { check, body, query } = require('express-validator');

const titleVlidation = () => body('jobTitle')
    .exists().withMessage('Title is required')
    .isString().withMessage('Title must be a string')
    .trim()
    .isLength({ min: 4, max: 50 }).withMessage('Title must be between 4 and 50 characters');

const descriptionValidation = () => body('jobDescription')
    .exists().withMessage('Description is required')
    .isString().withMessage('Description must be a string')
    .trim()
    .isLength({ min: 5, max: 500 }).withMessage('Description must be between 10 and 500 characters');

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

const importanceValidation = () => body('skills.*.importance')
    .exists().withMessage('importance number is required')
    .isInt({ min: 1, max: 5 }).withMessage('importance must be an integer greater than 0 and less than 6')
    .toInt()

const processIdValidation = () => body('processId')
    .exists().withMessage('process ID is required')
    .isInt({ min: 1, allow_leading_zeroes: false }).withMessage('process ID must be an integer greater than 0')
    .toInt()

const countryValidation = () => body('country')
    .exists().withMessage('country is required')
    .isString().withMessage('country must be a string')
    .trim()
    .isLength({ min: 3, max: 50 }).withMessage('country must be between 3 and 50 characters');

const cityValidation = () => body('city')
    .exists().withMessage('city is required')
    .isString().withMessage('city must be a string')
    .trim()
    .isLength({ min: 3, max: 50 }).withMessage('city must be between 3 and 50 characters');

const remoteValidation = () => body('remote')
    .exists().withMessage('Must define if the job is remote or not')
    .isBoolean().withMessage('remote must be a boolean')
    .toBoolean();

const industryIdValidation = () => body('industryId')
    .exists().withMessage('industry ID is required')
    .isInt({ min: 1, allow_leading_zeroes: false }).withMessage('industry ID must be an integer greater than 0')
    .toInt();

const appliedCntLimitValidation = () => body('appliedCntLimit')
    .exists().withMessage('There should be a limit on applicants apply for this job')
    .isInt({ min: 1, allow_leading_zeroes: false }).withMessage('Applied cnt limit must be an integer greater than 0')
    .toInt();

const jobsQueryValidate = [
    query('sort')
        .optional()
        .custom((value, { req }) => {
            if (Array.isArray(req.query.sort)) {
                throw new Error('Only one "sort" parameter is allowed');
            }
            return true;
        })
        .isInt({ min: -1, max: 1 }).withMessage('Sort must be -1 (desc) or 1 (asc)')
        .toInt()
        .custom((value) => {
            if (![1, -1].includes(value)) {
                throw new Error('Sort must be -1 (desc) or 1 (asc)');
            }
            return true;
        }),

    query('title')
        .optional()
        .custom((value, { req }) => {
            if (Array.isArray(req.query.title)) {
                throw new Error('Only one "title" parameter is allowed');
            }
            return true;
        })
        .isString().withMessage('Title must be a string')
        .trim()
        .notEmpty().withMessage('Title cannot be empty'),

    query()
        .custom((value, { req }) => {
            const allowedParams = ['sort', 'title'];  
            const invalidParams = Object.keys(req.query).filter(param => !allowedParams.includes(param));

            if (invalidParams.length > 0) {
                throw new Error(`Invalid query parameters`);
            }
            return true;
        })
];


const jobIdValidation = [
    check('id')
        .exists().withMessage('Job ID is required')
        .isInt({ min: 1, allow_leading_zeroes: false }).withMessage('Job ID must be an integer greater than 0')
        .toInt()
]

const newJobValidation = [
    titleVlidation(),
    descriptionValidation(),
    skillsValidation(),
    skillIdValidation(),
    importanceValidation(),
    processIdValidation(),
    countryValidation(),
    cityValidation(),
    remoteValidation(),
    industryIdValidation(),
    appliedCntLimitValidation()
]

module.exports = {
    newJobValidation,
    jobsQueryValidate,
    jobIdValidation
}