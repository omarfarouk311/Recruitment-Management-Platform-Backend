exports.notAllowed = (req, res, next) => {
    const err = new Error('Method not allowed');
    err.msg = 'Method not allowed';
    err.status = 405;
    return next(err);
};

exports.notFound = (req, res, next) => {
    const err = new Error('Resource not found');
    err.msg = 'Resource not found';
    err.status = 404;
    return next(err);
};

exports.errorHandlingMiddleware = (err, req, res, next) => {
    if (res.headersSent) {
        return next(err);
    }

    console.error(err);

    const status = err.status || 500;
    const message = err.msg || 'Internal server error';
    const validationErrors = err.validationErrors || [];
    return res.status(status).json({ message, validationErrors });
};
