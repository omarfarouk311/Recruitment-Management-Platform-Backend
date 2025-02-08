const { role: { company } } = require('../../../config/config');

exports.authorizeGetLogs = (req, res, next) => {
    const { userRole } = req;
    if (userRole !== company) {
        const err = new Error('Unauthorized acess on logs');
        err.status = 403;
        err.msg = 'Unauthorized request'
        return next(err);
    }

    next();
};