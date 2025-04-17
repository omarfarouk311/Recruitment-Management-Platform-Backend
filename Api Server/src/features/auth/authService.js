const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('./authModel');

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