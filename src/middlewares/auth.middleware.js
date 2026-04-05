const jwt = require('jsonwebtoken')

const jwtAuth = (req, res, next) => {
    const token = req.cookies?.accessToken
    if (!token)
        return res.status(401).json({ success: false, message: 'No token provided' })

    try {
        req.user = jwt.verify(token, process.env.JWT_SECRET)
        next()
    } catch {
        res.status(401).json({ success: false, message: 'Invalid or expired token' })
    }
}

module.exports = jwtAuth
