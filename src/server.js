require("dotenv").config();
const app = require("./app");
const conn = require("./config/db")

const PORT = process.env.PORT;

conn().then(() => {
    app.listen(PORT, () => {
        console.log(`server is running at port ${PORT}`);
    });
});