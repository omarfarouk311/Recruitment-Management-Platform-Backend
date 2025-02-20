const companyService = require('./companyService');


exports.getCompanies = async (req, res, next) => {
    try {
        const companies = await companyService.getCompanies(
            req.query.companyName, 
            req.query.companyType, 
            req.query.companyMinSize,
            req.query.companyMaxSize, 
            req.query.companyIndustry, 
            req.query.companyCity,
            req.query.companyCountry, 
            req.query.companyRating,
            req.query.page
        );
        res.status(200).json(companies);
    } catch(err) {
       next(err); 
    }
}