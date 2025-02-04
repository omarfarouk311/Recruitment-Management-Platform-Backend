const authQuerySets = require('./candidateModel').CandidateAPIAuthorization;

exports.authGetCandidatesForJob = async (req, res, next) => {
    try {
        const found = await authQuerySets.jobBelongsToCompany(req.params.jobId, req.userId);
        if (!found) {
            res.status(403).json({ message: 'Unauthorized Access!' });
            return;
        }
        next();
    } catch (error) {
        console.error("Error in authGetCandidatesForJob controller", error);
        next(error);
    }
}

exports.authAssignCandidatesToRecruiter = async (req, res, next) => {
    try {
        const candidateFound = await authQuerySets.candidatesBelongsToCompany(
            req.body.jobId, 
            req.body.candidates, 
            req.userId
        );
        const recruiterFound = await authQuerySets.recruiterBelongsToCompany(
            req.body.recruiterId, 
            req.userId
        );
        if (!candidateFound || !recruiterFound) {
            res.status(403).json({ message: 'Unauthorized Access!' });
            return;
        }
        next();
    } catch (error) {
        console.error("Error in authAssignCandidatesToRecruiter controller", error);
        next(error);
    }
}

exports.authUnassignCandidatesToRecruiter = async (req, res, next) => {
    try {
        const candidateFound = await authQuerySets.candidatesBelongsToCompany(
            req.body.jobId, 
            req.body.candidates, 
            req.userId
        );
        if (!candidateFound) {
            res.status(403).json({ message: 'Unauthorized Access!' });
            return;
        }
        next();
    } catch (error) {
        console.error("Error in authAssignCandidatesToRecruiter controller", error);
        next(error);
    }
}

exports.authMakeDecisionToCandidates = async (req, res, next) => {
    try {
        const found = await authQuerySets.candidatesBelongsToRecruiterOrCompany(
            req.body.jobId, 
            req.body.candidates, 
            req.userId
        );
        if (!found) {
            res.status(403).json({ message: 'Unauthorized Access!' });
            return;
        }
        next();
    } catch (error) {
        console.error("Error in authMakeDecisionToCandidates controller", error);
        next(error);
    }
}