require('dotenv').config()
const mongoose = require('mongoose')

async function migrate() {
    await mongoose.connect(process.env.MONGO_URI)
    console.log('DB connected')

    const col = mongoose.connection.collection('transactions')

    // Drop old index
    try {
        await col.dropIndex('transactionId_1')
        console.log('Dropped old index')
    } catch {
        console.log('Index not found, skipping drop')
    }

    // Assign transactionId to docs that have null
    const docs = await col.find({ transactionId: null }).sort({ createdAt: 1 }).toArray()
    const last = await col.findOne({ transactionId: { $ne: null } }, { sort: { transactionId: -1 } })
    let counter = last ? last.transactionId + 1 : 1

    for (const doc of docs) {
        await col.updateOne({ _id: doc._id }, { $set: { transactionId: counter++ } })
    }
    console.log(`Assigned IDs to ${docs.length} documents`)

    await mongoose.disconnect()
    console.log('Done')
}

migrate().catch(console.error)
