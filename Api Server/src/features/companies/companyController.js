const companyService = require('./companyService');

exports.getCompanyData = async (req, res, next) => {
    const { companyId } = req.params;

    try {
        const result = await companyService.getCompanyData(companyId);
        if (!result.length) return res.status(404).json({ message: 'Company not found' });
        return res.status(200).json(result);
    }
    catch (err) {
        err.status = 500;
        err.msg = 'Internal server error';
        return next(err);
    }
};