const { check, body, query } = require('express-validator');
const { validatePage } = require('../../common/util');
const {phase_types_numbers} = require('../../../config/config')

module.exports.validateCompanyId = (req, res, next) => {
    try {
        if (!req.id || req.id < 1) {
            const error = new Error('Company id is required to get recruitment process');
            error.statusCode = 400;
            throw error;
        }
        next();
    } catch (error) {
        console.log("Error in validateCompanyId in recruitment validation file with error msg", error);
        next(error);
    }
}

const validateProcessId = () => {
    return check('processId')
        .exists().withMessage('process id is required')
        .isInt().withMessage('process id must be a numeric value greater than 0')
        .toInt()
        .custom(value => {
            if (value < 1) {
                throw new Error('process id must be greater than 0');
            }
            return true;
        }
        );
}

const validateProcessName = () => {
    return body('processName')
        .exists().withMessage('Process name is required')
        .bail()
        .trim()
        .isString().withMessage('Process name must be a string')
        .isLength({ min: 4, max: 50 }).withMessage('Process name must be between 4 and 50 characters');
};

const validateRecruitmentProcessBody = () => {
    return body('phases')
        .isArray().withMessage('Phases must be an array').custom((value, {req}) => {
            if(value[value.length - 1].phaseType !== phase_types_numbers.job_offer)
                throw new Error("Last phase must be job offer")
            if(value.filter(val => val.phaseType === phase_types_numbers.job_offer).length > 1)
                throw new Error("There can be only one job offer phase")
            return true;
        });
};

const validateRecruitmentProcessPhaseNumber = () => {
    return body('phases.*.phaseNumber')
        .exists().withMessage('Phase number is required')
        .isInt().withMessage('Phase number must be an integer greater than 0')
        .toInt()
        .custom(value => {
            if (value < 1) {
                throw new Error('Phase number must be greater than 0');
            }
            return true;
        });
};

const validateRecruitmentProcessPhaseName = () => {
    return body('phases.*.phaseName')
        .exists().withMessage('Phase name is required')
        .trim()
        .isString().withMessage('Phase name must be a string')
        .isLength({ min: 4, max: 50 }).withMessage('Phase name must be a string with length between 4 and 50');
};

const validateRecruitmentProcessPhaseType = () => {
    return body('phases.*.phaseType')
        .exists().withMessage('Phase type is required')
        .isInt().withMessage('Phase type must be an integer greater than 0')
        .toInt()
        .custom(value => {
            if (value < 1 ) {
                throw new Error('Phase type must be between > 0');
            }
            return true;
        })
};

const validateRecruitmentProcessDeadline = () => {
    return body('phases.*.deadline')
        .optional()
        .isInt().withMessage('Deadline must be an integer')
        .toInt()
        .custom(value => {
            if (value < 1 || value > 20) {
                throw new Error('Deadline must be between 1 and 20');
            }
            return true;
        });
};

const validateRecruitmentProcessAssessmentId = () => {
    return body('phases.*.assessmentId')
        .optional()
        .isInt().withMessage('Assessment ID must be an integer greater than 0')
        .toInt()
        .custom(value => {
            if (value < 1) {
                throw new Error('Assessment ID must be greater than 0');
            }
            return true
        });
};


const validateRecruitmentProcessId = [
    validateProcessId() 
];

const validateRecruitmentProcessData = [
    validateProcessName(),
    validateRecruitmentProcessBody(),
    validateRecruitmentProcessPhaseNumber(),
    validateRecruitmentProcessPhaseName(),
    validateRecruitmentProcessPhaseType(),
    validateRecruitmentProcessDeadline(),
    validateRecruitmentProcessAssessmentId()
];


const paginationValidation = [
    validatePage(),
    query('limit')
        .optional()
        .isInt().withMessage('Limit must be an integer')
        .toInt()
        .custom(value => {
            if (value < 1) {
                throw new Error('Limit must be greater than 0');
            }
            return true;
        })
];

module.exports = {
    validateRecruitmentProcessData,
    validateRecruitmentProcessId,
    paginationValidation
}