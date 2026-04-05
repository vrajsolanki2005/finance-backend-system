const service = require('../services/dashboardService')
const sendResponse = require('../utils/response')

const summary = async (req, res, next) => {
    try {
        const details = await service.getDetails(req.user.id)
        sendResponse(res, 200, 'Dashboard summary', details)
    } catch (error) {
        next(error)
    }
}

const trends = async (req, res, next) => {
    try {
        const details = await service.trends(req.user.id)
        sendResponse(res, 200, 'Trends', details)
    } catch (error) {
        next(error)
    }
}
module.exports = {summary, trends}