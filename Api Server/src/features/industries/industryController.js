const { IndustryModel } = require('./industryModel');

exports.getIndustries = async (req, res, next) => {
    try {
       const industries =  await IndustryModel.getIndustries();
       res.status(200).json(industries);
    } catch (e) {
        next(e); 
    }
}