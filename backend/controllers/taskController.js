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

// 3. อัปเดตสถานะงาน
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

// 5. อัปเดตรายละเอียดงาน (แก้ไขชื่อ, กำหนดส่ง, บันทึกเพิ่มเติม และรายการย่อยในตารางแยก)
exports.updateTaskDetail = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { id } = req.params;
    const { name, date, notes, assignments } = req.body;

    // 1. อัปเดตตาราง Tasks หล้ก
    await client.query(
      `UPDATE tasks 
       SET title = $1, due_date = $2, notes = $3, updated_at = NOW() 
       WHERE id = $4`,
      [name, date, notes, id]
    );

    // 2. 💡 วนลูปอัปเดตข้อมูลพนักงานที่รับผิดชอบงานย่อย และข้อมูลรายละเอียดของหัวข้อย่อย
    if (assignments && Array.isArray(assignments)) {
      for (const assign of assignments) {
        const userId = assign.user_id ? parseInt(assign.user_id) : null;
        
        // อัปเดต user_id ของใบมอบหมายงานใบนี้
        await client.query(
          `UPDATE task_assignments 
           SET user_id = $1 
           WHERE id = $2 AND task_id = $3`,
          [userId, assign.assignment_id, id]
        );

        // อัปเดตตัวข้อความภายในรายละเอียด (topics)
        if (assign.topics && Array.isArray(assign.topics)) {
          for (const topic of assign.topics) {
            if (topic.topic_id) {
              await client.query(
                `UPDATE task_topics 
                 SET detail = $1 
                 WHERE id = $2 AND assignment_id = $3`,
                [topic.detail, topic.topic_id, assign.assignment_id]
              );
            }
          }
        }
      }
    }

    await client.query('COMMIT');
    res.status(200).json({ success: true, message: 'บันทึกความเปลี่ยนแปลงเรียบร้อย' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error("Update task detail error:", err.message);
    res.status(500).json({ success: false, message: 'Server Error' });
  } finally {
    client.release();
  }
};

// ดึงข้อมูลงานตาม ID 
exports.getTaskById = async (req, res) => {
  try {
    const { id } = req.params;
    const query = `
      SELECT 
        t.id, 
        t.title AS name, 
        t.status, 
        TO_CHAR(t.due_date, 'YYYY-MM-DD') AS date, 
        t.main_text,
        t.notes,      
        t.memo_no, 
        t.memo_date,
        d.drive_web_view_link AS document_link,
        COALESCE(
          json_agg(
            json_build_object(
              'assignment_id', ta.id,
              'user_id', ta.user_id,             -- 💡 ดึง id ไปทำ default value ใน Dropdown
              'role_or_name', ta.role_or_name,   
              'personInCharge', COALESCE(u.name, ta.role_or_name),
              'topics', (
                SELECT COALESCE(
                  json_agg(
                    json_build_object(
                      'topic_id', tt.id,          -- 💡 ดึง ID หัวข้อย่อยมาใช้เพื่ออัปเดตลงฐานข้อมูล
                      'detail', tt.detail,
                      'status', tt.status
                    )
                  ), '[]'::json)
                FROM task_topics tt 
                WHERE tt.assignment_id = ta.id
              )
            )
          ) FILTER (WHERE ta.id IS NOT NULL), '[]'
        ) AS assignments
      FROM tasks t
      LEFT JOIN task_assignments ta ON t.id = ta.task_id
      LEFT JOIN users u ON ta.user_id = u.id
      LEFT JOIN documents d ON t.document_id = d.id 
      WHERE t.id = $1
      GROUP BY t.id, d.drive_web_view_link
    `;
    const { rows } = await pool.query(query, [id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    const task = rows[0];
    task.personInCharge = task.assignments.map(a => a.personInCharge).join(', ') || 'ไม่ระบุ';

    res.status(200).json({ success: true, data: task });
  } catch (err) {
    console.error("Get task by id error:", err.message);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// ลบงาน
exports.deleteTask = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { id } = req.params;

    const assignmentsRes = await client.query('SELECT id FROM task_assignments WHERE task_id = $1', [id]);
    const assignmentIds = assignmentsRes.rows.map(row => row.id);

    if (assignmentIds.length > 0) {
      await client.query('DELETE FROM task_topics WHERE assignment_id = ANY($1)', [assignmentIds]);
    }

    await client.query('DELETE FROM task_assignments WHERE task_id = $1', [id]);
    const result = await client.query('DELETE FROM tasks WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    await client.query('COMMIT');
    res.status(200).json({ success: true, message: 'ลบข้อมูลสำเร็จ' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error("Delete task error:", err.message);
    res.status(500).json({ success: false, message: 'Server Error' });
  } finally {
    client.release();
  }
};