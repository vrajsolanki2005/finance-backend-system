const mongoose = require('mongoose')

const transactionSchema = new mongoose.Schema({
    transactionId: { type: Number, unique: true, sparse: true },
    amount: { type: Number, required: true },
    type: { type: String, enum: ['income', 'expense'], required: true },
    category: { type: String, required: true },
    date: { type: Date, default: Date.now },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    isDeleted: { type: Boolean, default: false },
}, { timestamps: true })

transactionSchema.pre('save', async function () {
    if (this.isNew) {
        const last = await this.constructor.findOne({}, {}, { sort: { transactionId: -1 } })
        this.transactionId = last ? last.transactionId + 1 : 1
    }
})

module.exports = mongoose.model('Transaction', transactionSchema)
