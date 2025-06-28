const { check, body, query } = require("express-validator");
const constants = require("../../../config/config");
const {validatePage} = require('../../common/util');

const sortBy = query("sortBy", "invalid sortBy query parameter")
    .optional()
    .isInt()
    .custom((value, { req }) => {
        return value == 1 || value == -1;
    }, "Invalid value for sortBy").toInt();


const sortByAssessmentScore = query("sortByAssessmentScore", "invalid sortByAssessmentScore query parameter")
                                .optional()
                                .isInt([-1, 1])
                                .withMessage("Value for sortByAssessmentScore must be -1 or 1").toInt();

const sortByRecommendation = query("sortByRecommendation", "invalid sortByRecommendation query parameter")
                                .optional()
                                .isInt([-1, 1])
                                .withMessage("Value for sortByRecommendation must be -1 or 1").toInt();

const simplified = query("simplified", "invalid simplified query parameter")
    .optional()
    .isBoolean()
    .withMessage("Value for simplified must be 0 or 1").toBoolean();

const jobTitle = query("jobTitle", "invalid jobTitle query parameter")
    .optional()
    .isString()
    .withMessage("Value for jobTitle must be alphanumeric");

const phaseType = query("phaseType", "invalid phaseType query parameter")
    .optional()
    .isInt({ min: 1 }).toInt();

const country = query("Country", "invalid Country query parameter")
    .optional()
    .isAlpha()
    .withMessage("Country must be alphabetic");

const city = query("City", "invalid City query parameter")
    .optional()
    .isAlpha()
    .withMessage("City must be alphabetic");

const recruiterIdForCompany = query("recruiterId", "Invalid recruiterId").optional().isInt({ min: 1 }).toInt().custom((value, {req}) => {
    if (req.userRole === constants.role.company && !value) {
        throw new Error("recruiterId is required");
    }
    return true;
});

exports.getCandidatesForRecruiterValidator = [
    sortBy,
    simplified,
    jobTitle,
    phaseType,
    country,
    validatePage(),
    recruiterIdForCompany
];

const status = query("status", "Invalid status query parameter")
    .optional()
    .isInt({ min: constants.candidate_status_pending, max: constants.candidate_status_rejected })
    .withMessage(`Value for status must be between ${constants.candidate_status_pending} and ${constants.candidate_status_rejected}`).toInt();

exports.getCandidatesForJobValidator = [
    sortByAssessmentScore,
    sortByRecommendation,
    phaseType,
    country,
    status,
    validatePage()
]


const candidates = body("candidates", "Invalid candidates property")
    .isArray({ min: 1 })
    .custom((value, { req }) => {
        return value.every((candidate) => typeof candidate === "number" && candidate > 0 && candidate <= 99999999);
    }).withMessage("candidates must be an array of numbers between 1 and 99999999");

const recruiterId = check("recruiterId", "Invalid recruiterId").isInt({ min: 1 });

const jobId = check("jobId", "jobId must be positive integer.").isInt({ min: 1 }).toInt();

const jobIdQuery = query("jobId", "jobId must be positive integer.").optional().isInt({ min: 1 }).toInt();


exports.assignCandidatesToRecruiterValidator = [
    candidates,
    recruiterId,
    jobId
];

exports.unassignCandidatesFromRecruiterValidator = [
    candidates,
    jobId
];

const decision = body("decision", "Invalid decision property").isBoolean().toBoolean();

exports.makeDecisionToCandidatesValidator = [
    candidates,
    decision,
    jobId
];

exports.getCandidateLocationsValidator = [
    jobIdQuery
];