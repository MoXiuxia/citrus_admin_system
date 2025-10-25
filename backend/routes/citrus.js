const express = require('express');
const router = express.Router();
const citrusController = require('../controllers/citrusController');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// 确保上传目录存在
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// 文件上传配置
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadsDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB限制
    },
    fileFilter: function (req, file, cb) {
        // 检查文件类型
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('只允许上传图片文件'), false);
        }
    }
});

// 提交陈皮信息
router.post('/submit', upload.single('image'), citrusController.submitCitrus);

// 获取陈皮总库存
router.get('/stock', citrusController.getTotalStock);

// 获取所有用户提交信息
router.get('/submissions', citrusController.getAllSubmissions);

// 获取待审核任务
router.get('/submissions/pending', citrusController.getPendingSubmissions);

// 审核单个提交
router.post('/submissions/:submissionId/review', citrusController.reviewSubmission);

// 批量审核提交
router.post('/submissions/batch-review', citrusController.batchReview);

// 获取提交统计
router.get('/stats', citrusController.getSubmissionStats);

module.exports = router;