const CV = require('./cvModel');

exports.checkLimit = async (req, res, next) => {
    try {
        const cvsCount = await CV.getCVsCount(req.userId);
        if (cvsCount === 5) {
            const err = new Error('The user was trying to exceed the allowed cvs limit while uploading a new CV');
            err.msg = 'Allowed CVs limit has been reached';
            err.status = 409;
            throw err;
        }
        next();
    }
    catch (err) {
        next(err);
    }
};