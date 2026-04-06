const service = require('../services/dashboardService')
const { logAction } = require('../services/auditService')
const sendResponse = require('../utils/response')

const summary = async (req, res, next) => {
    try {
        const details = await service.getDetails(req.user.id)
        await logAction('VIEW_DASHBOARD_SUMMARY', req.user.id, {}, req, 'dashboard')
        sendResponse(res, 200, 'Dashboard summary', details)
    } catch (error) {
        next(error)
    }
}

const trends = async (req, res, next) => {
    try {
        const details = await service.trends(req.user.id)
        await logAction('VIEW_DASHBOARD_TRENDS', req.user.id, {}, req, 'dashboard')
        sendResponse(res, 200, 'Trends', details)
    } catch (error) {
        next(error)
    }
}

module.exports = { summary, trends }
