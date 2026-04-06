const { getAuditLogs, getTransactionAuditLogs } = require('../services/auditService')
const sendResponse = require('../utils/response')

const getLogs = async (req, res, next) => {
    try {
        const data = await getAuditLogs(req.query)
        sendResponse(res, 200, 'Audit logs fetched', data)
    } catch (err) {
        next(err)
    }
}

const getTransactionLogs = async (req, res, next) => {
    try {
        const data = await getTransactionAuditLogs(req.params.id)
        sendResponse(res, 200, 'Transaction audit logs fetched', data)
    } catch (err) {
        next(err)
    }
}

module.exports = { getLogs, getTransactionLogs }
