const { extractText, findKeywords } = require('../services/ocrService');
const { generateHash, isDuplicate } = require('../utils/duplicateChecker');
const pool = require('../config/db');

exports.processDocuments = async (req, res) => {
  const files = req.files;
  const keywords = req.body.keywords?.split(',') || [];
  const results = [];

  for (const file of files) {
    try {
      const text = await extractText(file.path);

      const hash = generateHash(text);
      const duplicate = await isDuplicate(hash);

      if (duplicate) {
        results.push({
          filename: file.originalname,
          status: 'duplicate',
          duplicateOf: duplicate.id
        });
        continue;
      }

      const found = findKeywords(text, keywords);

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
      results.push({ filename: file.originalname, status: 'error', error: err.message });
    }
  }

  res.json({ total: files.length, results });
};