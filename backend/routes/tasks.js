const express = require('express');
const { getAllTasks, getUrgentTasks } = require('../controllers/taskController');

const router = express.Router();

router.get('/', getAllTasks);
router.get('/urgent', getUrgentTasks);

module.exports = router;