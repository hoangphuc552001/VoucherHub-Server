const {check,validationResult} = require('express-validator');

exports.validateUserSignUp = [
    check('fullName').not().isEmpty().withMessage('Full name is required'),
    check('email').normalizeEmail().isEmail().withMessage('Must be a valid email address'),
    check('password').isLength({min: 6}).withMessage('Password must be at least 6 characters long'),
    check('confirmPassword').trim().not().isEmpty().custom((value, {req}) => {
        if (value !== req.body.password) {
            throw new Error('Password confirmation does not match password');
        }
        return true;
    })
]

exports.userValidationResult = (req, res, next) => {
    const result = validationResult(req);
    const hasErrors = !result.isEmpty();
    if (hasErrors) {
        const firstError = result.array()[0].msg;
        return res.status(400).json({error: firstError});
    }
    next();
}

exports.validateUserSignIn = [
    check('email').trim().isEmail().withMessage('Must be a valid email address'),
    check('password').trim().not().isEmpty().withMessage('Password is required')
]
