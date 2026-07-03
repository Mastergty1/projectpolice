const fs = require('fs').promises; 
const path = require('path');
const { extractDataWithGemini } = require('../services/ocrService'); 

exports.processDocuments = async (req, res) => {
  const files = req.files;
  if (!files || files.length === 0) return res.status(400).json({ success: false, message: 'No files uploaded.' });
  const results = [];
  
  const userId = req.user ? req.user.id : null;
  const userName = req.user ? req.user.name : "Unknown"; 

  for (const file of files) {
    try {
      const geminiResult = await extractDataWithGemini(file.buffer, file.mimetype);
      const { text, extractedData } = geminiResult;

      let dataWithDefaultUser = extractedData || {};
      dataWithDefaultUser.assignee = userName; 

      results.push({
        filename: file.originalname,
        status: 'success',
        extractedData: dataWithDefaultUser,
        fileInfo: {
            originalname: file.originalname,
            mimetype: file.mimetype,
            text: text
        }
      });

    } catch (err) {
      results.push({ filename: file.originalname, status: 'error', error: err.message });
    }
  }
  
  res.json({ total: files.length, results });
};