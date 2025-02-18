const candidateService = require('./candidateService');
const { role } = require('../../../config/config');

exports.getCandidatesForJob = async (req, res, next) => {
    try {
        const candidates = await candidateService.getCandidatesForJob(
            req.params.jobId,
            {
                candidateLocation: req.query.candidateLocation,
                phaseType: req.query.phaseType,
                status: req.query.status,
            },
            req.query.sortByRecommendation,
            req.query.page,
            req.query.sortByAssessmentScore
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
        next(error);
    }
};

exports.assignCandidatesToRecruiter = async (req, res, next) => {
    try {
        let assigned_candidates_cnt = await candidateService.assignCandidatesToRecruiter(
            req.body.candidates, 
            req.body.recruiterId, 
            req.body.jobId,
            req.userId
        );
        res.status(200).json(assigned_candidates_cnt);
    } catch (error) {
        next(error);
    }
};

exports.MakeDecisionToCandidates = async (req, res, next) => {
    try {
        let result = await candidateService.MakeDecisionToCandidates(
            req.body.candidates,
            req.body.jobId, 
            req.body.decision,
            req.userId,
            req.userRole
        );
        res.status(200).json(result || { message: 'Decision made successfully' });
    } catch (error) {
        next(error);
    }
};

exports.unassignCandidatesFromRecruiter = async (req, res, next) => {
    try {
        await candidateService.unassignCandidatesFromRecruiter(
            req.body.candidates, 
            req.body.jobId, 
            req.userId
        );
        res.status(200).json({ message: 'Candidates unassigned successfully' });
    } catch (error) {
        next(error);
    }
};

exports.getCandidateLocations = async (req, res, next) => {
    try {
        let locations;
        if (req.query.jobId) {
            locations = await candidateService.getCandidateLocationsForJob(req.query.jobId);
        }
        else if (req.userRole === role.recruiter) {
            locations = await candidateService.getCandidateLocationsForRecruiter(req.userId);
        } else {
            res.status(400).json({ message: 'Either recruiterId or jobId must be provided' });
            return;
        }
        res.status(200).json(locations);
    } catch (error) {
        next(error);
    }
};

exports.getPhaseTypes = async (req, res, next) => {
    try {
        const phaseTypes = await candidateService.getPhaseTypes();
        res.status(200).json(phaseTypes);
    } catch (error) {
        next(error);
    }
};

exports.getJobTitleFilter = async (req, res, next) => {
    try {
        const jobTitles = await candidateService.getJobTitleFilter(req.userId);
        res.status(200).json(jobTitles);
    } catch (error) {
        next(error);
    }
}