import { body, validationResult } from "express-validator";

const responseWithValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            error: {
                message: "Validation errors",
                details: errors.array(),
            },
        });
    }
    next();
};

export const registerUserValidations = [
    body("username")
        .isString()
        .withMessage("username must be a string")
        .notEmpty()
        .withMessage("username is required")
        .isLength({ min: 3 })
        .withMessage("username must be at least 3 characters long"),
    body("email").isEmail().withMessage("email must be a valid email address"),
    body("password")
        .isLength({ min: 8 })
        .withMessage("password must be at least 8 characters long"),
    body("fullname.firstname")
        .isString()
        .withMessage("fullname.firstname must be a string")
        .notEmpty()
        .withMessage("fullname.firstname is required"),
    body("fullname.lastname")
        .isString()
        .withMessage("fullname.lastname must be a string")
        .notEmpty()
        .withMessage("fullname.lastname is required"),

    responseWithValidationErrors,
];

export const loginUserValidations = [
    body("email")
        .optional()
        .isEmail()
        .withMessage("email must be a valid email address"),
    body("password")
        .isLength({ min: 8 })
        .withMessage("password must be at least 8 characters long"),
    body("username")
        .optional()
        .isString()
        .withMessage("username must be a string")
        .isLength({ min: 3 })
        .withMessage("username must be at least 3 characters long"),

    responseWithValidationErrors,
];
