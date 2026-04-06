const Audit = require('../models/auditModel')

const logAction = async (action, userId, details = {}, req = null, resource = null) => {
    try {
        const forwarded = req?.headers?.['x-forwarded-for']
        const ip = (forwarded ? forwarded.split(',')[0].trim() : req?.ip) || null

        await Audit.create({
            action,
            userId,
            resource,
            details,
            ip,
            userAgent: req?.headers?.['user-agent'] || null,
        })
    } catch (err) {
        console.error('[AuditLog Error]', err.message)
    }
}

const getAuditLogs = async ({ userId, action, resource, page = 1, limit = 20 } = {}) => {
    const filter = {}
    if (userId) filter.userId = userId
    if (action) filter.action = action
    if (resource) filter.resource = resource

    const skip = (page - 1) * limit
    const [logs, total] = await Promise.all([
        Audit.find(filter).sort({ createdAt: -1 }).skip(skip).limit(+limit).populate('userId', 'name email role'),
        Audit.countDocuments(filter),
    ])
    return { total, page: +page, limit: +limit, logs }
}

const getTransactionAuditLogs = async (transactionId) => {
    return await Audit.find({
        resource: 'transaction',
        action: { $in: ['CREATE_TRANSACTION', 'UPDATE_TRANSACTION', 'DELETE_TRANSACTION'] },
        'details.transactionId': +transactionId,
    }).sort({ createdAt: -1 }).populate('userId', 'name email role')
}

module.exports = { logAction, getAuditLogs, getTransactionAuditLogs }
