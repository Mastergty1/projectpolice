const pool = require('../config/db');

exports.getAllTasks = async (req, res) => {
  try {
    // ดึงงาน และ JOIN ตารางผู้รับผิดชอบกับตารางผู้ใช้
    // ใช้ COALESCE เพื่อเลือกว่าจะใช้ชื่อจาก user.name (ถ้ามีในระบบ) หรือ role_or_name (ชื่อดิบจากเอกสาร)
    const query = `
      SELECT 
        ta.id AS id, -- ใช้ ID ของ assignment เป็นหลักเพื่อไม่ให้ Key ซ้ำเวลาแสดงผลบน Frontend
        t.title AS name, 
        COALESCE(u.name, ta.role_or_name, 'ไม่ระบุ') AS "personInCharge", 
        TO_CHAR(t.due_date, 'YYYY-MM-DD') AS date, 
        t.status 
      FROM tasks t
      LEFT JOIN task_assignments ta ON t.id = ta.task_id
      LEFT JOIN users u ON ta.user_id = u.id
      ORDER BY t.due_date ASC NULLS LAST
    `;
    const { rows } = await pool.query(query);
    res.status(200).json(rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.getUrgentTasks = async (req, res) => {
  try {
    const query = `
      SELECT 
        ta.id AS id, 
        t.title AS name, 
        COALESCE(u.name, ta.role_or_name, 'ไม่ระบุ') AS "personInCharge", 
        TO_CHAR(t.due_date, 'YYYY-MM-DD') AS date, 
        t.status 
      FROM tasks t
      LEFT JOIN task_assignments ta ON t.id = ta.task_id
      LEFT JOIN users u ON ta.user_id = u.id
      WHERE t.is_urgent = true
      ORDER BY t.due_date ASC NULLS LAST
    `;
    const { rows } = await pool.query(query);
    res.status(200).json(rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
