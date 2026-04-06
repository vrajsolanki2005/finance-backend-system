const router = require('express').Router()
const { getLogs, getTransactionLogs } = require('../controllers/auditController')
const auth = require('../middlewares/auth.middleware')
const role = require('../middlewares/rbac.middleware')

/**
 * @swagger
 * /audit:
 *   get:
 *     summary: Get all audit logs
 *     tags: [Audit]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema: { type: string }
 *         description: Filter by user ObjectId
 *       - in: query
 *         name: action
 *         schema: { type: string, example: LOGIN }
 *         description: Filter by action name
 *       - in: query
 *         name: resource
 *         schema: { type: string, example: transaction }
 *         description: Filter by resource type
 *       - in: query
 *         name: page
 *         schema: { type: integer, example: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, example: 20 }
 *     responses:
 *       200:
 *         description: Audit logs fetched
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total: { type: integer }
 *                 page: { type: integer }
 *                 limit: { type: integer }
 *                 logs:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/AuditLog'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied (ADMIN only)
 */
router.get('/', auth, role('ADMIN'), getLogs)

/**
 * @swagger
 * /audit/transactions/{id}:
 *   get:
 *     summary: Get full audit history for a specific transaction
 *     description: Returns CREATE, UPDATE (with before/after snapshots), and DELETE entries for the given transactionId.
 *     tags: [Audit]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer, example: 1 }
 *         description: The numeric transactionId
 *     responses:
 *       200:
 *         description: Transaction audit logs fetched
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/AuditLog'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied (ADMIN only)
 */
router.get('/transactions/:id', auth, role('ADMIN'), getTransactionLogs)

module.exports = router
