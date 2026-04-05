const router = require('express').Router()
const { register, login, logout } = require('../controllers/authController')
const { registerRules, loginRules } = require('../validators/auth.validator')
const validate = require('../middlewares/validate.middleware')
const auth = require('../middlewares/auth.middleware')

router.post('/register', ...registerRules, validate, register)
router.post('/login', ...loginRules, validate, login)
router.post('/logout', auth, logout)

module.exports = router
