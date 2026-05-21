const dotenv = require("dotenv");

// 1. สำคัญมาก: โหลด config.env ก่อนที่จะ require ไฟล์อื่นๆ ที่ต้องใช้ process.env
dotenv.config({ path: "./config/config.env" });

// 2. นำเข้าไฟล์ db.js (เมื่อถูก require ไฟล์ db.js จะทำงานและเชื่อมต่อฐานข้อมูลให้ทันที)
const pool = require("./config/db");

const app = require("./app");

const PORT = process.env.PORT || 5003;

const server = app.listen(PORT, () => {
  console.log(
    "Server running in ",
    process.env.NODE_ENV,
    " mode on port ",
    PORT,
  );
});

process.on("unhandledRejection", (err, promise) => {
  console.log(`Error: ${err.message}`);
  server.close(() => process.exit(1));
});