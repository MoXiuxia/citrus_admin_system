const multer = require('multer');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');

// 确保上传目录存在
const ensureUploadDirs = () => {
    const dirs = [
        path.join(__dirname, '../uploads'),
        path.join(__dirname, '../uploads/citrus-images'),
        path.join(__dirname, '../uploads/temp')
    ];
    
    dirs.forEach(dir => {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
    });
};

// 调用函数创建目录
ensureUploadDirs();

// 存储配置
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../uploads/citrus-images'));
    },
    filename: function (req, file, cb) {
        // 生成唯一文件名：时间戳-随机数.扩展名
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, 'citrus-' + uniqueSuffix + ext);
    }
});

// 文件过滤器
const fileFilter = (req, file, cb) => {
    // 检查文件类型
    const allowedMimes = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/gif',
        'image/webp'
    ];
    
    if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error(`不支持的文件类型: ${file.mimetype}。支持的格式: JPEG, JPG, PNG, GIF, WebP`), false);
    }
};

// 创建multer实例
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB文件大小限制
        files: 1 // 每次只能上传一个文件
    },
    fileFilter: fileFilter
});

// 错误处理中间件
const handleUploadErrors = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        let message = '文件上传错误';
        
        switch (err.code) {
            case 'LIMIT_FILE_SIZE':
                message = '文件大小超过限制（最大10MB）';
                break;
            case 'LIMIT_FILE_COUNT':
                message = '文件数量超过限制';
                break;
            case 'LIMIT_UNEXPECTED_FILE':
                message = '意外的文件字段';
                break;
            default:
                message = `文件上传错误: ${err.code}`;
        }
        
        return res.status(400).json({
            success: false,
            error: message
        });
    } else if (err) {
        // 其他错误
        return res.status(400).json({
            success: false,
            error: err.message
        });
    }
    
    next();
};

// 图片处理中间件
const processImage = async (req, res, next) => {
    if (!req.file) {
        return next();
    }
    
    try {
        const filePath = req.file.path;
        const processedFilePath = filePath.replace(path.extname(filePath), '-processed.jpg');
        
        // 使用sharp处理图片：调整大小、压缩、转换格式
        await sharp(filePath)
            .resize(1200, 1200, { // 最大尺寸
                fit: 'inside',
                withoutEnlargement: true
            })
            .jpeg({ 
                quality: 80,
                progressive: true 
            })
            .toFile(processedFilePath);
        
        // 删除原始文件，使用处理后的文件
        fs.unlinkSync(filePath);
        
        // 更新文件信息
        req.file.filename = path.basename(processedFilePath);
        req.file.path = processedFilePath;
        req.file.mimetype = 'image/jpeg';
        req.file.size = fs.statSync(processedFilePath).size;
        
        next();
    } catch (error) {
        console.error('图片处理错误:', error);
        // 如果处理失败，继续使用原始文件
        next();
    }
};

// 验证文件存在性
const validateFileExists = (req, res, next) => {
    if (!req.file) {
        return res.status(400).json({
            success: false,
            error: '请选择要上传的图片文件'
        });
    }
    next();
};

// 清理临时文件中间件
const cleanupTempFiles = (req, res, next) => {
    // 在响应完成后清理临时文件
    res.on('finish', () => {
        if (req.file && req.file.path) {
            const tempDir = path.join(__dirname, '../uploads/temp');
            const fileDir = path.dirname(req.file.path);
            
            // 如果是临时目录的文件，清理它
            if (fileDir === tempDir) {
                try {
                    fs.unlinkSync(req.file.path);
                } catch (error) {
                    console.error('清理临时文件错误:', error);
                }
            }
        }
    });
    
    next();
};

// 文件类型验证器
const validateFileType = (allowedTypes = ['image']) => {
    return (req, res, next) => {
        if (!req.file) {
            return next();
        }
        
        const fileType = req.file.mimetype.split('/')[0];
        if (!allowedTypes.includes(fileType)) {
            // 删除上传的文件
            fs.unlinkSync(req.file.path);
            
            return res.status(400).json({
                success: false,
                error: `不支持的文件类型。允许的类型: ${allowedTypes.join(', ')}`
            });
        }
        
        next();
    };
};

// 文件大小验证器
const validateFileSize = (maxSizeInMB = 10) => {
    return (req, res, next) => {
        if (!req.file) {
            return next();
        }
        
        const maxSize = maxSizeInMB * 1024 * 1024;
        if (req.file.size > maxSize) {
            // 删除上传的文件
            fs.unlinkSync(req.file.path);
            
            return res.status(400).json({
                success: false,
                error: `文件大小超过限制（最大${maxSizeInMB}MB）`
            });
        }
        
        next();
    };
};

// 生成文件URL
const generateFileUrl = (req, res, next) => {
    if (req.file) {
        req.file.url = `/uploads/citrus-images/${req.file.filename}`;
    }
    next();
};

// 多文件上传配置
const multipleUpload = multer({
    storage: multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, path.join(__dirname, '../uploads/temp'));
        },
        filename: function (req, file, cb) {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            const ext = path.extname(file.originalname);
            cb(null, 'temp-' + uniqueSuffix + ext);
        }
    }),
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
        files: 5 // 最多5个文件
    },
    fileFilter: fileFilter
});

module.exports = {
    // 单文件上传（用于陈皮图片）
    uploadSingle: [upload.single('image'), handleUploadErrors, processImage, validateFileExists, generateFileUrl],
    
    // 多文件上传（预留功能）
    uploadMultiple: [multipleUpload.array('images', 5), handleUploadErrors, generateFileUrl],
    
    // 独立的中间件
    handleUploadErrors,
    processImage,
    validateFileExists,
    validateFileType,
    validateFileSize,
    generateFileUrl,
    cleanupTempFiles,
    
    // 原始multer实例（用于特殊情况）
    multerInstance: upload
};