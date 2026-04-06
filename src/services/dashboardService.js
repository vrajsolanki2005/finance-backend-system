const { Types } = require('mongoose')
const Transaction = require('../models/transactionModel')

const getDetails = async (userId) => {
    const filter = { isDeleted: false, userId: new Types.ObjectId(userId) }
    const transactions = await Transaction.find(filter).sort({ createdAt: -1 })

    let totalIncome = 0
    let totalExpense = 0
    let maxExpense=0;
    let topCategory="";
    const categoryMap = {}

    transactions.forEach((t) => {
        if (t.type === 'income') totalIncome += t.amount
        else totalExpense += t.amount
        categoryMap[t.category] = (categoryMap[t.category] || 0) + t.amount
    })

    transactions.forEach((t) => {
        if(t.amount>maxExpense && t.type==='expense'){
            maxExpense=t.amount;
            topCategory=t.category;
        }
    })

    return {
        totalIncome,
        totalExpense,
        netBalance: totalIncome - totalExpense,
        categoryMap,
        recentTransactions: transactions.slice(0, 5),

        insights:{
            highestExpense: maxExpense,
            topExpensedCategory: topCategory
        }
    }
}

const trends = async (userId) => {
    return await Transaction.aggregate([
        { $match: { isDeleted: false, userId: new Types.ObjectId(userId) } },
        {
            $group: {
                _id: { month: { $month: '$date' }, year: { $year: '$date' } },
                totalIncome: { $sum: { $cond: [{ $eq: ['$type', 'income'] }, '$amount', 0] } },
                totalExpense: { $sum: { $cond: [{ $eq: ['$type', 'expense'] }, '$amount', 0] } },
            },
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
    ])
}


module.exports = { getDetails, trends }