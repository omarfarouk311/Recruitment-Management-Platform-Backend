const candidateService = require('./candidateService');

exports.getCandidatesForJob = async (req, res, next) => {
    try {
        const candidates = await candidateService.getCandidatesForJob(
            req.params.jobId,
            {
                candidateLocation: req.query.candidateLocation,
                phaseType: req.query.phaseType,
                status: req.query.status,
            },
            req.query.sortBy,
            req.query.page
        );
        res.status(200).json(candidates);
    } catch (error) {
        console.error("here", error)
        next(error);
    }
};

exports.getCandidatesForRecruiter = async (req, res, next) => {
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
};

exports.assignCandidatesToRecruiter = async (req, res, next) => {
    let assigned_candidates_cnt = await candidateService.assignCandidatesToRecruiter(
        req.body.candidates, 
        req.body.recruiterId, 
        req.body.jobId,
        req.userId
    );
    res.status(200).json(assigned_candidates_cnt);
};

exports.MakeDecisionToCandidates = async (req, res, next) => {
    let result = await candidateService.MakeDecisionToCandidates(
        req.body.candidates,
        req.body.jobId, 
        req.body.decision,
        req.userId
    );
    res.status(200).json(result || { message: 'Decision made successfully' });
};

exports.unassignCandidatesFromRecruiter = async (req, res, next) => {
    await candidateService.unassignCandidatesFromRecruiter(
        req.body.candidates, 
        req.body.jobId, 
        req.userId
    );
    res.status(200).json({ message: 'Candidates unassigned successfully' });
};