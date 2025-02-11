const { body, param, query } = require('express-validator');

// Helper function to validate placeholders
function validatePlaceholders(value) {
    const placeholderPattern = /\{\{([^{}]+)\}\}/g; // Matches {{placeholder}}
    const placeholders = value.match(placeholderPattern);


    for (const placeholder of placeholders) {
        const content = placeholder.slice(2, -2).trim(); // Extract content inside {{ }}

        if (!/^[a-zA-Z\s_]+$/.test(content)) {
            throw new Error(`Placeholder {{${content}}} must contain only alphabetical characters and underscores`);
        }
    }

    return true;
}



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

exports.validateGetAllTemplates = [
    sortBy,
    page,
    simplified
];

exports.validateGetAllTemplate = [
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
