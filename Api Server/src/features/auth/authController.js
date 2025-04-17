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

exports.login = async (req, res, next) => {
    const data = {
        email: req.body.email,
        password: req.body.password
    };

    try {
        const {
            token,
            refreshToken,
            userId,
            userRole,
            name
        } = await authService.login(data);

        // change samesite to 'Lax' after completing development
        res
            .status(200)
            .cookie('refreshToken', refreshToken, {
                httpOnly: true,
                sameSite: 'None',
                signed: true,
                secure: false,
                expires: new Date(Date.now() + 604800 * 1000)
            })
            .cookie('JWT', token, {
                httpOnly: true,
                sameSite: 'None',
                signed: true,
                secure: false,
                expires: new Date(Date.now() + 900 * 1000)
            })
            .json({
                userId,
                userRole,
                name
            });
    }
    catch (err) {
        next(err);
    }
};