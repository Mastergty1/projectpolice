const { createClient } = require('@supabase/supabase-js');

// 1. สำคัญมาก: โหลด config.env ก่อนเพื่อดึงค่า
// (ปกติ server.js ทำแล้ว แต่เผื่อกรณีเรียกใช้จากไฟล์อื่นโดยตรง)
if (!process.env.SUPABASE_URL) {
  require('dotenv').config({ path: '../config.env' });
}

const supabaseUrl = process.env.SUPABASE_URL;
// เราจะใช้ Publishable Key หรือ Service Role Key ก็ได้ 
// ในที่นี้ใช้ Publishable Key ตามที่กำหนดใน .env
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Supabase URL or Key is missing in environment variables!");
}

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;
