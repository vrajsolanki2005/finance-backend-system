const service = require('../services/transactionService')

const create = async (req, res, next) =>{
    try{
        const data = await service.createTransaction(req.body, req.user.id)
        res.status(201).json({success:true, data})
    }catch(err){
        next(err)
    }
}

const getAll = async (req, res, next) => {
    try {
        const result = await service.getTransactions(req.user.id, req.user.role, req.query)
        res.status(200).json({ success: true, ...result })
    } catch (err) {
        next(err)
    }
}

const getOne = async (req, res, next) => {
    try {
        const data = await service.getTransactionById(+req.params.id, req.user.id)
        if (!data) return res.status(404).json({ success: false, message: 'Transaction not found' })
        res.status(200).json({ success: true, data })
    } catch (err) {
        next(err)
    }
}

const update = async (req, res, next) => {
    try {
        const data = await service.updateTransaction(+req.params.id, req.body)
        if (!data) return res.status(404).json({ success: false, message: 'Transaction not found' })
        res.status(200).json({ success: true, data })
    } catch (err) {
        next(err)
    }
}

const remove = async (req, res, next) => {
    try {
        const data = await service.deleteTransaction(+req.params.id)
        if (!data) return res.status(404).json({ success: false, message: 'Transaction not found' })
        res.status(200).json({ success: true, message: 'Transaction deleted' })
    } catch (err) {
        next(err)
    }
}

module.exports = { create, getAll, getOne, update, remove }