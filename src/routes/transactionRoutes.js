const router = require('express').Router()
const controller = require('../controllers/transactionController')
const auth = require('../middlewares/auth.middleware')
const role = require('../middlewares/rbac.middleware')
const validate = require('../middlewares/validate.middleware')
const { createRules, updateRules, idRule } = require('../validators/transaction.validator')

router.post('/', auth, role('ADMIN'), ...createRules, validate, controller.create)
router.get('/', auth, role('ADMIN', 'ANALYST'), controller.getAll)
router.get('/:id', auth, ...idRule, validate, controller.getOne)
router.patch('/:id', auth, role('ADMIN'), ...idRule, ...updateRules, validate, controller.update)
router.delete('/:id', auth, role('ADMIN'), ...idRule, validate, controller.remove)

module.exports = router
