const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.projectpolice_POSTGRES_URL_NON_POOLING,
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