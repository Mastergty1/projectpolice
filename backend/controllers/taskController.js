const pool = require('../config/db');

// 1. ดึงงานทั้งหมดไปแสดงผล
exports.getAllTasks = async (req, res) => {
  try {
    const query = `
      SELECT 
        t.id AS id, 
        t.title AS name, 
        COALESCE(STRING_AGG(DISTINCT COALESCE(u.name, ta.role_or_name), ', '), 'ไม่ระบุ') AS "personInCharge", 
        TO_CHAR(t.due_date, 'YYYY-MM-DD') AS date, 
        t.status 
      FROM tasks t
      LEFT JOIN task_assignments ta ON t.id = ta.task_id
      LEFT JOIN users u ON ta.user_id = u.id
      GROUP BY t.id
      ORDER BY t.due_date ASC NULLS LAST
    `;
    const { rows } = await pool.query(query);
    res.status(200).json(rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// 2. ดึงเฉพาะงานด่วน
exports.getUrgentTasks = async (req, res) => {
  try {
    const query = `
      SELECT 
        t.id AS id, 
        t.title AS name, 
        COALESCE(STRING_AGG(DISTINCT COALESCE(u.name, ta.role_or_name), ', '), 'ไม่ระบุ') AS "personInCharge", 
        TO_CHAR(t.due_date, 'YYYY-MM-DD') AS date, 
        t.status 
      FROM tasks t
      LEFT JOIN task_assignments ta ON t.id = ta.task_id
      LEFT JOIN users u ON ta.user_id = u.id
      WHERE t.is_urgent = true
      GROUP BY t.id
      ORDER BY t.due_date ASC NULLS LAST
    `;
    const { rows } = await pool.query(query);
    res.status(200).json(rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// 3. อัปเดตสถานะงาน (จาก Dropdown ในหน้าแรก)
exports.updateTaskStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const result = await pool.query(
      `UPDATE tasks SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    res.status(200).json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error("Update status error:", err.message);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// 4. บันทึกงานทั้งหมดหลังจากผู้ใช้กดยืนยัน (รับข้อมูลจากหน้า Uploaded)
exports.confirmTasks = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { documentId, memos } = req.body;

    if (memos && memos.length > 0) {
      for (const memo of memos) {
        
        // 💡 มีการรับค่า memo.due_date เพื่อบันทึกลง Database เรียบร้อยแล้ว
        const taskRes = await client.query(
          `INSERT INTO tasks (document_id, title, memo_no, memo_date, main_text, due_date)
           VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
          [
            documentId, 
            memo.เรื่อง || 'ไม่ระบุชื่อเรื่อง', 
            memo.ที่, 
            memo.วันที่, 
            memo.main_text, 
            memo.due_date || null 
          ]
        );
        const taskId = taskRes.rows[0].id;

        if (memo.assignments && memo.assignments.length > 0) {
          for (const assign of memo.assignments) {
            const userId = assign.user_id ? parseInt(assign.user_id) : null; 
            const personStr = assign.responsible_person || '';

            const assignRes = await client.query(
              `INSERT INTO task_assignments (task_id, user_id, role_or_name)
               VALUES ($1, $2, $3) RETURNING id`,
              [taskId, userId, personStr]
            );
            const assignmentId = assignRes.rows[0].id;

            if (assign.topics && assign.topics.length > 0) {
              for (const topic of assign.topics) {
                await client.query(
                  `INSERT INTO task_topics (assignment_id, detail) VALUES ($1, $2)`,
                  [assignmentId, topic]
                );
              }
            }
          }
        }
      }
    }
    await client.query('COMMIT');
    res.status(200).json({ success: true, message: 'บันทึกงานสำเร็จ!' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error("Confirm error:", err.message);
    res.status(500).json({ success: false, message: 'Server Error' });
  } finally {
    client.release();
  }
};