const express = require('express');
// 💡 เพิ่ม confirmTasks เข้าไปในปีกกานี้
const { 
    getAllTasks, 
    getUrgentTasks, 
    updateTaskStatus, 
    confirmTasks 
} = require('../controllers/taskController');

const router = express.Router();

router.get('/', getAllTasks);
router.get('/urgent', getUrgentTasks);
router.put('/:id/status', updateTaskStatus);
router.post('/confirm', confirmTasks); // เส้นทางสำหรับยืนยันงานที่แสกนมา

module.exports = router;