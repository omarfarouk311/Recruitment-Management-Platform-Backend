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
        .withMessage("Name must have a length between 1 and 50 characters");

const validateCity = () =>
    body("city")
        .isString()
        .withMessage("City must be a string")
        .isLength({ min: 1, max: 50 })
        .withMessage("City must have a length between 1 and 50 characters");

const validateCountry = () =>
    body("country")
        .isString()
        .withMessage("Country must be a string")
        .isLength({ min: 1, max: 50 })
        .withMessage("Country must have a length between 1 and 50 characters");

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

const validateExperiences = () =>
    body("experiences", "Invalid experiences")
        .isArray()
        .withMessage("Experiences must be an array")
        .custom((value) => {
            if (value.length > 0) {
                value.forEach((experience) => {
                    if (!experience.companyName || !experience.jobTitle) {
                        throw new Error(
                            "Experience must have companyName and jobTitle"
                        );
                    }
                    if (
                        experience.startDate &&
                        !body().isISO8601().run({ value: experience.startDate })
                    ) {
                        throw new Error(
                            "startDate must be a valid ISO 8601 string"
                        );
                    }

                    if (
                        experience.endDate &&
                        !body().isISO8601().run({ value: experience.endDate })
                    ) {
                        throw new Error(
                            "endDate must be a valid ISO 8601 string"
                        );
                    }
                });
            }
            return true;
        });


const validateEducations = () =>
    body("educations", "Invalid educations")
       .isArray()
       .withMessage("Educations must be an array")
       .custom((value) => {
            if (value.length > 0) {
                value.forEach((education) => {
                    if (!education.schoolName || !education.degree || !education.field) {
                        throw new Error(
                            "Education must have school Name, degree, and field"
                        );
                    }
                    if (
                        education.startDate &&
                        !body().isISO8601().run({ value: education.startDate })
                    ) {
                        throw new Error(
                            "startDate must be a valid ISO 8601 string"
                        );
                    }

                    if (
                        education.endDate &&
                        !body().isISO8601().run({ value: education.endDate })
                    ) {
                        throw new Error(
                            "endDate must be a valid ISO 8601 string"
                        );
                    }
                });
            }
            return true; 
        });


const validateSkills = () =>
    body("skills", "Invalid skills")
       .isArray()
       .withMessage("Skills must be an array")

exports.validateCreateUserProfile = [
    validateName(),
    validateCity(),
    validateCountry(),
    validatePhoneNumber(),
    validateBirthDate(),
    validateGender(),
    validateExperiences(),
    validateEducations(),
    validateSkills(),
];

exports.validateUpdateUserProfile = [
    validateName(),
    validateCity(),
    validateCountry(),
    validatePhoneNumber(),
    validateBirthDate(),
    validateGender(),
]

exports.validateGetUser = [validateUserId()];
