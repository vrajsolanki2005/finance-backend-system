const Transaction = require('../models/transactionModel')

const createTransaction = async (data, userId) => {
    const transaction = await new Transaction({ ...data, userId }).save()
    return transaction
}

const getTransactions = async (userId, role, query = {}) => {
    const filter = { isDeleted: false }
    if (role !== 'ADMIN' && role !== 'ANALYST') filter.userId = userId
    if (query.type) filter.type = query.type
    if (query.category) filter.category = query.category

    const page = Math.max(1, parseInt(query.page) || 1)
    const limit = Math.min(100, parseInt(query.limit) || 10)
    const skip = (page - 1) * limit

    const [transactions, total] = await Promise.all([
        Transaction.find(filter).sort({ date: -1 }).skip(skip).limit(limit),
        Transaction.countDocuments(filter),
    ])

    return { transactions, total, page, pages: Math.ceil(total / limit) }
}

const getTransactionById = async (id, userId) => {
    return await Transaction.findOne({ transactionId: id, userId, isDeleted: false })
}

const updateTransaction = async (id, data) => {
    return await Transaction.findOneAndUpdate(
        { transactionId: id, isDeleted: false },
        data,
        { new: true }
    )
}

const deleteTransaction = async (id) => {
    return await Transaction.findOneAndUpdate(
        { transactionId: id },
        { isDeleted: true },
        { new: true }
    )
};

module.exports = {
  createTransaction,
  getTransactions,
  getTransactionById,
  updateTransaction,
  deleteTransaction,
};