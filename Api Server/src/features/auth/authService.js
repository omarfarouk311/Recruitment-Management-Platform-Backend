const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('./userModel');

exports.signUp = async (data) => {
    const { email, password, role } = data;
    const hashedPassword = await bcrypt.hash(password, 14);
    const auth = new User({
        email,
        password: hashedPassword,
        role
    });

    try {
        const userData = await auth.create();
        return userData;
    }
    catch (err) {
        if (err.code === '23505') {
            const err = new Error('Email already exists');
            err.msg = err.message;
            err.status = 409;
            throw err;
        }
        throw err;
    }
};

exports.login = async (data) => {
    const { email, password } = data;

    const userData = await User.getUserData(email);
    //user not found
    if (!userData) {
        const err = new Error('Invalid email or password');
        err.msg = err.message;
        err.status = 401;
        throw err;
    }

    const { userId, hashedPassword, userRole } = userData;
    const isMatch = await bcrypt.compare(password, hashedPassword);
    // password not valid
    if (!isMatch) {
        const err = new Error('Invalid email or password');
        err.msg = err.message;
        err.status = 401;
        throw err;
    }

    // Generate JWT tokens and retrieve the name
    const token = jwt.sign({ userId, userRole }, process.env.JWT_SECRET, { expiresIn: '15m' });
    const refreshToken = jwt.sign({ userId, userRole }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' });
    const name = await User.getUserName(userId, userRole);

    return {
        token,
        refreshToken,
        userId,
        userRole,
        name
    };
};

exports.refreshToken = (data) => {
    const { oldRefreshToken } = data;

    // Check if the refresh token is provided
    if (!oldRefreshToken) {
        const err = new Error('Invalid refresh token');
        err.msg = err.message;
        err.status = 401;
        throw err;
    }

    try {
        const decodedToken = jwt.verify(oldRefreshToken, process.env.REFRESH_TOKEN_SECRET);
        const { userId, userRole } = decodedToken;
        const token = jwt.sign({ userId, userRole }, process.env.JWT_SECRET, { expiresIn: '15m' });
        const refreshToken = jwt.sign({ userId, userRole }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' });

        return {
            token,
            refreshToken,
        };
    }
    catch (err) {
        if (err.name === 'TokenExpiredError' || err.name === 'JsonWebTokenError') {
            err.msg = 'Invalid refresh token';
            err.status = 401;
            throw err;
        }
        throw err;
    }
};