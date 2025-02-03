const { check, param, body } = require("express-validator");
const constants = require("../../../config/config");

const sortBy = param("sortBy")
    .optional()
    .isInt()
    .custom((value, { req }) => {
        return value === 1 || value === -1;
    }, "Invalid value for sortBy");

const simplified = param("simplified").optional().isInt({ min: 0, max: 1 });

const job_title = param("job_title").optional().isString().isAlphanumeric();

const phase_type = param("phase_type").optional().isInt({ min: 1 });

const candidate_location = param("candidate_location").optional().isAlpha();

exports.getCandidatesForRecruiterValidator = [
    sortBy,
    simplified,
    job_title,
    phase_type,
    candidate_location
];

const status = param("status").optional().isInt({ min: constants.candidate_status_pending, max: constants.candidate_status_rejected });

exports.getCandidatesForJobValidator = [
    sortBy,
    job_title,
    phase_type,
    candidate_location,
    status
]


const candidates = body("candidates")
    .isArray({ min: 1 })
    .custom((value, { req }) => {
        return value.every((candidate) => typeof candidate === "number");
    });

const recruiter_id = body("recruiter_id").isInt({ min: 1 });

const job_id = body("job_id").isInt({ min: 1 });


exports.assignCandidatesToRecruiterValidator = [
    candidates,
    recruiter_id,
    job_id
];

exports.unassignCandidatesFromRecruiterValidator = [
    candidates,
    job_id
];

const decision = body("decision").isBoolean();

exports.makeDecisionToCandidatesValidator = [
    candidates,
    decision,
    job_id
];