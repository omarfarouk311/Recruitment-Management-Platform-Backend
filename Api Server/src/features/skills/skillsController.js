const model = require('./skillsModel');

exports.getSkills = async (req, res, next) => {
    try{
        let skills = await model.getSkills();
        return res.status(200).json(skills);
    } catch (err) {
        next(err);
    }
}