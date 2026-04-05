const { body } = require('express-validator')

const registerRules = [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('role').optional().isIn(['VIEWER', 'ANALYST', 'ADMIN']).withMessage('Role must be VIEWER, ANALYST, or ADMIN'),
]

const loginRules = [
    body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('password').notEmpty().withMessage('Password is required'),
]

module.exports = { registerRules, loginRules }
