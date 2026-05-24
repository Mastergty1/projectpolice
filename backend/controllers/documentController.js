const fs = require('fs').promises; 
const { extractText, extractDocumentData } = require('../services/ocrService'); 
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
      console.log(`Processing: ${file.originalname}`);

      const text = await extractText(file.path);
      const hash = generateHash(text + Date.now().toString());
      
      const extractedData = extractDocumentData(text);
      
      const driveData = await uploadToDrive(file, DRIVE_FOLDER_ID);

      const { rows } = await pool.query(
        `INSERT INTO documents (filename, content, content_hash, keywords_found, drive_file_id, drive_web_view_link)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        [
          file.originalname, 
          text, 
          hash, 
          JSON.stringify(extractedData), 
          driveData.id, 
          driveData.webViewLink
        ]
      );

      await fs.unlink(file.path);

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