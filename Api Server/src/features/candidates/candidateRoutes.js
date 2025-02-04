const express = require('express');
const router = express.Router();
const candidateController = require('./candidateController');
const candidateAuth = require('./candidateAuthorization');
const candidateValidation = require('./candidateValidation');

router.get(
    '/job/:jobId', 
    candidateValidation.getCandidatesForJobValidator, 
    candidateAuth.authGetCandidatesForJob, 
    candidateController.getCandidatesForJob
);

router.get(
    '/recruiter/', 
    candidateValidation.getCandidatesForRecruiterValidator, 
    candidateController.getCandidatesForRecruiter
);

router.patch('/assign-candidates', 
    candidateValidation.assignCandidatesToRecruiterValidator, 
    candidateAuth.authAssignCandidatesToRecruiter, 
    candidateController.assignCandidatesToRecruiter
);

router.post(
    '/make-decision', 
    candidateValidation.makeDecisionToCandidatesValidator,
    candidateAuth.authMakeDecisionToCandidates, 
    candidateController.MakeDecisionToCandidates
);

router.patch(
    '/unassign-candidates', 
    candidateValidation.assignCandidatesToRecruiterValidator, 
    candidateAuth.authAssignCandidatesToRecruiter, 
    candidateController.unassignCandidatesFromRecruiter
);

module.exports = router;