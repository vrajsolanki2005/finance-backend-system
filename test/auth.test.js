const request = require('supertest')
const app = require('../src/app')
const User = require('../src/models/userModel')

const TEST_EMAIL = 'auth_test@test.com'
const VALID_USER = { name: 'Test User', email: TEST_EMAIL, password: '123456' }

describe('Auth API', () => {
    beforeAll(async () => { await User.deleteOne({ email: TEST_EMAIL }) })
    afterAll(async () => { await User.deleteOne({ email: TEST_EMAIL }) })

    describe('POST /api/auth/register', () => {
        test('201 — registers a new user', async () => {
            const res = await request(app).post('/api/auth/register').send(VALID_USER)
            expect(res.status).toBe(201)
            expect(res.body.data).toMatchObject({ email: TEST_EMAIL, role: 'VIEWER' })
        })

        test('201 — registers with explicit ADMIN role', async () => {
            await User.deleteOne({ email: 'admin_role@test.com' })
            const res = await request(app).post('/api/auth/register').send({
                name: 'Admin', email: 'admin_role@test.com', password: '123456', role: 'ADMIN'
            })
            expect(res.status).toBe(201)
            expect(res.body.data.role).toBe('ADMIN')
            await User.deleteOne({ email: 'admin_role@test.com' })
        })

        test('409 — rejects duplicate email', async () => {
            const res = await request(app).post('/api/auth/register').send(VALID_USER)
            expect(res.status).toBe(409)
        })

        test('400 — rejects missing name', async () => {
            const res = await request(app).post('/api/auth/register').send({ email: 'x@x.com', password: '123456' })
            expect(res.status).toBe(400)
        })

        test('400 — rejects invalid email', async () => {
            const res = await request(app).post('/api/auth/register').send({ name: 'X', email: 'not-an-email', password: '123456' })
            expect(res.status).toBe(400)
        })

        test('400 — rejects password shorter than 6 chars', async () => {
            const res = await request(app).post('/api/auth/register').send({ name: 'X', email: 'x@x.com', password: '123' })
            expect(res.status).toBe(400)
        })

        test('400 — rejects invalid role', async () => {
            const res = await request(app).post('/api/auth/register').send({ ...VALID_USER, email: 'x2@x.com', role: 'SUPERUSER' })
            expect(res.status).toBe(400)
        })

        test('password is never returned in response', async () => {
            const res = await request(app).post('/api/auth/register').send({ name: 'Y', email: 'y@y.com', password: '123456' })
            expect(JSON.stringify(res.body)).not.toContain('123456')
            await User.deleteOne({ email: 'y@y.com' })
        })
    })

    describe('POST /api/auth/login', () => {
        test('200 — sets HttpOnly accessToken and refreshToken cookies', async () => {
            const res = await request(app).post('/api/auth/login').send({ email: TEST_EMAIL, password: '123456' })
            expect(res.status).toBe(200)
            const cookies = res.headers['set-cookie']
            expect(cookies).toBeDefined()
            const cookieStr = cookies.join('; ')
            expect(cookieStr).toMatch(/accessToken=/)
            expect(cookieStr).toMatch(/refreshToken=/)
            expect(cookieStr).toMatch(/HttpOnly/i)
        })

        test('200 — token is not exposed in response body', async () => {
            const res = await request(app).post('/api/auth/login').send({ email: TEST_EMAIL, password: '123456' })
            expect(res.status).toBe(200)
            expect(res.body.data).toBeUndefined()
        })

        test('401 — rejects wrong password', async () => {
            const res = await request(app).post('/api/auth/login').send({ email: TEST_EMAIL, password: 'wrongpass' })
            expect(res.status).toBe(401)
        })

        test('401 — rejects non-existent email', async () => {
            const res = await request(app).post('/api/auth/login').send({ email: 'ghost@test.com', password: '123456' })
            expect(res.status).toBe(401)
        })

        test('400 — rejects missing password', async () => {
            const res = await request(app).post('/api/auth/login').send({ email: TEST_EMAIL })
            expect(res.status).toBe(400)
        })
    })

    describe('POST /api/auth/logout', () => {
        test('200 — clears cookies on logout', async () => {
            const loginRes = await request(app).post('/api/auth/login').send({ email: TEST_EMAIL, password: '123456' })
            const cookie = loginRes.headers['set-cookie']

            const res = await request(app).post('/api/auth/logout').set('Cookie', cookie)
            expect(res.status).toBe(200)
            const cleared = res.headers['set-cookie']?.join('; ') ?? ''
            expect(cleared).toMatch(/accessToken=;/)
        })

        test('401 — logout without cookie is rejected', async () => {
            const res = await request(app).post('/api/auth/logout')
            expect(res.status).toBe(401)
        })
    })
})
