const service = require('../services/dashboardService')

const summary = async(req, res, next)=>{
    try {
        const details = await service.getDetails()
        res.json(details)
    } catch (error) {
        next(error)
    }
}

const trends = async(req, res, next)=>{
    try {
        const details = await service.trends()
        res.json(details)
    } catch (error) {
        next(error)
    }
}
module.exports = {summary, trends}