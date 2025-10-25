const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// 获取用户信息
router.get('/:userId', userController.getUserInfo);

// 获取用户提交记录
router.get('/:userId/submissions', userController.getUserSubmissions);

// 更新用户信息
router.put('/:userId', userController.updateUserInfo);

// 删除用户
router.delete('/:userId', userController.deleteUser);

// 获取所有用户列表（管理员功能）
router.get('/', userController.getAllUsers);

module.exports = router;