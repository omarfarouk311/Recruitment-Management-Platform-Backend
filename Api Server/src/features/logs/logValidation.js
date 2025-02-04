const { query } = require('express-validator');
const { validatePage } = require('../../common/util');
const { maxNameLength } = require('../../../config/config');

const validatePerformedBy = () => query('performedBy')
    .optional()
    .trim()
    .isLength({ max: maxNameLength })
    .withMessage(`Performer name can't exceed ${maxNameLength}`);

const validateAction = () => query('action')
    .optional()
    .trim()
    .isInt()
    .withMessage('Action must be an integer')
    .toInt();

const validateDate = () => query('date')
    .optional()
    .trim()
    .isISO8601()
    .withMessage('Invalid date format, it must be in ISO 8601 format')
    .customSanitizer(isoString => new Date(isoString));

exports.validateGetLogs = [validatePage(), validatePerformedBy(), validateAction(), validateDate()];
