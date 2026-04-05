const request = require('supertest')
const app = require('../src/app')
const User = require('../src/models/userModel')
const Transaction = require('../src/models/transactionModel')
const { hashedPassword } = require('../src/utils/hashing')

let adminToken = ''
let analystToken = ''
let viewerToken = ''
let createdTransactionId

const seed = async (email, role) => {
    await User.deleteOne({ email })
    const user = await User.create({ name: role, email, password: await hashedPassword('123456'), role })
    const res = await request(app).post('/api/auth/login').send({ email, password: '123456' })
    return { token: res.body.data.token, userId: user._id }
}

beforeAll(async () => {
    ;({ token: adminToken } = await seed('admin_tx@test.com', 'ADMIN'))
    ;({ token: analystToken } = await seed('analyst_tx@test.com', 'ANALYST'))
    ;({ token: viewerToken } = await seed('viewer_tx@test.com', 'VIEWER'))
})

afterAll(async () => {
    await User.deleteMany({ email: { $in: ['admin_tx@test.com', 'analyst_tx@test.com', 'viewer_tx@test.com'] } })
    await Transaction.deleteMany({ category: 'test_suite' })
})

describe('Transaction API', () => {

    describe('POST /api/transactions', () => {
        test('201 — ADMIN creates a transaction', async () => {
            const res = await request(app)
                .post('/api/transactions')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ amount: 1000, type: 'income', category: 'test_suite', date: '2026-04-05' })
            expect(res.status).toBe(201)
            expect(res.body.data).toMatchObject({ amount: 1000, type: 'income', category: 'test_suite' })
            createdTransactionId = res.body.data.transactionId
        })

        test('403 — ANALYST cannot create a transaction', async () => {
            const res = await request(app)
                .post('/api/transactions')
                .set('Authorization', `Bearer ${analystToken}`)
                .send({ amount: 500, type: 'expense', category: 'test_suite', date: '2026-04-05' })
            expect(res.status).toBe(403)
        })

        test('403 — VIEWER cannot create a transaction', async () => {
            const res = await request(app)
                .post('/api/transactions')
                .set('Authorization', `Bearer ${viewerToken}`)
                .send({ amount: 500, type: 'expense', category: 'test_suite', date: '2026-04-05' })
            expect(res.status).toBe(403)
        })

        test('401 — unauthenticated request is rejected', async () => {
            const res = await request(app)
                .post('/api/transactions')
                .send({ amount: 500, type: 'expense', category: 'test_suite' })
            expect(res.status).toBe(401)
        })

        test('400 — rejects missing type', async () => {
            const res = await request(app)
                .post('/api/transactions')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ amount: 100, category: 'test_suite' })
            expect(res.status).toBe(400)
        })

        test('400 — rejects invalid type value', async () => {
            const res = await request(app)
                .post('/api/transactions')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ amount: 100, type: 'transfer', category: 'test_suite' })
            expect(res.status).toBe(400)
        })

        test('400 — rejects zero or negative amount', async () => {
            const res = await request(app)
                .post('/api/transactions')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ amount: -50, type: 'income', category: 'test_suite' })
            expect(res.status).toBe(400)
        })

        test('400 — rejects missing category', async () => {
            const res = await request(app)
                .post('/api/transactions')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ amount: 100, type: 'income' })
            expect(res.status).toBe(400)
        })
    })

    describe('GET /api/transactions', () => {
        test('200 — ADMIN fetches transactions', async () => {
            const res = await request(app)
                .get('/api/transactions')
                .set('Authorization', `Bearer ${adminToken}`)
            expect(res.status).toBe(200)
            expect(res.body.data).toHaveProperty('data')
            expect(res.body.data).toHaveProperty('total')
            expect(res.body.data).toHaveProperty('page')
            expect(res.body.data).toHaveProperty('totalPages')
            expect(Array.isArray(res.body.data.data)).toBe(true)
        })

        test('200 — ANALYST can fetch transactions', async () => {
            const res = await request(app)
                .get('/api/transactions')
                .set('Authorization', `Bearer ${analystToken}`)
            expect(res.status).toBe(200)
        })

        test('403 — VIEWER cannot fetch transactions', async () => {
            const res = await request(app)
                .get('/api/transactions')
                .set('Authorization', `Bearer ${viewerToken}`)
            expect(res.status).toBe(403)
        })

        test('401 — unauthenticated request is rejected', async () => {
            const res = await request(app).get('/api/transactions')
            expect(res.status).toBe(401)
        })

        test('200 — pagination returns correct page shape', async () => {
            const res = await request(app)
                .get('/api/transactions?page=1&limit=2')
                .set('Authorization', `Bearer ${adminToken}`)
            expect(res.status).toBe(200)
            expect(res.body.data.page).toBe(1)
            expect(res.body.data.data.length).toBeLessThanOrEqual(2)
        })

        test('200 — filter by type=income returns only income', async () => {
            const res = await request(app)
                .get('/api/transactions?type=income')
                .set('Authorization', `Bearer ${adminToken}`)
            expect(res.status).toBe(200)
            res.body.data.data.forEach(t => expect(t.type).toBe('income'))
        })

        test('200 — filter by category returns matching results', async () => {
            const res = await request(app)
                .get('/api/transactions?category=test_suite')
                .set('Authorization', `Bearer ${adminToken}`)
            expect(res.status).toBe(200)
            res.body.data.data.forEach(t => expect(t.category).toBe('test_suite'))
        })
    })

    describe('GET /api/transactions/:id', () => {
        test('200 — fetches a transaction by id', async () => {
            const res = await request(app)
                .get(`/api/transactions/${createdTransactionId}`)
                .set('Authorization', `Bearer ${adminToken}`)
            expect(res.status).toBe(200)
            expect(res.body.data.transactionId).toBe(createdTransactionId)
        })

        test('404 — returns 404 for non-existent id', async () => {
            const res = await request(app)
                .get('/api/transactions/999999')
                .set('Authorization', `Bearer ${adminToken}`)
            expect(res.status).toBe(404)
        })

        test('400 — rejects non-integer id', async () => {
            const res = await request(app)
                .get('/api/transactions/abc')
                .set('Authorization', `Bearer ${adminToken}`)
            expect(res.status).toBe(400)
        })
    })

    describe('PATCH /api/transactions/:id', () => {
        test('200 — ADMIN updates a transaction', async () => {
            const res = await request(app)
                .patch(`/api/transactions/${createdTransactionId}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ amount: 2000 })
            expect(res.status).toBe(200)
            expect(res.body.data.amount).toBe(2000)
        })

        test('403 — ANALYST cannot update a transaction', async () => {
            const res = await request(app)
                .patch(`/api/transactions/${createdTransactionId}`)
                .set('Authorization', `Bearer ${analystToken}`)
                .send({ amount: 500 })
            expect(res.status).toBe(403)
        })

        test('400 — rejects invalid amount on update', async () => {
            const res = await request(app)
                .patch(`/api/transactions/${createdTransactionId}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ amount: -100 })
            expect(res.status).toBe(400)
        })
    })

    describe('DELETE /api/transactions/:id', () => {
        test('200 — ADMIN soft deletes a transaction', async () => {
            const res = await request(app)
                .delete(`/api/transactions/${createdTransactionId}`)
                .set('Authorization', `Bearer ${adminToken}`)
            expect(res.status).toBe(200)
        })

        test('404 — deleted transaction no longer accessible by id', async () => {
            const res = await request(app)
                .get(`/api/transactions/${createdTransactionId}`)
                .set('Authorization', `Bearer ${adminToken}`)
            expect(res.status).toBe(404)
        })

        test('403 — ANALYST cannot delete a transaction', async () => {
            const res = await request(app)
                .delete(`/api/transactions/${createdTransactionId}`)
                .set('Authorization', `Bearer ${analystToken}`)
            expect(res.status).toBe(403)
        })
    })
})
