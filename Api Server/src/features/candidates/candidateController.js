const candidateService = require('./candidateService');

exports.getCandidatesForJob = async (req, res, next) => {
    try {
        const candidates = await candidateService.getCandidatesForJob(
            req.params.jobId,
            {
                candidateLocation: req.query.candidateLocation,
                phaseType: req.query.phaseType,
                status: req.query.status,
                jobTitle: req.query.jobTitle,
            },
            req.query.sortBy,
            req.query.page
        );
        res.status(200).json(candidates);
    } catch (error) {
        next(error);
    }
};

exports.getCandidatesForRecruiter = async (req, res, next) => {
    try {
        const candidates = await candidateService.getCandidatesForRecruiter(
            req.userId, 
            req.query.simplified || false,
            {
                phaseType: req.query.phaseType, 
                jobTitle: req.query.jobTitle, 
                candidateLocation: req.query.caddidateLocation
            },
            req.query.sortBy,
            req.query.page
        );
        res.status(200).json(candidates);
    } catch (error) {
        console.error("Error in getCandidatesForRecruiter controller", error);
        next(error);
    }
};

exports.assignCandidatesToRecruiter = async (req, res, next) => {
    try {
        await candidateService.assignCandidatesToRecruiter(req.body.candidates, req.body.recruiterId, req.body.jobId);
        res.status(200).json({ message: 'Candidates assigned successfully' });
    } catch (error) {
        console.error("Error in assignCandidatesToRecruiter controller", error);
        next(error);
    }
};

exports.MakeDecisionToCandidates = async (req, res, next) => {
    try {
        await candidateService.MakeDecisionToCandidates(req.body.candidates, req.body.jobId, req.body.decision);
        res.status(200).json({ message: 'Decision made successfully' });
    } catch (error) {
        console.error("Error in MakeDecisionToCandidates controller", error);
        next(error);
    }
};

exports.unassignCandidatesFromRecruiter = async (req, res, next) => {
    try {
        await candidateService.unassignCandidatesFromRecruiter(req.body.candidates);
        res.status(200).json({ message: 'Candidates unassigned successfully' });
    } catch (error) {
        console.error("Error in unassignCandidatesFromRecruiter controller", error);
        next(error);
    }
};