const service = require('../services/transactionService')
const sendResponse = require('../utils/response')

const create = async (req, res, next) => {
    try {
        const data = await service.createTransaction(req.body, req.user.id)
        sendResponse(res, 201, 'Transaction created', data)
    } catch (err) {
        next(err)
    }
}

const getAll = async (req, res, next) => {
    try {
        const data = await service.getTransactions(req.user.id, req.user.role, req.query)
        sendResponse(res, 200, 'Transactions fetched', data)
    } catch (err) {
        next(err)
    }
}

const getOne = async (req, res, next) => {
    try {
        const data = await service.getTransactionById(+req.params.id, req.user.id, req.user.role)
        if (!data) return sendResponse(res, 404, 'Transaction not found')
        sendResponse(res, 200, 'Transaction fetched', data)
    } catch (err) {
        next(err)
    }
}

const update = async (req, res, next) => {
    try {
        const data = await service.updateTransaction(+req.params.id, req.body)
        if (!data) return sendResponse(res, 404, 'Transaction not found')
        sendResponse(res, 200, 'Transaction updated', data)
    } catch (err) {
        next(err)
    }
}

const remove = async (req, res, next) => {
    try {
        const data = await service.deleteTransaction(+req.params.id)
        if (!data) return sendResponse(res, 404, 'Transaction not found')
        sendResponse(res, 200, 'Transaction deleted')
    } catch (err) {
        next(err)
    }
}

module.exports = { create, getAll, getOne, update, remove }
