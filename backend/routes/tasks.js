const express = require('express');
// 💡 เพิ่ม confirmTasks เข้าไปในปีกกานี้
const { 
    getAllTasks, 
    getUrgentTasks, 
    updateTaskStatus, 
    confirmTasks, 
    getTaskById,
    updateTaskDetail,
    deleteTask,
    createTask,
    downloadDocument // นำเข้าฟังก์ชันดาวน์โหลด
} = require('../controllers/taskController');
const { protect } = require('../middleware/auth'); // นำเข้า auth middleware ป้องกันการเข้าถึง
const { upload } = require('../middleware/upload'); // นำเข้า upload (memory storage)

const router = express.Router();

router.get('/', getAllTasks);
router.get('/urgent', getUrgentTasks);
router.put('/:id/status', updateTaskStatus);
router.post('/confirm', upload.single('file'), confirmTasks); 
router.get('/:id/document', protect, downloadDocument); // เส้นทางสำหรับเปิดเอกสาร (บังคับล็อกอิน)
router.get('/:id', getTaskById);
router.put('/:id', updateTaskDetail);
router.delete('/:id', deleteTask);
router.post('/', createTask);

module.exports = router;