exports.authorizeUpdateCompanyData = (req, res, next) => {
    const { userRole } = req;
    if (userRole !== 'company') {
        const err = new Error('Unauthorized acess on updating company data');
        err.status = 403;
        err.msg = 'Unauthorized request'
        return next(err);
    }

    next();
};