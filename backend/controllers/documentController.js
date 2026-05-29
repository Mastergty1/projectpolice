const fs = require('fs').promises; 
const { extractDataWithGemini } = require('../services/ocrService'); 
const { generateHash } = require('../utils/duplicateChecker');
const pool = require('../config/db');
const { uploadToDrive } = require('../services/googleDriveService');

const DRIVE_FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID; 

exports.processDocuments = async (req, res) => {
  const files = req.files;
  if (!files || files.length === 0) return res.status(400).json({ success: false, message: 'No files uploaded.' });
  const results = [];
  
  // ดึง ID และ ชื่อ จาก req.user ที่ได้จาก protect middleware
  const userId = req.user ? req.user.id : null;
  const userName = req.user ? req.user.name : "Unknown"; // ปรับ .name ให้ตรงกับชื่อฟิลด์ใน User model ของคุณ

  for (const file of files) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const geminiResult = await extractDataWithGemini(file.path, file.mimetype);
      const { text, extractedData } = geminiResult;
      const hash = generateHash(text + Date.now().toString());
      const driveData = await uploadToDrive(file, DRIVE_FOLDER_ID);

      // เพิ่มฟิลด์ created_by และส่ง userId เข้าไปใน Database
      const docRes = await client.query(
        `INSERT INTO documents (filename, content, content_hash, keywords_found, drive_file_id, drive_web_view_link, created_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
        [file.originalname, text, hash, JSON.stringify(extractedData), driveData.id, driveData.webViewLink, userId]
      );
      
      await client.query('COMMIT'); 
      
      try { await fs.unlink(file.path); } catch (e) { console.error("Warning: Cannot delete file", e.message); }

      // ตั้งค่า default ชื่อคนรับผิดชอบให้เป็นชื่อคนอัพโหลด
      let dataWithDefaultUser = extractedData || {};
      dataWithDefaultUser.assignee = userName; // ปรับคีย์ 'assignee' ให้ตรงกับ Frontend ที่คุณใช้งาน

      results.push({
        filename: file.originalname,
        status: 'success',
        extractedData: dataWithDefaultUser, // ส่งข้อมูลที่มีชื่อ Default กลับไป
        documentId: docRes.rows[0].id, 
        viewLink: driveData.webViewLink
      });

    } catch (err) {
      await client.query('ROLLBACK'); 
      try { await fs.unlink(file.path); } catch (e) {}
      results.push({ filename: file.originalname, status: 'error', error: err.message });
    } finally {
      client.release();
    }
  }
  res.json({ total: files.length, results });
};