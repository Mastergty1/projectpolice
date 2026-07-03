const { Pool } = require("pg");

// 💡 Vercel Serverless ต้องใช้ Pooling URL ก่อนเสมอ (พอร์ต 6543 สำหรับ Supabase)
let connectionString = process.env.POSTGRES_URL || process.env.projectpolice_POSTGRES_URL || process.env.DB || process.env.POSTGRES_URL_NON_POOLING || "";
connectionString = connectionString.replace("?sslmode=require", "");

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
  max: 1, // 💡 จำกัด Connection 1 เส้นต่อ 1 Lambda Function ป้องกัน Max Clients Reached
  idleTimeoutMillis: 3000, // คืน Connection กลับเมื่อไม่ใช้ 3 วินาที
  connectionTimeoutMillis: 5000,
});

// 💡 นำ pool.connect() ตอนเริ่มต้นออก เพราะใน Vercel Serverless การเปิด Connection ค้างไว้ตอน Boot จะทำให้เกิด Connection Leak

module.exports = pool;