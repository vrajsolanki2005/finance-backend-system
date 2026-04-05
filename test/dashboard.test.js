const request = require('supertest')
const app = require('../src/app')
const User = require('../src/models/userModel')
const Transaction = require('../src/models/transactionModel')
const { hashedPassword } = require('../src/utils/hashing')

let adminCookie, analystCookie, viewerCookie

const seed = async (email, role) => {
    await User.deleteOne({ email })
    await User.create({ name: role, email, password: await hashedPassword('123456'), role })
    const res = await request(app).post('/api/auth/login').send({ email, password: '123456' })
    return res.headers['set-cookie']
}

beforeAll(async () => {
    adminCookie = await seed('admin_dash@test.com', 'ADMIN')
    analystCookie = await seed('analyst_dash@test.com', 'ANALYST')
    viewerCookie = await seed('viewer_dash@test.com', 'VIEWER')

    await request(app).post('/api/transactions').set('Cookie', adminCookie)
        .send({ amount: 3000, type: 'income', category: 'salary', date: '2026-01-01' })
    await request(app).post('/api/transactions').set('Cookie', adminCookie)
        .send({ amount: 500, type: 'expense', category: 'food', date: '2026-01-02' })
})

afterAll(async () => {
    const users = await User.find({ email: { $in: ['admin_dash@test.com', 'analyst_dash@test.com', 'viewer_dash@test.com'] } })
    const ids = users.map(u => u._id)
    await Transaction.deleteMany({ userId: { $in: ids } })
    await User.deleteMany({ _id: { $in: ids } })
})

describe('Dashboard API', () => {

    describe('GET /api/dashboard/summary', () => {
        test('200 — ADMIN gets summary with correct shape', async () => {
            const res = await request(app).get('/api/dashboard/summary').set('Cookie', adminCookie)
            expect(res.status).toBe(200)
            expect(res.body.data).toHaveProperty('totalIncome')
            expect(res.body.data).toHaveProperty('totalExpense')
            expect(res.body.data).toHaveProperty('netBalance')
            expect(res.body.data).toHaveProperty('categoryMap')
            expect(res.body.data).toHaveProperty('recentTransactions')
            expect(Array.isArray(res.body.data.recentTransactions)).toBe(true)
        })

        test('200 — netBalance equals totalIncome minus totalExpense', async () => {
            const res = await request(app).get('/api/dashboard/summary').set('Cookie', adminCookie)
            const { totalIncome, totalExpense, netBalance } = res.body.data
            expect(netBalance).toBe(totalIncome - totalExpense)
        })

        test('200 — summary is scoped to the requesting user only', async () => {
            const res = await request(app).get('/api/dashboard/summary').set('Cookie', analystCookie)
            expect(res.status).toBe(200)
            expect(res.body.data.totalIncome).toBe(0)
            expect(res.body.data.totalExpense).toBe(0)
        })

        test('200 — ANALYST can access summary', async () => {
            const res = await request(app).get('/api/dashboard/summary').set('Cookie', analystCookie)
            expect(res.status).toBe(200)
        })

        test('403 — VIEWER is denied access', async () => {
            const res = await request(app).get('/api/dashboard/summary').set('Cookie', viewerCookie)
            expect(res.status).toBe(403)
        })

        test('401 — unauthenticated request is rejected', async () => {
            const res = await request(app).get('/api/dashboard/summary')
            expect(res.status).toBe(401)
        })
    })

    describe('GET /api/dashboard/trends', () => {
        test('200 — ADMIN gets trends as an array', async () => {
            const res = await request(app).get('/api/dashboard/trends').set('Cookie', adminCookie)
            expect(res.status).toBe(200)
            expect(Array.isArray(res.body.data)).toBe(true)
        })

        test('200 — each trend entry has correct shape', async () => {
            const res = await request(app).get('/api/dashboard/trends').set('Cookie', adminCookie)
            res.body.data.forEach(entry => {
                expect(entry).toHaveProperty('_id')
                expect(entry._id).toHaveProperty('month')
                expect(entry._id).toHaveProperty('year')
                expect(entry).toHaveProperty('totalIncome')
                expect(entry).toHaveProperty('totalExpense')
            })
        })

        test('200 — ANALYST can access trends', async () => {
            const res = await request(app).get('/api/dashboard/trends').set('Cookie', analystCookie)
            expect(res.status).toBe(200)
        })

        test('403 — VIEWER is denied access to trends', async () => {
            const res = await request(app).get('/api/dashboard/trends').set('Cookie', viewerCookie)
            expect(res.status).toBe(403)
        })

        test('401 — unauthenticated request is rejected', async () => {
            const res = await request(app).get('/api/dashboard/trends')
            expect(res.status).toBe(401)
        })
    })
})
