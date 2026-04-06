const service = require('../services/transactionService')
const { logAction } = require('../services/auditService')
const sendResponse = require('../utils/response')

const create = async (req, res, next) => {
    try {
        const data = await service.createTransaction(req.body, req.user.id)
        await logAction('CREATE_TRANSACTION', req.user.id, {
            transactionId: data.transactionId,
            amount: data.amount,
            type: data.type,
            category: data.category,
            date: data.date,
        }, req, 'transaction')
        sendResponse(res, 201, 'Transaction created', data)
    } catch (err) {
        next(err)
    }
}

const getAll = async (req, res, next) => {
    try {
        const data = await service.getTransactions(req.user.id, req.user.role, req.query)
        await logAction('GET_ALL_TRANSACTIONS', req.user.id, { filters: req.query }, req, 'transaction')
        sendResponse(res, 200, 'Transactions fetched', data)
    } catch (err) {
        next(err)
    }
}

const getOne = async (req, res, next) => {
    try {
        const data = await service.getTransactionById(+req.params.id, req.user.id, req.user.role)
        if (!data) return sendResponse(res, 404, 'Transaction not found')
        await logAction('GET_TRANSACTION', req.user.id, { transactionId: +req.params.id }, req, 'transaction')
        sendResponse(res, 200, 'Transaction fetched', data)
    } catch (err) {
        next(err)
    }
}

const update = async (req, res, next) => {
    try {
        const { before, after } = await service.updateTransaction(+req.params.id, req.body)
        await logAction('UPDATE_TRANSACTION', req.user.id, {
            transactionId: +req.params.id,
            before: { amount: before.amount, type: before.type, category: before.category, date: before.date },
            after: { amount: after.amount, type: after.type, category: after.category, date: after.date },
        }, req, 'transaction')
        sendResponse(res, 200, 'Transaction updated', after)
    } catch (err) {
        next(err)
    }
}

const remove = async (req, res, next) => {
    try {
        const data = await service.deleteTransaction(+req.params.id)
        if (!data) return sendResponse(res, 404, 'Transaction not found')
        await logAction('DELETE_TRANSACTION', req.user.id, {
            transactionId: +req.params.id,
            snapshot: { amount: data.amount, type: data.type, category: data.category, date: data.date },
        }, req, 'transaction')
        sendResponse(res, 200, 'Transaction deleted')
    } catch (err) {
        next(err)
    }
}

module.exports = { create, getAll, getOne, update, remove }
