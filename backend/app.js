const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// 导入配置和路由
const { testConnection, initDatabase } = require('./config/database');

// 导入路由
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const adminRoutes = require('./routes/admin');
const citrusRoutes = require('./routes/citrus');

const app = express();

// 确保上传目录存在
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// 中间件配置
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));

// 简单的请求日志中间件
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// 路由配置
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/citrus', citrusRoutes);

// 健康检查端点
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: '服务器运行正常',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

// AI服务状态检查
app.get('/api/ai/status', async (req, res) => {
    try {
        // 简单的AI服务状态检查
        res.json({
            success: true,
            data: {
                status: 'available',
                service: 'citrus-year-recognition',
                mode: 'simulation'
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: '获取AI服务状态失败'
        });
    }
});

// 404处理
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        error: '接口不存在'
    });
});

// 全局错误处理中间件
app.use((error, req, res, next) => {
    console.error('服务器错误:', error);
    
    const statusCode = error.statusCode || 500;
    const message = error.message || '服务器内部错误';
    
    res.status(statusCode).json({
        success: false,
        error: message,
        ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    });
});

// 初始化服务器
const initServer = async () => {
    try {
        console.log('🚀 启动陈皮管理系统服务器...');
        
        // 测试数据库连接
        const dbConnected = await testConnection();
        if (!dbConnected) {
            console.log('⚠️  数据库连接失败，但服务器将继续启动');
        } else {
            // 初始化数据库表
            await initDatabase();
        }
        
        const PORT = process.env.PORT || 3000;
        app.listen(PORT, () => {
            console.log(`✅ 服务器运行在端口 ${PORT}`);
            console.log(`📍 访问地址: http://localhost:${PORT}`);
            console.log(`🔗 健康检查: http://localhost:${PORT}/api/health`);
            console.log(`📊 环境: ${process.env.NODE_ENV || 'development'}`);
            console.log(`🗄️  数据库: ${dbConnected ? '✅ 已连接' : '❌ 未连接'}`);
        });
        
    } catch (error) {
        console.error('❌ 服务器启动失败:', error.message);
        process.exit(1);
    }
};

// 启动服务器
initServer();

// 优雅关闭
process.on('SIGINT', async () => {
    console.log('\n正在关闭服务器...');
    process.exit(0);
});

module.exports = app;