const bcrypt = require("bcryptjs");

const hashedPassword = (password) => bcrypt.hash(password, 10);

const comparePassword = (password, hash) => bcrypt.compare(password, hash);

module.exports = { hashedPassword, comparePassword };
