const User = require("../models/userModel");
const { hashedPassword, comparePassword } = require("../utils/hashing");
const { genToken } = require("../utils/jwt");

//create user
const registerUser = async (data) => {
    const existing = await User.findOne({ email: data.email });
    if (existing) throw { status: 409, message: "Email already in use" };

    const hashed = await hashedPassword(data.password);
    const user = await User.create({ ...data, password: hashed });

    return { id: user._id, name: user.name, email: user.email, role: user.role };
};

//login
const loginUser = async (data) => {
    const user = await User.findOne({ email: data.email });
    if (!user) throw { status: 401, message: "Invalid email or password" };

    const isMatch = await comparePassword(data.password, user.password);
    if (!isMatch) throw { status: 401, message: "Invalid email or password" };

    const token = genToken(user);
    return { token, user: { id: user._id, name: user.name, email: user.email, role: user.role } };
};

module.exports = { registerUser, loginUser };
