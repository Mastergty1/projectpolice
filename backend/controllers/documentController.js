const fs = require('fs').promises; 
const { extractDataWithGemini } = require('../services/ocrService'); 
const { generateHash } = require('../utils/duplicateChecker');
const pool = require('../config/db');
const { uploadToDrive } = require('../services/googleDriveService');

const DRIVE_FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID; 

exports.processDocuments = async (req, res) => {
  const files = req.files;

  if (!files || files.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'No files uploaded. Please attach files using field name "files".'
    });
  }

  const results = [];

  for (const file of files) {
    // 💡 ดึง client จาก pool เพื่อทำ Transaction (ป้องกันบัคข้อมูลเข้าไม่ครบ)
    const client = await pool.connect();

    try {
      await client.query('BEGIN'); // เริ่มต้น Transaction

      console.log(`Processing: ${file.originalname} (Type: ${file.mimetype})`);

      // 1. เรียกใช้ Gemini API
      const geminiResult = await extractDataWithGemini(file.path, file.mimetype);
      const text = geminiResult.text;
      const extractedData = geminiResult.extractedData; // Array of memos
      
      const hash = generateHash(text + Date.now().toString());
      
      // 2. อัปโหลดขึ้น Google Drive
      const driveData = await uploadToDrive(file, DRIVE_FOLDER_ID);

      // 3. บันทึกไฟล์ต้นฉบับลงตาราง documents
      const docRes = await client.query(
        `INSERT INTO documents (filename, content, content_hash, keywords_found, drive_file_id, drive_web_view_link)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
        [file.originalname, text, hash, JSON.stringify(extractedData), driveData.id, driveData.webViewLink]
      );
      const documentId = docRes.rows[0].id;

      // 💡 4. แยกข้อมูลลงตาราง งานชุดใหญ่ -> ผู้รับผิดชอบ -> รายละเอียดย่อย
      if (extractedData && extractedData.length > 0) {
        for (const memo of extractedData) {
          
          // 4.1 สร้างงานชุดใหญ่ (Task)
          const taskRes = await client.query(
            `INSERT INTO tasks (document_id, title, memo_no, memo_date, main_text)
             VALUES ($1, $2, $3, $4, $5) RETURNING id`,
            [documentId, memo.เรื่อง || 'ไม่ระบุชื่อเรื่อง', memo.ที่, memo.วันที่, memo.main_text]
          );
          const taskId = taskRes.rows[0].id;

          // 4.2 จัดการผู้รับผิดชอบ (Assignments)
          if (memo.assignments && memo.assignments.length > 0) {
            for (const assign of memo.assignments) {
              const personStr = assign.responsible_person || '';
              let userId = null;

              // 💡 4.3 ค้นหาผู้รับผิดชอบจากตาราง Users ด้วยชื่อ หรือ Role
              if (personStr) {
                // ค้นหาโดยเช็คว่า คำที่แสกนได้ ตรงกับส่วนใดส่วนหนึ่งของ ชื่อ หรือ Role ของ user หรือไม่ (ILIKE)
                const userSearch = await client.query(
                  `SELECT id FROM users WHERE name ILIKE $1 OR role ILIKE $1 LIMIT 1`,
                  [`%${personStr.trim()}%`]
                );
                
                if (userSearch.rows.length > 0) {
                  userId = userSearch.rows[0].id; // พบ User ในระบบ
                }
              }

              // บันทึกผู้รับผิดชอบลง Task Assignment
              const assignRes = await client.query(
                `INSERT INTO task_assignments (task_id, user_id, role_or_name)
                 VALUES ($1, $2, $3) RETURNING id`,
                [taskId, userId, personStr]
              );
              const assignmentId = assignRes.rows[0].id;

              // 4.4 บันทึกรายละเอียดย่อยของแต่ละคน (Topics)
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

      await client.query('COMMIT'); // ยืนยันการบันทึกฐานข้อมูลสำเร็จทั้งหมด

      // ลบไฟล์ชั่วคราว
      await fs.unlink(file.path);

      results.push({
        filename: file.originalname,
        status: 'success',
        extractedData: extractedData,
        documentId: documentId,
        viewLink: driveData.webViewLink
      });

    } catch (err) {
      await client.query('ROLLBACK'); // 💡 ถอยกลับ (Undo) ข้อมูลทั้งหมดหากเกิด Error
      console.error(`Error processing ${file.originalname}:`, err.message);
      
      try { await fs.unlink(file.path); } catch (unlinkErr) {}

      results.push({
        filename: file.originalname,
        status: 'error',
        error: err.message
      });
    } finally {
      client.release(); // คืน connection กลับเข้า pool
    }
  }

  res.json({ total: files.length, results });
};