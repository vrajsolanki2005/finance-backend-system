const express = require('express')
const router = express.Router()

const controller = require('../controllers/dashboardController')
const auth = require('../middlewares/auth.middleware')
const role = require('../middlewares/rbac.middleware')

router.get('/summary',auth,role(['admin','user']),controller.summary)
router.get('/trends', auth, role(['admin', 'user']), controller.trends)

module.exports = router;