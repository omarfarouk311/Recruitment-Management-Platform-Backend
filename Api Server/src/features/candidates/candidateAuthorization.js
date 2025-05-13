const authQuerySets = require('./candidateModel').CandidateAPIAuthorization;
const { role } = require('../../../config/config');

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

        if(!candidateFound) {
            res.status(404).json({ message: 'Candidate not found!' });
            return;
        }
        if (!recruiterFound) {
            res.status(404).json({ message: 'Recruiter not found!' });
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

exports.authGetCandidateLocations = async (req, res, next) => {
    try {
        if (req.query.jobId && req.userRole === role.company) {
            const found = await authQuerySets.jobBelongsToCompany(req.query.jobId, req.userId);
            if (!found) {
                res.status(403).json({ message: 'Unauthorized Access!' });
                return;
            }
        } else if(req.userRole !== role.recruiter) {
            res.status(400).json({ message: 'Either recruiterId or jobId must be provided' });
            return;
        }
        next();
    } catch (error) {
        console.error("Error in authGetCandidateLocations controller", error);
        next(error);
    }
};

exports.authGetCandidatesForRecruiter = async (req, res, next) => {
    try {
        if (req.userRole === role.company) {
            const found = await authQuerySets.recruiterBelongsToCompany(req.query.recruiterId, req.userId);
            if (!found) {
                let error = new Error('Unauthorized Access!');
                error.status = 403;
                error.msg = 'Unauthorized Access!';
                throw error;
            }
        }
        next();
    } catch (error) {
        console.error("Error in authGetCandidatesForRecruiter controller", error);
        next(error);
    }
}