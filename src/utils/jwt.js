const jwt = require('jsonwebtoken')

const genToken = (user) =>
    jwt.sign(
        { id: user._id, name: user.name, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '15m' }
    )

const genRefreshToken = (user) =>
    jwt.sign(
        { id: user._id },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: '30d' }
    )

module.exports = { genToken, genRefreshToken }