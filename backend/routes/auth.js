const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// 用户注册
router.post('/register', authController.register);

// 用户登录
router.post('/user-login', authController.userLogin);

// 管理员登录
router.post('/admin-login', authController.adminLogin);

// 退出登录
router.post('/logout', authController.logout);

// 检查认证状态
router.get('/check', authController.checkAuth);

module.exports = router;