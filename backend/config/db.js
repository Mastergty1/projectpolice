const { Pool } = require("pg");

let connectionString = process.env.projectpolice_POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL || process.env.DB || "";
// 💡 Vercel / Supabase มักจะแถม ?sslmode=require มาใน URL ซึ่งไปตีกับค่า config ssl ด้านล่าง
connectionString = connectionString.replace("?sslmode=require", "");

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false } 
});

// 💡 FIX: รับ client มาเพื่อเช็คสถานะ จากนั้นทำการ release ทันทีเพื่อป้องกัน Connection Leak!
pool.connect()
  .then((client) => {
    console.log("PostgreSQL Connected");
    client.release();
  })
  .catch((err) => console.error("Connection error", err));

module.exports = pool;