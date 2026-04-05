const authService = require('../services/authService')
const sendResponse = require('../utils/response')

const COOKIE_OPTS = { httpOnly: true, sameSite: 'strict', secure: process.env.NODE_ENV === 'production' }

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
        const { accessToken, refreshToken } = await authService.loginUser(req.body)
        res.cookie('accessToken', accessToken, { ...COOKIE_OPTS, maxAge: 15 * 60 * 1000 })
        res.cookie('refreshToken', refreshToken, { ...COOKIE_OPTS, maxAge: 30 * 24 * 60 * 60 * 1000 })
        sendResponse(res, 200, 'Login successful')
    } catch (err) {
        next(err)
    }
}

const logout = async (req, res, next) => {
    try {
        await authService.logoutUser(req.user.id)
        res.clearCookie('accessToken', COOKIE_OPTS)
        res.clearCookie('refreshToken', COOKIE_OPTS)
        sendResponse(res, 200, 'Logged out')
    } catch (err) {
        next(err)
    }
}

module.exports = { register, login, logout }
