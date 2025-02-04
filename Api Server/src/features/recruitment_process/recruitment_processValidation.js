const { check, validationResult, body, query } = require('express-validator');


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
        .bail()
        .isInt({ min: 1 }).withMessage('process id must be a numeric value greater than 0')
        .toInt();
}

const validateProcessName = () => {
    return body('processName')
        .exists().withMessage('Process name is required')
        .bail()
        .isString().withMessage('Process name must be a string')
        .isLength({ min: 4, max: 50 }).withMessage('Process name must be between 4 and 50 characters');
};

const validateRecruitmentProcessBody = () => {
    return body('phases')
        .isArray().withMessage('Phases must be an array');
};

const validateRecruitmentProcessPhaseNumber = () => {
    return body('phases.*.phaseNumber')
        .exists().withMessage('Phase number is required')
        .bail()
        .isInt({ min: 1 }).withMessage('Phase number must be an integer greater than 0')
        .toInt();
};

const validateRecruitmentProcessPhaseName = () => {
    return body('phases.*.phaseName')
        .exists().withMessage('Phase name is required')
        .bail()
        .isString().withMessage('Phase name must be a string')
        .isLength({ min: 4, max: 50 }).withMessage('Phase name must be a string with length between 4 and 50');
};

const validateRecruitmentProcessPhaseType = () => {
    return body('phases.*.phaseType')
        .exists().withMessage('Phase type is required')
        .bail()
        .isInt({ min: 1 }).withMessage('Phase type must be an integer greater than 0')
        .toInt();
};

const validateRecruitmentProcessDeadline = () => {
    return body('phases.*.deadline')
        .optional()
        .isInt({ min: 1, max: 20 }).withMessage('Deadline must be an integer between 1 and 20')
        .toInt();
};

const validateRecruitmentProcessAssessmentId = () => {
    return body('phases.*.assessmentId')
        .optional()
        .isInt({ min: 1 }).withMessage('Assessment ID must be an integer greater than 0')
        .toInt();
};



const pagination = () => {
    return [
        query('page')
            .optional()  
            .isInt({ min: 1 }).withMessage('Page number must be a positive integer')
            .toInt() 
            .custom((value, { req }) => {
                if (value === undefined) {
                    req.query.page = 1;
                }
                return true;
            }),
    ];
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

const validatePagination = [
    pagination()
];

const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log("Error in handleValidationErrors in recruitment validation file with error msg", errors.array());
        const error = new Error("Error in recruitment process validation input");
        error.status = 400;
        error.msg = errors.array();
        // return next(error);
        return res.status(status).json({ message: error.msg });
    }
    next();
}


module.exports = {
    handleValidationErrors,
    validateRecruitmentProcessData,
    validateRecruitmentProcessId,
    validatePagination
}