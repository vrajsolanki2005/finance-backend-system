const jwt = require("jsonwebtoken");

const jwtAuth = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer "))
        return res.status(401).json({ success: false, message: "No token provided" });

    const token = authHeader.split(" ")[1];

    try {
        req.user = jwt.verify(token, process.env.JWT_SECRET);
        next();
    } catch {
        res.status(401).json({ success: false, message: "Invalid or expired token" });
    }
};

module.exports = jwtAuth;
