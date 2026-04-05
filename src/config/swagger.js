const swaggerJsdoc = require('swagger-jsdoc')

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'FinCore API',
            version: '1.0.0',
            description: 'Secure Financial Backend System API',
        },
        servers: [{ url: 'http://localhost:5000' }],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
            schemas: {
                Transaction: {
                    type: 'object',
                    properties: {
                        transactionId: { type: 'integer', example: 1 },
                        amount: { type: 'number', example: 45.00 },
                        type: { type: 'string', enum: ['income', 'expense'], example: 'expense' },
                        category: { type: 'string', example: 'Food' },
                        date: { type: 'string', format: 'date', example: '2026-04-05' },
                        isDeleted: { type: 'boolean', example: false },
                    },
                },
                Error: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean', example: false },
                        message: { type: 'string', example: 'Error message' },
                    },
                },
            },
        },
    },
    apis: ['./src/routes/*.js'],
}

module.exports = swaggerJsdoc(options)
