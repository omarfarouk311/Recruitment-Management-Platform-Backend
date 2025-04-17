const authService = require('./authService');

exports.signUp = async (req, res, next) => {
    const data = {
        email: req.body.email,
        password: req.body.password,
        role: req.body.role
    };

    try {
        const response = await authService.signUp(data);
        res.status(201).json(response);
    }
    catch (err) {
        next(err);
    }
};