const request = require('supertest')
const app = require('../src/app')
const User = require('../src/models/userModel')
const Transaction = require('../src/models/transactionModel')
const Audit = require('../src/models/auditModel')
const { hashedPassword } = require('../src/utils/hashing')

let adminCookie, analystCookie
let createdTransactionId

const seed = async (email, role) => {
    await User.deleteOne({ email })
    await User.create({ name: role, email, password: await hashedPassword('123456'), role })
    const res = await request(app).post('/api/auth/login').send({ email, password: '123456' })
    return res.headers['set-cookie']
}

beforeAll(async () => {
    adminCookie = await seed('admin_audit@test.com', 'ADMIN')
    analystCookie = await seed('analyst_audit@test.com', 'ANALYST')

    const res = await request(app)
        .post('/api/transactions')
        .set('Cookie', adminCookie)
        .send({ amount: 100, type: 'income', category: 'audit_suite', date: '2026-04-01' })
    createdTransactionId = res.body.data.transactionId

    await request(app)
        .patch(`/api/transactions/${createdTransactionId}`)
        .set('Cookie', adminCookie)
        .send({ amount: 200 })

    await request(app)
        .delete(`/api/transactions/${createdTransactionId}`)
        .set('Cookie', adminCookie)
})

afterAll(async () => {
    const users = await User.find({ email: { $in: ['admin_audit@test.com', 'analyst_audit@test.com'] } })
    const ids = users.map(u => u._id)
    await Transaction.deleteMany({ userId: { $in: ids } })
    await Audit.deleteMany({ userId: { $in: ids } })
    await User.deleteMany({ _id: { $in: ids } })
})

describe('Audit API', () => {

    describe('GET /api/audit', () => {
        test('200 — ADMIN fetches audit logs with pagination shape', async () => {
            const res = await request(app).get('/api/audit').set('Cookie', adminCookie)
            expect(res.status).toBe(200)
            expect(res.body.data).toHaveProperty('total')
            expect(res.body.data).toHaveProperty('page')
            expect(res.body.data).toHaveProperty('limit')
            expect(Array.isArray(res.body.data.logs)).toBe(true)
        })

        test('200 — filter by action returns matching logs only', async () => {
            const res = await request(app)
                .get('/api/audit?action=CREATE_TRANSACTION')
                .set('Cookie', adminCookie)
            expect(res.status).toBe(200)
            res.body.data.logs.forEach(log => expect(log.action).toBe('CREATE_TRANSACTION'))
        })

        test('200 — filter by resource=transaction returns matching logs only', async () => {
            const res = await request(app)
                .get('/api/audit?resource=transaction')
                .set('Cookie', adminCookie)
            expect(res.status).toBe(200)
            res.body.data.logs.forEach(log => expect(log.resource).toBe('transaction'))
        })

        test('200 — pagination limit is respected', async () => {
            const res = await request(app)
                .get('/api/audit?page=1&limit=2')
                .set('Cookie', adminCookie)
            expect(res.status).toBe(200)
            expect(res.body.data.logs.length).toBeLessThanOrEqual(2)
        })

        test('403 — ANALYST cannot access audit logs', async () => {
            const res = await request(app).get('/api/audit').set('Cookie', analystCookie)
            expect(res.status).toBe(403)
        })

        test('401 — unauthenticated request is rejected', async () => {
            const res = await request(app).get('/api/audit')
            expect(res.status).toBe(401)
        })
    })

    describe('GET /api/audit/transactions/:id', () => {
        test('200 — returns audit history for a transaction', async () => {
            const res = await request(app)
                .get(`/api/audit/transactions/${createdTransactionId}`)
                .set('Cookie', adminCookie)
            expect(res.status).toBe(200)
            expect(Array.isArray(res.body.data)).toBe(true)
            expect(res.body.data.length).toBeGreaterThanOrEqual(3)
        })

        test('200 — history contains CREATE, UPDATE and DELETE entries', async () => {
            const res = await request(app)
                .get(`/api/audit/transactions/${createdTransactionId}`)
                .set('Cookie', adminCookie)
            const actions = res.body.data.map(l => l.action)
            expect(actions).toContain('CREATE_TRANSACTION')
            expect(actions).toContain('UPDATE_TRANSACTION')
            expect(actions).toContain('DELETE_TRANSACTION')
        })

        test('200 — UPDATE entry contains before and after snapshots', async () => {
            const res = await request(app)
                .get(`/api/audit/transactions/${createdTransactionId}`)
                .set('Cookie', adminCookie)
            const updateLog = res.body.data.find(l => l.action === 'UPDATE_TRANSACTION')
            expect(updateLog.details).toHaveProperty('before')
            expect(updateLog.details).toHaveProperty('after')
            expect(updateLog.details.before.amount).toBe(100)
            expect(updateLog.details.after.amount).toBe(200)
        })

        test('200 — DELETE entry contains a snapshot', async () => {
            const res = await request(app)
                .get(`/api/audit/transactions/${createdTransactionId}`)
                .set('Cookie', adminCookie)
            const deleteLog = res.body.data.find(l => l.action === 'DELETE_TRANSACTION')
            expect(deleteLog.details).toHaveProperty('snapshot')
        })

        test('200 — returns empty array for transaction with no audit history', async () => {
            const res = await request(app)
                .get('/api/audit/transactions/999999')
                .set('Cookie', adminCookie)
            expect(res.status).toBe(200)
            expect(res.body.data).toEqual([])
        })

        test('403 — ANALYST cannot access transaction audit history', async () => {
            const res = await request(app)
                .get(`/api/audit/transactions/${createdTransactionId}`)
                .set('Cookie', analystCookie)
            expect(res.status).toBe(403)
        })

        test('401 — unauthenticated request is rejected', async () => {
            const res = await request(app)
                .get(`/api/audit/transactions/${createdTransactionId}`)
            expect(res.status).toBe(401)
        })
    })
})
