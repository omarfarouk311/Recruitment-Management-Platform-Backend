const { query } = require('express-validator');
const { validatePage } = require('../../common/util');
const { maxNameLength } = require('../../../config/config');

const validatePerformedBy = () => query('performedBy')
    .optional()
    .isString()
    .withMessage('performedBy parameter must be a string')
    .trim()
    .isLength({ max: maxNameLength })
    .withMessage(`performedBy parameter can't exceed ${maxNameLength}`);

const validateAction = () => query('action')
    .optional()
    .isString()
    .withMessage('action parameter must be a string')
    .trim()
    .isInt()
    .withMessage('action parameter must be a number')
    .toInt();

const validateFromDate = () => query('fromDate')
    .optional()
    .isString()
    .withMessage('fromDate parameter must be a string')
    .trim()
    .isISO8601()
    .withMessage('Invalid date format, it must be in ISO 8601 format')
    .custom((value, { req: { query } }) => query.toDate !== undefined)
    .withMessage('toDate parameter must be passed with fromDate parameter')
    .customSanitizer(isoString => new Date(isoString));

const validateToDate = () => query('toDate')
    .optional()
    .isString()
    .withMessage('toDate parameter must be a string')
    .trim()
    .isISO8601()
    .withMessage('Invalid date format, it must be in ISO 8601 format')
    .custom((value, { req: { query } }) => query.fromDate !== undefined)
    .withMessage('fromDate parameter must be passed with toDate parameter')
    .customSanitizer(isoString => new Date(isoString));

exports.validateGetLogs =
    [
        validatePage(),
        validatePerformedBy(),
        validateAction(),
        validateFromDate(),
        validateToDate()
    ];