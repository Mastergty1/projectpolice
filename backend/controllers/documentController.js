const { extractText, findKeywords } = require('../services/ocrService');
const { generateHash, isDuplicate } = require('../utils/duplicateChecker');
const pool = require('../config/db');

exports.processDocuments = async (req, res) => {
  // FIX: multer v2 เปลี่ยน behavior — ถ้าไม่มีไฟล์ req.files จะเป็น [] ไม่ใช่ undefined
  // แต่ถ้า field name ใน Postman ไม่ตรงกับ upload.array('files', 50) จะเป็น [] เปล่า
  const files = req.files;

  if (!files || files.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'No files uploaded. Please attach files using field name "files".'
    });
  }

  // FIX: keywords รองรับทั้ง comma-separated string และ array (กรณีส่งมาหลาย field)
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

      const text = await extractText(file.path);
      console.log(`Extracted text length: ${text.length} chars`);

      const hash = generateHash(text + Date.now().toString());
      /*const duplicate = await isDuplicate(hash);

      if (duplicate) {
        results.push({
          filename: file.originalname,
          status: 'duplicate',
          duplicateOf: duplicate.id
        });
        continue;
      }
      */
      const found = findKeywords(text, keywords);
      console.log('Keywords found:', JSON.stringify(found));

      const { rows } = await pool.query(
        `INSERT INTO documents (filename, content, content_hash, keywords_found)
         VALUES ($1, $2, $3, $4) RETURNING *`,
        [file.originalname, text, hash, JSON.stringify(found)]
      );

      results.push({
        filename: file.originalname,
        status: 'success',
        keywordsFound: found,
        documentId: rows[0].id
      });

    } catch (err) {
      console.error(`Error processing ${file.originalname}:`, err.message);
      results.push({
        filename: file.originalname,
        status: 'error',
        error: err.message
      });
    }
  }

  res.json({ total: files.length, results });
};