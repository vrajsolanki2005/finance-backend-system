require('dotenv').config()
const express = require('express')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const rateLimit = require('express-rate-limit')
const swaggerUi = require('swagger-ui-express')
const swaggerSpec = require('./config/swagger')
const connectDB = require('./config/db')
const authRoutes = require('./routes/authRoutes')
const transactionRoutes = require('./routes/transactionRoutes')
const auditRoutes = require('./routes/auditRoutes')
const dashboardRoutes = require('./routes/dashboardRoutes')
const errorMiddleware = require('./middlewares/error.middleware')

const app = express()
connectDB()

app.use(cors({
    origin: process.env.ALLOWED_ORIGIN || 'http://localhost:3000',
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}))

app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }))
app.use(express.json())
app.use(cookieParser())

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))

app.get('/', (req, res) => {
    res.json({
        name: 'FinCore – Secure Financial Backend System',
        version: '1.0.0',
        description: 'A production-ready REST API for managing financial transactions with role-based access control, analytics dashboard, and a full audit trail.',
        docs: `${req.protocol}://${req.get('host')}/api-docs`,
        endpoints: {
            auth: `${req.protocol}://${req.get('host')}/api/auth`,
            transactions: `${req.protocol}://${req.get('host')}/api/transactions`,
            dashboard: `${req.protocol}://${req.get('host')}/api/dashboard`,
            audit: `${req.protocol}://${req.get('host')}/api/audit`,
        },
    })
})
app.use('/api/auth', authRoutes)
app.use('/api/transactions', transactionRoutes)
app.use('/api/audit', auditRoutes)
app.use('/api/dashboard', dashboardRoutes)

app.use(errorMiddleware)

module.exports = app
