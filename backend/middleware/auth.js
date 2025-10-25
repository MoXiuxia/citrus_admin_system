const { getPool } = require('../config/database');
const User = require('../models/User');
const Admin = require('../models/Admin');

// 认证中间件类
class AuthMiddleware {
    // 验证用户令牌（如果使用JWT）
    static async verifyToken(req, res, next) {
        try {
            // 从请求头获取token
            const token = req.header('Authorization')?.replace('Bearer ', '');
            
            if (!token) {
                return res.status(401).json({
                    success: false,
                    error: '访问被拒绝，缺少认证令牌'
                });
            }
            
            // 这里可以添加JWT验证逻辑
            // 目前我们使用简单的session验证，所以暂时跳过JWT验证
            next();
            
        } catch (error) {
            console.error('Token验证错误:', error);
            res.status(401).json({
                success: false,
                error: '令牌无效'
            });
        }
    }

    // 验证用户登录状态
    static async requireUserAuth(req, res, next) {
        try {
            // 从请求头或查询参数获取用户ID
            const userId = req.headers['x-user-id'] || req.query.userId || req.body.userId;
            
            if (!userId) {
                return res.status(401).json({
                    success: false,
                    error: '用户未登录，请先登录'
                });
            }
            
            // 验证用户是否存在
            const user = await User.findById(userId);
            if (!user) {
                return res.status(401).json({
                    success: false,
                    error: '用户不存在或会话已过期'
                });
            }
            
            // 将用户信息添加到请求对象中
            req.user = user;
            next();
            
        } catch (error) {
            console.error('用户认证中间件错误:', error);
            res.status(500).json({
                success: false,
                error: '认证服务错误'
            });
        }
    }

    // 验证管理员登录状态
    static async requireAdminAuth(req, res, next) {
        try {
            // 从请求头获取管理员标识
            const isAdmin = req.headers['x-admin-auth'] || req.query.adminAuth;
            
            if (!isAdmin || isAdmin !== 'true') {
                return res.status(403).json({
                    success: false,
                    error: '需要管理员权限'
                });
            }
            
            // 这里可以添加更复杂的管理员验证逻辑
            // 比如验证管理员token或session
            
            next();
            
        } catch (error) {
            console.error('管理员认证中间件错误:', error);
            res.status(500).json({
                success: false,
                error: '管理员认证服务错误'
            });
        }
    }

    // 验证用户所有权（用户只能操作自己的数据）
    static async checkUserOwnership(req, res, next) {
        try {
            const requestedUserId = req.params.userId;
            const currentUserId = req.user?.id;
            
            if (!currentUserId) {
                return res.status(401).json({
                    success: false,
                    error: '用户未登录'
                });
            }
            
            if (parseInt(requestedUserId) !== parseInt(currentUserId)) {
                return res.status(403).json({
                    success: false,
                    error: '无权访问其他用户的数据'
                });
            }
            
            next();
            
        } catch (error) {
            console.error('用户所有权验证错误:', error);
            res.status(500).json({
                success: false,
                error: '权限验证错误'
            });
        }
    }

    // 验证管理员或用户自己（管理员可以操作所有数据，用户只能操作自己的）
    static async checkAdminOrOwnership(req, res, next) {
        try {
            const requestedUserId = req.params.userId;
            const currentUserId = req.user?.id;
            const isAdmin = req.headers['x-admin-auth'];
            
            // 如果是管理员，允许访问
            if (isAdmin === 'true') {
                return next();
            }
            
            // 如果不是管理员，检查是否是操作自己的数据
            if (!currentUserId || parseInt(requestedUserId) !== parseInt(currentUserId)) {
                return res.status(403).json({
                    success: false,
                    error: '权限不足'
                });
            }
            
            next();
            
        } catch (error) {
            console.error('管理员或所有权验证错误:', error);
            res.status(500).json({
                success: false,
                error: '权限验证错误'
            });
        }
    }

    // 记录请求日志
    static requestLogger(req, res, next) {
        const start = Date.now();
        
        // 记录请求信息
        console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`, {
            ip: req.ip,
            userAgent: req.get('User-Agent'),
            contentType: req.get('Content-Type'),
            contentLength: req.get('Content-Length')
        });
        
        // 在响应完成后记录响应信息
        res.on('finish', () => {
            const duration = Date.now() - start;
            console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`);
        });
        
        next();
    }

    // 验证API密钥（用于外部API调用）
    static validateApiKey(req, res, next) {
        const apiKey = req.header('X-API-Key');
        const validApiKeys = process.env.API_KEYS ? process.env.API_KEYS.split(',') : [];
        
        if (!apiKey || !validApiKeys.includes(apiKey)) {
            return res.status(401).json({
                success: false,
                error: '无效的API密钥'
            });
        }
        
        next();
    }

    // 速率限制中间件
    static createRateLimiter(maxRequests, windowMs) {
        const requests = new Map();
        
        return (req, res, next) => {
            const ip = req.ip;
            const now = Date.now();
            const windowStart = now - windowMs;
            
            // 清理过期的请求记录
            for (const [key, timestamps] of requests.entries()) {
                const validTimestamps = timestamps.filter(timestamp => timestamp > windowStart);
                if (validTimestamps.length === 0) {
                    requests.delete(key);
                } else {
                    requests.set(key, validTimestamps);
                }
            }
            
            // 获取当前IP的请求记录
            const ipRequests = requests.get(ip) || [];
            
            if (ipRequests.length >= maxRequests) {
                return res.status(429).json({
                    success: false,
                    error: '请求过于频繁，请稍后重试'
                });
            }
            
            // 记录当前请求
            ipRequests.push(now);
            requests.set(ip, ipRequests);
            
            next();
        };
    }

    // 验证内容类型
    static validateContentType(allowedTypes = ['application/json']) {
        return (req, res, next) => {
            const contentType = req.get('Content-Type');
            
            if (req.method === 'POST' || req.method === 'PUT') {
                if (!contentType || !allowedTypes.some(type => contentType.includes(type))) {
                    return res.status(415).json({
                        success: false,
                        error: `不支持的媒体类型，支持的类型: ${allowedTypes.join(', ')}`
                    });
                }
            }
            
            next();
        };
    }

    // CORS配置
    static configureCORS() {
        return (req, res, next) => {
            res.header('Access-Control-Allow-Origin', process.env.ALLOWED_ORIGINS || '*');
            res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
            res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, X-User-Id, X-Admin-Auth');
            res.header('Access-Control-Allow-Credentials', 'true');
            
            if (req.method === 'OPTIONS') {
                return res.status(200).end();
            }
            
            next();
        };
    }
}

// 创建速率限制器实例
const rateLimiters = {
    // 普通用户限制：每分钟60次请求
    user: AuthMiddleware.createRateLimiter(60, 60 * 1000),
    // 严格限制：每分钟10次请求（用于敏感操作）
    strict: AuthMiddleware.createRateLimiter(10, 60 * 1000),
    // 注册登录限制：每分钟5次请求
    auth: AuthMiddleware.createRateLimiter(5, 60 * 1000)
};

module.exports = {
    AuthMiddleware,
    rateLimiters
};