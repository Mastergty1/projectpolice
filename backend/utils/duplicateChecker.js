import crypto from 'crypto';
import pool from '../config/db.js';

// text to hash
export const generateHash = (text) => {
  return crypto.createHash('sha256').update(text).digest('hex');
};

//search hash in db
export const isDuplicate = async (hash) => {
  const { rows } = await pool.query(
    'SELECT id FROM documents WHERE content_hash = $1',
    [hash]
  );
  return rows.length > 0 ? rows[0] : null;
};

