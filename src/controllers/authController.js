const authService = require('../services/authService')
const sendResponse = require('../utils/response')

const register = async (req, res, next) => {
    try {
        const data = await authService.registerUser(req.body)
        sendResponse(res, 201, 'User registered', data)
    } catch (err) {
        next(err)
    }
}

const login = async (req, res, next) => {
    try {
        const data = await authService.loginUser(req.body)
        sendResponse(res, 200, 'Login successful', data)
    } catch (err) {
        next(err)
    }
}

module.exports = { register, login }
