const { param, body } = require("express-validator");

const validateUserId = () =>
  param("seekerId")
    .isInt({ min: 1, max: 100000000 })
    .toInt()
    .withMessage("Invalid user id");

const validateName = () =>
  body("name")
    .isString()
    .withMessage("Name must be a string")
    .isLength({ min: 1, max: 50 })
    .withMessage("Name must have a length between 1 and 50 characters")
    .isAlpha("en-US", { ignore: " " })
    .withMessage("Name must contain only alphabetic characters");

const validateCity = () =>
  body("city")
    .isString()
    .withMessage("City must be a string")
    .isLength({ min: 1, max: 50 })
    .withMessage("City must have a length between 1 and 50 characters")
    .isAlpha("en-US", { ignore: " " })
    .withMessage("City must contain only alphabetic characters");

const validateCountry = () =>
  body("country")
    .isString()
    .withMessage("Country must be a string")
    .isLength({ min: 1, max: 50 })
    .withMessage("Country must have a length between 1 and 50 characters")
    .isAlpha("en-US", { ignore: " " })
    .withMessage("Country must contain only alphabetic characters");

const validatePhoneNumber = () =>
  body("phoneNumber")
    .isString()
    .withMessage("Phone number must be a string")
    .isMobilePhone()
    .withMessage(
      'Phone number must start with a "+" followed by 1 to 14 digits'
    );

const validateBirthDate = () =>
  body("dateOfBirth").isISO8601().withMessage("Invalid date format").toDate();

const validateGender = () =>
  body("gender")
    .isBoolean()
    .withMessage("Gender must be a boolean")
    .toBoolean()
    .isIn([true, false])
    .withMessage("Gender must be either true (male) or false (female)");

exports.validateUserProfile = [
  validateName(),
  validateCity(),
  validateCountry(),
  validatePhoneNumber(),
  validateBirthDate(),
  validateGender(),
];

exports.validateGetUser = [validateUserId()];
