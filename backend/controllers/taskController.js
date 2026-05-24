const pool = require('../config/db');

exports.getAllTasks = async (req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT id, name, person_in_charge AS \"personInCharge\", TO_CHAR(due_date, 'YYYY-MM-DD') AS date, status FROM tasks ORDER BY due_date ASC"
    );
    res.status(200).json(rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.getUrgentTasks = async (req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT id, name, person_in_charge AS \"personInCharge\", TO_CHAR(due_date, 'YYYY-MM-DD') AS date, status FROM tasks WHERE is_urgent = true ORDER BY due_date ASC"
    );
    res.status(200).json(rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};