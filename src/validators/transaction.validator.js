const { body, param } = require('express-validator')

const createRules = [
    body('amount').isFloat({ gt: 0 }).withMessage('Amount must be a positive number'),
    body('type').isIn(['income', 'expense']).withMessage('Type must be income or expense'),
    body('category').trim().notEmpty().withMessage('Category is required'),
    body('date').optional().isISO8601().withMessage('Date must be a valid ISO date'),
]

const updateRules = [
    body('amount').optional().isFloat({ gt: 0 }).withMessage('Amount must be a positive number'),
    body('type').optional().isIn(['income', 'expense']).withMessage('Type must be income or expense'),
    body('category').optional().trim().notEmpty().withMessage('Category cannot be empty'),
    body('date').optional().isISO8601().withMessage('Date must be a valid ISO date'),
]

const idRule = [
    param('id').isInt({ gt: 0 }).withMessage('ID must be a positive integer').toInt(),
]

module.exports = { createRules, updateRules, idRule }
