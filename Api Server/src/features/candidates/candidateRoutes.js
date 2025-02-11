const express = require('express');
const router = express.Router();
const candidateController = require('./candidateController');
const candidateAuth = require('./candidateAuthorization');
const candidateValidation = require('./candidateValidation');
const  { handleValidationErrors } = require('../../common/util')

router.get(
    '/job/:jobId', 
    candidateValidation.getCandidatesForJobValidator, 
    handleValidationErrors,
    candidateAuth.authGetCandidatesForJob, 
    candidateController.getCandidatesForJob
);

router.get(
    '/recruiter/', 
    candidateValidation.getCandidatesForRecruiterValidator, 
    handleValidationErrors,
    candidateController.getCandidatesForRecruiter
);

router.patch('/assign-candidates', 
    candidateValidation.assignCandidatesToRecruiterValidator, 
    handleValidationErrors,
    candidateAuth.authAssignCandidatesToRecruiter, 
    candidateController.assignCandidatesToRecruiter
);

router.post(
    '/make-decision', 
    candidateValidation.makeDecisionToCandidatesValidator,
    handleValidationErrors,
    candidateAuth.authMakeDecisionToCandidates, 
    candidateController.MakeDecisionToCandidates
);

router.patch(
    '/unassign-candidates', 
    candidateValidation.unassignCandidatesFromRecruiterValidator, 
    handleValidationErrors,
    candidateAuth.authUnassignCandidatesToRecruiter, 
    candidateController.unassignCandidatesFromRecruiter
);

router.get(
    '/locations',
    candidateValidation.getCandidateLocationsValidator,
    handleValidationErrors,
    candidateAuth.authGetCandidateLocations,
    candidateController.getCandidateLocations
);

router.get(
    '/phase-types',
    candidateController.getPhaseTypes
);

module.exports = router;