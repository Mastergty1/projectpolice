const User = require('../models/User');

// @desc    Get all users
// @route   GET /api/v1/users
// @access  Private/Admin
exports.getUsers = async (req, res, next) => {
    try {
        const users = await User.find();
        res.status(200).json({
            success: true,
            count: users.length,
            data: users
        });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Get single user
// @route   GET /api/v1/users/:id
// @access  Private/Admin
exports.getUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ success: false, message: `User not found with id of ${req.params.id}` });
        }
        delete user.password;
        
        res.status(200).json({ success: true, data: user });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Update user
// @route   PUT /api/v1/users/:id
// @access  Private/Admin
exports.updateUser = async (req, res, next) => {
    try {
        // ห้ามอัปเดตรหัสผ่านผ่านช่องทางนี้ (ให้ไปใช้ changePassword)
        if (req.body.password) delete req.body.password;

        const user = await User.findByIdAndUpdate(req.params.id, req.body);
        if (!user) {
            return res.status(404).json({ success: false, message: `User not found with id of ${req.params.id}` });
        }
        
        res.status(200).json({ success: true, data: user });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Delete user
// @route   DELETE /api/v1/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ success: false, message: `User not found with id of ${req.params.id}` });
        }

        await User.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Get own profile
// @route   GET /api/v1/users/me/profile
// @access  Private
exports.getMyProfile = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        if (user) delete user.password;

        res.status(200).json({ success: true, data: user });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Update own profile
// @route   PUT /api/v1/users/me/profile
// @access  Private
exports.updateMyProfile = async (req, res, next) => {
    try {
        if (req.body.password) delete req.body.password;

        const user = await User.findByIdAndUpdate(req.user.id, req.body);
        res.status(200).json({ success: true, data: user });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Change password
// @route   PUT /api/v1/users/me/password
// @access  Private
exports.changePassword = async (req, res, next) => {
    try {
        const { currentPassword, newPassword } = req.body;
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ success: false, message: 'Please provide current password and new password' });
        }

        const user = await User.findById(req.user.id);

        const isMatch = await User.matchPassword(currentPassword, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Current password is incorrect' });
        }

        await User.updatePassword(req.user.id, newPassword);
        res.status(200).json({ success: true, message: 'Password updated successfully' });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};