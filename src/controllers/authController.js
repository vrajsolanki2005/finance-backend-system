const authService = require("../services/authService");

//register new user
const register = async (req, res, next) => {
    try {
        const user = await authService.registerUser(req.body);
        res.status(201).json({ success: true, user });
    } catch (err) {
        next(err);
    }
};

//login user
const login = async (req, res, next) => {
    try {
        const data = await authService.loginUser(req.body);
        res.status(200).json({ success: true, ...data });
    } catch (err) {
        next(err);
    }
};

module.exports = { register, login };
