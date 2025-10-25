const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

// 添加管理员
router.post('/add', adminController.addAdmin);

// 获取管理员列表
router.get('/list', adminController.getAdmins);

// 更新管理员信息
router.put('/:adminId', adminController.updateAdmin);

// 删除管理员
router.delete('/:adminId', adminController.deleteAdmin);

// 获取系统统计信息
router.get('/stats', adminController.getSystemStats);

module.exports = router;
