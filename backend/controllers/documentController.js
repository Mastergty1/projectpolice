const fs = require('fs').promises; // ใช้เวอร์ชัน .promises เพื่อรองรับโครงสร้าง async/await
const { extractText, findKeywords } = require('../services/ocrService');
const { generateHash, isDuplicate } = require('../utils/duplicateChecker');
const pool = require('../config/db');
const { uploadToDrive } = require('../services/googleDriveService');

// ดึงรหัส Folder ID มาจากไฟล์ .env
const DRIVE_FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID; 

exports.processDocuments = async (req, res) => {
  const files = req.files;

  if (!files || files.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'No files uploaded. Please attach files using field name "files".'
    });
  }

  let keywords = [];
  if (req.body.keywords) {
    if (Array.isArray(req.body.keywords)) {
      keywords = req.body.keywords.flatMap(k => k.split(',').map(s => s.trim())).filter(Boolean);
    } else {
      keywords = req.body.keywords.split(',').map(s => s.trim()).filter(Boolean);
    }
  }

  const results = [];

  for (const file of files) {
    try {
      console.log(`Processing: ${file.originalname}`);

      // 1. ทำการดึงข้อมูลข้อความจากรูปภาพ/PDF (OCR) จากโฟลเดอร์ temp ในเครื่องเซิร์ฟเวอร์ก่อน
      const text = await extractText(file.path);
      console.log(`Extracted text length: ${text.length} chars`);

      const hash = generateHash(text + Date.now().toString());
      
      const found = findKeywords(text, keywords);
      console.log('Keywords found:', JSON.stringify(found));

      // 2. อัพโหลดไฟล์ขึ้น Google Drive ผ่านบัญชีผู้ใช้ส่วนตัวด้วยระบบสิทธิ์ OAuth2
      console.log(`Uploading ${file.originalname} to Google Drive via OAuth2...`);
      const driveData = await uploadToDrive(file, DRIVE_FOLDER_ID);
      console.log(`Uploaded successfully! Drive Link: ${driveData.webViewLink}`);

      // 3. บันทึกข้อมูลและลิงก์ของ Google Drive ลงตารางข้อมูลฐานข้อมูล (PostgreSQL)
      const { rows } = await pool.query(
        `INSERT INTO documents (filename, content, content_hash, keywords_found, drive_file_id, drive_web_view_link)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        [
          file.originalname, 
          text, 
          hash, 
          JSON.stringify(found), 
          driveData.id, 
          driveData.webViewLink
        ]
      );

      // 4. ลบไฟล์ชั่วคราว (Temp) บนเครื่องเซิร์ฟเวอร์ทิ้งทันทีเมื่อทำงานเสร็จเพื่อไม่ให้ Storage เต็ม
      await fs.unlink(file.path);
      console.log(`Deleted local temp file: ${file.path}`);

      results.push({
        filename: file.originalname,
        status: 'success',
        keywordsFound: found,
        documentId: rows[0].id,
        viewLink: driveData.webViewLink
      });

    } catch (err) {
      console.error(`Error processing ${file.originalname}:`, err.message);
      
      // กรณีเกิดข้อผิดพลาดระหว่างทาง ต้องทำการลบไฟล์ขยะที่ค้างอยู่ในเครื่องเซิร์ฟเวอร์ทิ้งด้วย
      try {
        await fs.unlink(file.path);
      } catch (unlinkErr) {
        // ข้าม error ไปกรณีที่ไฟล์ไม่มีอยู่จริงในที่จัดเก็บอยู่แล้ว
      }

      results.push({
        filename: file.originalname,
        status: 'error',
        error: err.message
      });
    }
  }

  res.json({ total: files.length, results });
};