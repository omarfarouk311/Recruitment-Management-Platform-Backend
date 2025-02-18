const { query, body } = require('express-validator');
const { validatePage } = require('../../common/util');
const { validateCompanyId } = require('../companies/companyValidation');
const { minNameLength, maxNameLength } = require('../../../config/config');

const validateSortByDate = () => query('sortByDate', "Invalid sort option, it must be 1 or -1")
    .optional()
    .trim()
    .isInt()
    .toInt()
    .custom(value => value === 1 || value === -1);

const validateSortByDeadline = () => query('sortByDeadline')
    .optional()
    .trim()
    .isInt()
    .toInt()
    .custom(value => value === 1 || value === -1)
    .withMessage("Invalid sort option, it must be 1 or -1")
    .custom((value, { req: { query } }) => query.sortByDate === undefined)
    .withMessage('Sorting is only allowed by one option at a time');

const validateStatus = () => query('status')
    .optional()
    .trim()
    .custom(value => value === 'pending' || value === 'accepted' || value === 'rejected')
    .withMessage('Invalid status, is must be pending, accepted, or rejected')
    .customSanitizer(value => {
        if (value === 'pending') return 2;
        else if (value === 'accepted') return 1;
        else return 0;
    });

const validateEmail = () => body('recruiterEmail')
    .isEmail()
    .withMessage('invalid email format')
    .isLength({ max: 50 })
    .withMessage("Email length can't exceed 50")

const validateDepartment = () => body('department')
    .isString()
    .withMessage('department must be a string')
    .isLength({ min: minNameLength, max: maxNameLength })
    .withMessage(`department length must be between ${minNameLength} and ${maxNameLength}`);

const validateDeadline = () => body('deadline')
    .isISO8601()
    .withMessage('Invalid date format, it must be in ISO 8601 format')
    .customSanitizer(isoString => new Date(isoString))
    .custom(value => value > new Date())
    .withMessage('deadline must be after the current time');

const validateReply = () => body('status')
    .custom(value => value === 1 || value === 0)
    .withMessage('status must be 1 for accept or 0 for reject')

const validateDate = () => body('date')
    .isISO8601()
    .withMessage('Invalid date format, it must be in ISO 8601 format')
    .customSanitizer(isoString => new Date(isoString))

exports.validateGetInvitations = [validatePage(), validateStatus(), validateSortByDeadline(), validateSortByDate()];

exports.validateCreateInvitation = [validateEmail(), validateDepartment(), validateDeadline()];

exports.validateReplyToInvitation = [validateCompanyId, validateReply(), validateDate()];
