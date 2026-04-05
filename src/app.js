const express = require('express')
const cors = require('cors')
const rateLimit = require('express-rate-limit')
const swaggerUi = require('swagger-ui-express')
const swaggerSpec = require('./config/swagger')
const authRoutes = require('./routes/authRoutes')
const transactionRoutes = require('./routes/transactionRoutes')
const errorMiddleware = require('./middlewares/error.middleware')

const app = express()

app.use(cors({
    origin: process.env.ALLOWED_ORIGIN || 'http://localhost:3000',
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}))

app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }))
app.use(express.json())

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))
app.use('/auth', authRoutes)
app.use('/transactions', transactionRoutes)

app.use(errorMiddleware)

module.exports = app
