const { query } = require('express-validator');
const { validatePage } = require('../../common/util');
const config = require('../../../config/config');

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

exports.validateGetInvitations = [validatePage(), validateStatus(), validateSortByDeadline(), validateSortByDate()];
