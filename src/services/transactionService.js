const Transaction = require('../models/transactionModel')

const createTransaction = async (data, userId) => {
    const transaction = await new Transaction({ ...data, userId }).save()
    return transaction
}

const getTransactions = async (userId, role, query = {}) => {
    const page = Math.max(1, parseInt(query.page) || 1)
    const limit = Math.min(100, parseInt(query.limit) || 10)
    const skip = (page - 1) * limit

    const filter = { isDeleted: false }
    if (role !== 'ADMIN' && role !== 'ANALYST') filter.userId = userId
    if (query.type) filter.type = query.type
    if (query.category) filter.category = query.category

    const [data, total] = await Promise.all([
        Transaction.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
        Transaction.countDocuments(filter),
    ])

    return { data, total, page, totalPages: Math.ceil(total / limit) }
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

const { Types } = require('mongoose')

const getDashboard = async (userId) => {
    const uid = new Types.ObjectId(userId)
    const base = { userId: uid, isDeleted: false }

    const [totals, categories, recent, monthly] = await Promise.all([

        // income vs expense totals
        Transaction.aggregate([
            { $match: base },
            { $group: { _id: '$type', total: { $sum: '$amount' } } },
        ]),

        // spending per category, highest first
        Transaction.aggregate([
            { $match: base },
            { $group: { _id: '$category', total: { $sum: '$amount' }, count: { $sum: 1 } } },
            { $project: { _id: 0, category: '$_id', total: 1, count: 1 } },
            { $sort: { total: -1 } },
        ]),

        // last 5 transactions
        Transaction.find(base).sort({ date: -1 }).limit(5).select('amount type category date'),

        // monthly trends for current year
        Transaction.aggregate([
            { $match: { ...base, date: { $gte: new Date(new Date().getFullYear(), 0, 1) } } },
            { $group: {
                _id: { month: { $month: '$date' }, type: '$type' },
                total: { $sum: '$amount' },
            }},
            { $sort: { '_id.month': 1 } },
        ]),
    ])

    const income  = totals.find(t => t._id === 'income')?.total  ?? 0
    const expense = totals.find(t => t._id === 'expense')?.total ?? 0

    return {
        summary:  { income, expense, net: income - expense },
        categories,
        recent,
        monthly:  monthly.map(({ _id, total }) => ({ month: _id.month, type: _id.type, total })),
    }
}

module.exports = {
    createTransaction,
    getTransactions,
    getTransactionById,
    updateTransaction,
    deleteTransaction,
    getDashboard,
}