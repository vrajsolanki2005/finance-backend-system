const mongoose = require("mongoose");

const conn = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("db connected");
    } catch (err) {
        console.error("DB connection failed", err.message);
        process.exit(1);
    }
};

module.exports = conn;
