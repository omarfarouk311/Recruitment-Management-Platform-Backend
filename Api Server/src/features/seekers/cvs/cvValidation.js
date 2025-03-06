const { query } = require('express-validator');


const jobIdValidation = () => query('jobId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('job id parameter value must be an integer')
    .toInt();


const seekerIdValidation = () => query('seekerId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('seeker id parameter value must be an integer')
    .toInt();

const cvIdValidation = () => query('cvId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('cv id parameter value must be an integer')
    .toInt();



module.exports = {
    jobIdValidation,
    seekerIdValidation,
    cvIdValidation
}
