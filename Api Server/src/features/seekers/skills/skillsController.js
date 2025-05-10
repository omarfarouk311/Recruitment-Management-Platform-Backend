const service = require('./skillsService')

module.exports.getSeekerSkillsById = async (req, res, next) => {
    try {
        const seekerId = req.query.seekerId || req.userId;
        const skills = await service.getSeekerSkillsById(seekerId);
        res.status(200).json(skills);
    } catch (err) {
        next(err);
    }
}


module.exports.addSeekerSkills = async (req, res, next) => {
    try {
        const seekerId = req.userId;
        const skills = req.body.skills;
        const insertionMsg = await service.addSeekerSkills(seekerId, skills);
        res.status(201).json({ msg: insertionMsg });
    } catch (err) {
        next(err);
    }
}


module.exports.deleteSeekerSkillById = async (req, res, next) => {
    try {
        const seekerId = req.userId;
        const skillId = req.params.id;
        const deleteMsg = await service.deleteSeekerSkillById(seekerId, skillId);
        res.status(200).json({ msg: deleteMsg });
    } catch (err) {
        
    }
}