const User = require('../models/userModel')
const { hashedPassword, comparePassword } = require('../utils/hashing')
const { genToken, genRefreshToken } = require('../utils/jwt')

const registerUser = async (data) => {
    const existing = await User.findOne({ email: data.email })
    if (existing) throw { status: 409, message: 'Email already in use' }

    const hashed = await hashedPassword(data.password)
    const user = await User.create({ ...data, password: hashed })

    return { id: user._id, name: user.name, email: user.email, role: user.role }
}

const loginUser = async (data) => {
    const user = await User.findOne({ email: data.email })
    if (!user) throw { status: 401, message: 'Invalid email or password' }

    const isMatch = await comparePassword(data.password, user.password)
    if (!isMatch) throw { status: 401, message: 'Invalid email or password' }

    const accessToken = genToken(user)
    const refreshToken = genRefreshToken(user)

    await User.findByIdAndUpdate(user._id, { refreshToken })

    return { accessToken, refreshToken }
}

const logoutUser = async (userId) => {
    await User.findByIdAndUpdate(userId, { refreshToken: null })
}

module.exports = { registerUser, loginUser, logoutUser }
