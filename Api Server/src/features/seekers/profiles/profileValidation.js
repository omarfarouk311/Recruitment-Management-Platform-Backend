const { param, body } = require('express-validator');

const validateUserId = () => param('userId').isInt({ min: 1, max: 100000000 }).toInt().withMessage('Invalid user id');

const validateName = () => body('name')
                            .isString()
                            .isLength({ min: 1, max: 50 })
                            .isAlpha('en-US', { ignore: ' ' })
                            .withMessage('Name must be a string with length between 1 and 50 characters and contain only alphabetic characters');

const validateCity = () => body('city')
                            .isString()
                            .isLength({ min: 1, max: 50 })
                            .isAlpha('en-US', { ignore: ' ' })
                            .withMessage('City must be a string with length between 1 and 50 characters and contain only alphabetic characters');

const validateCountry = () => body('country')
                                .isString()
                                .isLength({ min: 1, max: 50 })
                                .isAlpha('en-US', { ignore: ' ' })
                                .withMessage('Country must be a string with length between 1 and 50 characters and contain only alphabetic characters');

const validatePhoneNumber = () => body('phoneNumber')
                                    .isString()
                                    .matches(/^\+[1-9]\d{1,14}$/)
                                    .withMessage('Phone number must be a string with length between 1 and 15 characters and contain only digits');

const validateBirthDate = () => body('dateOfBirth').isDate().toDate().withMessage('Invalid date format');

const validateGender = () => body('gender').isBoolean().toBoolean().isIn([true, false]).withMessage('gender must be a boolean (true -> male, false -> female)');

exports.validateUserProfile = [
    validateName(),
    validateCity(),
    validateCountry(),
    validatePhoneNumber(),
    validateBirthDate(),
    validateGender()
];

exports.validateGetUser = [
    validateUserId()
];