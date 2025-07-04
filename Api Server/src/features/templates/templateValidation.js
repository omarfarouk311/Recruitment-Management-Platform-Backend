const { body, param, query } = require('express-validator');
const { HelperQuerySet } = require('./templateModel');

// Helper function to validate placeholders
function validatePlaceholders(value) {
    const placeholderPattern = /\{\{([^{}]+)\}\}/g; // Matches {{placeholder}}
    const placeholders = value.match(placeholderPattern);


    if(placeholders && placeholders.length > 0) {
        for (const placeholder of placeholders) {
            const content = placeholder.slice(2, -2).trim(); // Extract content inside {{ }}

            if (!/^[a-zA-Z\s_]+$/.test(content)) {
                throw new Error(`Placeholder {{${content}}} must contain only alphabetical characters and underscores`);
            }
        }
    } 

    return true;
}

const pageAndSimplified = query('page').custom((value, { req }) => {
    if (!value && !req.query.simplified) {
        throw new Error('Page query parameter is required when simplified is not provided');
    }
    return true;
});

const name = body('name')
    .exists({ checkFalsy: true })
    .withMessage('Name is required')
    .isString()
    .withMessage('Name must be a string')
    .isLength({ min: 3, max: 50 })
    .withMessage('Name must be between 3 and 50 characters');

const description = body('description')
    .exists({ checkFalsy: true })
    .withMessage('Description is required')
    .isString()
    .withMessage('Description must be a string')
    .custom(validatePlaceholders,"PlaceHolder must be alphatbetic");


// Validation for ID
const id = param('id')
    .exists({ checkFalsy: true })
    .withMessage('ID is required')
    .isInt({ gt: 0 })
    .withMessage('ID must be a positive integer');

const sortBy = query('sortBy')
    .optional()
    .isInt()
    .toInt()
    .isIn([1, -1]).withMessage('SortBy must be 1 or -1');

const simplified = query('simplified')
    .optional()
    .isBoolean()
    .withMessage('Simplified must be a boolean')

const page = query('page')
    .optional()
    .isInt({ gt: 0 })
    .withMessage('Page must be a positive integer');


const jobId = param('jobId')
    .exists({ checkFalsy: true })
    .withMessage('Job ID is required')
    .isInt({ gt: 0 })
    .withMessage('Job ID must be a positive integer');

const seekerId = param('seekerId')
    .exists({ checkFalsy: true })
    .withMessage('Seeker ID is required')
    .isInt({ gt: 0 })
    .withMessage('Seeker ID must be a positive integer');


const placeholders = body('placeholders')
    .exists({ checkFalsy: true })
    .withMessage('Placeholders is required')
    .isObject()
    .withMessage('Placeholders must be a JSON object')
    .custom(async (value, { req }) => {
        const templateId = req.body.templateId;
        if (!templateId) {
            throw new Error('Template ID is required to validate placeholders');
        }
        try {
            var jobOfferParams = await HelperQuerySet.getJobOfferPlaceholders(templateId);
        } catch(error) {
            if(error.status) { 
                throw error;
            }
            console.log(`error in template vlaidation`, error)
            throw new Error(`internal server error`);
        }
    
        const missingKeys = jobOfferParams.filter(param => !Object.keys(value).includes(param));
        if (missingKeys.length > 0) {
            throw new Error(`Missing placeholders: ${missingKeys.join(', ')}`);
        }

        const extraKeys = Object.keys(value).filter(key => !jobOfferParams.includes(key));
        if (extraKeys.length > 0) {
            throw new Error(`Extra placeholders: ${extraKeys.join(', ')}`);
        }
        return true;
    });

const templateId = body('templateId')
    .exists({ checkFalsy: true })
    .withMessage('Template ID is required')
    .isInt({ gt: 0 })
    .withMessage('Template ID must be a positive integer');

exports.validateGetAllTemplates = [
    sortBy,
    page,
    pageAndSimplified,
    simplified
];

exports.validateGetTemplate = [
    id,
    simplified
];

exports.validateTemplate = [
    name,
    description
];

exports.validateId = [
    id
];

exports.validateGetOfferDetails = [
    jobId,
    seekerId
];


exports.validateOfferDetails = [
    placeholders,
    jobId,
    seekerId, 
    templateId
]