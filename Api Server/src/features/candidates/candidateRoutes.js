const express = require('express');
const router = express.Router();
const candidateController = require('./candidateController');
const candidateAuth = require('./candidateAuthorization');
const candidateValidation = require('./candidateValidation');

router.get(
    '/job/:jobId', 
    candidateAuth.authGetCandidatesForJob, 
    candidateValidation.getCandidatesForJobValidator, 
    candidateController.getCandidatesForJob
);

router.get(
    '/recruiter/', 
    candidateValidation.getCandidatesForRecruiterValidator, 
    candidateController.getCandidatesForRecruiter
);

router.patch('/assign-candidates', 
    candidateAuth.authAssignCandidatesToRecruiter, 
    candidateValidation.assignCandidatesToRecruiterValidator, 
    candidateController.assignCandidatesToRecruiter
);

router.post(
    '/make-decision', 
    candidateAuth.authMakeDecisionToCandidates, 
    candidateValidation.makeDecisionToCandidatesValidator,
    candidateController.MakeDecisionToCandidates
);

router.patch(
    '/unassign-candidates', 
    candidateAuth.authAssignCandidatesToRecruiter, 
    candidateValidation.assignCandidatesToRecruiterValidator, 
    candidateController.unassignCandidatesFromRecruiter
);

module.exports = router;