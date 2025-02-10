const { check, body, query } = require("express-validator");
const constants = require("../../../config/config");
const {validatePage} = require('../../common/util');

const sortBy = query("sortBy", "invalid sortBy query parameter")
    .optional()
    .isInt()
    .custom((value, { req }) => {
        return value == 1 || value == -1;
    }, "Invalid value for sortBy").toInt();

const simplified = query("simplified", "invalid simplified query parameter")
    .optional()
    .isBoolean()
    .withMessage("Value for simplified must be 0 or 1").toBoolean();

const jobTitle = query("jobTitle", "invalid jobTitle query parameter")
    .optional()
    .isString()
    .isAlphanumeric()
    .withMessage("Value for jobTitle must be alphanumeric");

const phaseType = query("phaseType", "invalid phaseType query parameter")
    .optional()
    .isInt({ min: 1 }).toInt();

const candidateLocation = query("candidateLocation", "invalid candidateLocation query parameter")
    .optional()
    .isAlpha()
    .withMessage("candidateLocation must be alphabetic");

exports.getCandidatesForRecruiterValidator = [
    sortBy,
    simplified,
    jobTitle,
    phaseType,
    candidateLocation,
    validatePage()
];

const status = query("status", "Invalid status query parameter")
    .optional()
    .isInt({ min: constants.candidate_status_pending, max: constants.candidate_status_rejected })
    .withMessage(`Value for status must be between ${constants.candidate_status_pending} and ${constants.candidate_status_rejected}`).toInt();

exports.getCandidatesForJobValidator = [
    sortBy,
    phaseType,
    candidateLocation,
    status,
    validatePage()
]


const candidates = body("candidates", "Invalid candidates property")
    .isArray({ min: 1 })
    .custom((value, { req }) => {
        return value.every((candidate) => typeof candidate === "number");
    }).withMessage("candidates must be an array of numbers");

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