const Transaction = require('../models/transactionModel')

const getDetails = async ()=>{
    const transactions = await Transaction.find({isDeleted: false})
    let totalIncome =0;
    let totalExpense =0;

    const categoryMap={};
    transactions.forEach((t)=>{
        if(t.type==='income'){
            totalIncome+=t.amount
        }else{
            totalExpense+=t.amount
        }

        //category breakdown
        if(!categoryMap[t.category]){
            categoryMap[t.category]=0
        }
        categoryMap[t.category]+=t.amount;
    })

    const netBalance = totalIncome + totalExpense;

    const recentTransactions = await Transaction.find({isDeleted: false})
    .sort({createdAt:-1})
    .limit(5)

    return{totalIncome,totalExpense,netBalance,categoryMap,recentTransactions}
}

//monthly trenda
const trends = async()=>{
    const data = await Transaction.aggregate([
        {
            $match:{isDeleted:false},
        },
        {
            $group:{
                _id:{month:{$month:'$createdAt'},year:{$year:'$createdAt'}},
                totalIncome:{$sum:{$cond:[{$eq:['$type','income']},'$amount',0]}},
                totalExpense:{$sum:{$cond:[{$eq:['$type','expense']},'$amount',0]}},
            },

        },
        
        {$sort:{'_id.year':1,'_id.month':1}},
    ])
    
    return data;
}