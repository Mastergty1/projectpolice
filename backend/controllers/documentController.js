const fs = require('fs').promises; 
// 💡 เปลี่ยนจาก extractText เป็น extractDataWithGemini
const { extractDataWithGemini } = require('../services/ocrService'); 
const { generateHash, isDuplicate } = require('../utils/duplicateChecker');
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
    try {
      console.log(`Processing: ${file.originalname} (Type: ${file.mimetype})`);

      // 💡 1. เรียกใช้ Gemini API โดยส่ง Path และ MimeType
      const geminiResult = await extractDataWithGemini(file.path, file.mimetype);
      const text = geminiResult.text;
      
      // extractedData ตอนนี้คือ Array ของ Memos ที่มี Assignments ซ้อนอยู่
      const extractedData = geminiResult.extractedData; 
      
      const hash = generateHash(text + Date.now().toString());
      
      // 2. อัปโหลดขึ้น Google Drive
      const driveData = await uploadToDrive(file, DRIVE_FOLDER_ID);

      // 💡 3. บันทึกลงตาราง documents
      // ข้อมูล JSON Array ทั้งก้อนจะถูกแปลงเป็น String และเก็บลงคอลัมน์ keywords_found แบบ JSONB
      const { rows } = await pool.query(
        `INSERT INTO documents (filename, content, content_hash, keywords_found, drive_file_id, drive_web_view_link)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        [
          file.originalname, 
          text, 
          hash, 
          JSON.stringify(extractedData), // แปลงข้อมูลให้ SQL เข้าใจ
          driveData.id, 
          driveData.webViewLink
        ]
      );

      // ลบไฟล์ชั่วคราว
      await fs.unlink(file.path);

      // ส่งข้อมูลกลับไปให้ Frontend ไปแสดงผล
      results.push({
        filename: file.originalname,
        status: 'success',
        extractedData: extractedData,
        documentId: rows[0].id,
        viewLink: driveData.webViewLink
      });

    } catch (err) {
      console.error(`Error processing ${file.originalname}:`, err.message);
      try {
        await fs.unlink(file.path);
      } catch (unlinkErr) {}

      results.push({
        filename: file.originalname,
        status: 'error',
        error: err.message
      });
    }
  }

  res.json({ total: files.length, results });
};