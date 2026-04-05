const express = require('express')
const router = express.Router()

const controller = require('../controllers/dashboardController')
const auth = require('../middlewares/auth.middleware')
const role = require('../middlewares/rbac.middleware')

router.get('/summary', auth, role('ADMIN', 'ANALYST'), controller.summary)
router.get('/trends', auth, role('ADMIN', 'ANALYST'), controller.trends)

module.exports = router;