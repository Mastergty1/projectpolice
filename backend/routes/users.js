const express = require('express');
const { updateMyProfile, changePassword } = require('../controllers/users');
const { protect } = require('../middleware/auth');
const router = express.Router();

router.put('/profile', protect, updateMyProfile);
router.put('/password', protect, changePassword);

module.exports = router;