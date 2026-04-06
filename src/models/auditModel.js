const mongoose = require('mongoose')

const auditSchema = new mongoose.Schema({
    action: { type: String, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    resource: { type: String },
    details: { type: Object },
    ip: { type: String },
    userAgent: { type: String },
}, { timestamps: true })

auditSchema.index({ userId: 1, createdAt: -1 })
auditSchema.index({ action: 1 })

module.exports = mongoose.model('Audit', auditSchema)
