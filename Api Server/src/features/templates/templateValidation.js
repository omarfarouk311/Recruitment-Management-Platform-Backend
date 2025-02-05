const { body } = require('express-validator');

// Helper function to validate placeholders
function validatePlaceholders(value) {
    const placeholderPattern = /\{\{([^{}]+)\}\}/g; // Matches {{placeholder}}
    const placeholders = value.match(placeholderPattern);

    if (!placeholders || placeholders.length === 0) {
        throw new Error('Description must include at least one placeholder enclosed in {{}}');
    }

    for (const placeholder of placeholders) {
        const content = placeholder.slice(2, -2).trim(); // Extract content inside {{ }}
        if (!/^[a-zA-Z\s]+$/.test(content)) {
            throw new Error(`Placeholder ${placeholder} must contain only alphabetical characters`);
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
    .custom(validatePlaceholders);

exports.validateTemplate = [
    name,
    description
];

exports.extractPlaceholders = extractPlaceholders;