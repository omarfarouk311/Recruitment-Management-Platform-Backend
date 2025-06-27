const authService = require('./authService');
const User = require('./userModel');

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

        res
            .status(200)
            .cookie('refreshToken', refreshToken, {
                httpOnly: true,
                sameSite: 'Lax',
                signed: true,
                secure: true,
                expires: new Date(Date.now() + 604800 * 1000)
            })
            .cookie('JWT', token, {
                httpOnly: true,
                sameSite: 'Lax',
                signed: true,
                secure: true,
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

exports.refreshToken = async (req, res, next) => {
    const data = {
        oldRefreshToken: req.signedCookies.refreshToken
    };

    try {
        const {
            token,
            refreshToken
        } = authService.refreshToken(data);

        res
            .status(204)
            .cookie('refreshToken', refreshToken, {
                httpOnly: true,
                sameSite: 'Lax',
                signed: true,
                secure: true,
                expires: new Date(Date.now() + 604800 * 1000)
            })
            .cookie('JWT', token, {
                httpOnly: true,
                sameSite: 'Lax',
                signed: true,
                secure: true,
                expires: new Date(Date.now() + 900 * 1000)
            })
            .end();
    }
    catch (err) {
        next(err);
    }
};

exports.authenticateUser = async (req, res, next) => {
    const data = {
        token: req.signedCookies.JWT
    };

    try {
        const {
            userId,
            userRole
        } = await authService.authenticateUser(data);

        req.userId = userId;
        req.userRole = userRole;
        next();
    }
    catch (err) {
        next(err);
    }
};

exports.checkAuth = async (req, res, next) => {
    const data = {
        token: req.signedCookies.JWT
    };

    try {
        const {
            userId,
            userRole
        } = await authService.authenticateUser(data);
        const name = await User.getUserName(userId, userRole);
        res.status(200).json({ isProfileFinished: Boolean(name) });
    }
    catch (err) {
        next(err);
    }
}

exports.logout = async (req, res, next) => {
    const data = { token: req.signedCookies.JWT };

    try {
        const { userId } = await authService.authenticateUser(data);
        await authService.logout({ userId });
        res.setHeader("Clear-Site-Data", '"cache", "cookies", "storage"');
        res.status(204).end();
    }
    catch (err) {
        next(err);
    }
}