const { body } = require('express-validator');
const { role } = require('../../../config/config');
const User = require('./authModel');

const validateEmail = () => body('email')
    .isString()
    .withMessage('Email must be a string')
    .isLength({ max: 50 })
    .withMessage('Email length must not exceed than 50 characters')
    .trim()
    .isEmail()
    .withMessage('Invalid Email address')

const validatePassword = () => body('password')
    .isStrongPassword()
    .withMessage('Password length must be atleast 8 and contains numbers, symbols, uppercase and lowercase letters');

const validateConfirmationPassword = () => body('confirmationPassword')
    .custom((value, { req }) => value === req.body.password)
    .withMessage('Password must match confirmation password');

const validateRole = () => body('role')
    .isIn(Object.values(role))
    .withMessage(`Invalid role. It Must be 0, 1 or 2`);

exports.validateSignup = [
    validateEmail(),
    validatePassword(),
    validateConfirmationPassword(),
    validateRole()
];