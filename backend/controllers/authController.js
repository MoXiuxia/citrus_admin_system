// const bcrypt = require('bcryptjs');
// const { getPool } = require('../config/database');

// class AuthController {
//     // 用户注册
//     async register(req, res) {
//         try {
//             const { username, password } = req.body;
            
//             if (!username || !password) {
//                 return res.status(400).json({ 
//                     success: false,
//                     error: '用户名和密码不能为空' 
//                 });
//             }
            
//             if (username.length < 3 || username.length > 50) {
//                 return res.status(400).json({
//                     success: false,
//                     error: '用户名长度必须在3-50个字符之间'
//                 });
//             }
            
//             if (password.length < 6) {
//                 return res.status(400).json({
//                     success: false,
//                     error: '密码长度不能少于6个字符'
//                 });
//             }
            
//             const pool = getPool();
            
//             // 检查用户是否已存在
//             const [existingUsers] = await pool.promise().query(
//                 'SELECT id FROM users WHERE username = ?',
//                 [username]
//             );
            
//             if (existingUsers.length > 0) {
//                 return res.status(400).json({
//                     success: false,
//                     error: '用户名已存在'
//                 });
//             }
            
//             // 加密密码
//             const hashedPassword = await bcrypt.hash(password, 10);
            
//             // 插入新用户
//             const [result] = await pool.promise().query(
//                 'INSERT INTO users (username, password) VALUES (?, ?)',
//                 [username, hashedPassword]
//             );
            
//             res.json({
//                 success: true,
//                 message: '注册成功',
//                 data: {
//                     userId: result.insertId
//                 }
//             });
            
//         } catch (error) {
//             console.error('注册错误:', error);
//             res.status(500).json({
//                 success: false,
//                 error: '服务器错误，请稍后重试'
//             });
//         }
//     }

//     // 用户登录
//     async userLogin(req, res) {
//         try {
//             const { username, password } = req.body;
            
//             if (!username || !password) {
//                 return res.status(400).json({
//                     success: false,
//                     error: '用户名和密码不能为空'
//                 });
//             }
            
//             const pool = getPool();
            
//             // 查询用户
//             const [users] = await pool.promise().query(
//                 'SELECT * FROM users WHERE username = ?',
//                 [username]
//             );
            
//             if (users.length === 0) {
//                 return res.status(401).json({
//                     success: false,
//                     error: '账号或密码错误'
//                 });
//             }
            
//             const user = users[0];
            
//             // 验证密码
//             const isValid = await bcrypt.compare(password, user.password);
            
//             if (!isValid) {
//                 return res.status(401).json({
//                     success: false,
//                     error: '账号或密码错误'
//                 });
//             }
            
//             res.json({
//                 success: true,
//                 message: '登录成功',
//                 data: {
//                     user: {
//                         id: user.id,
//                         username: user.username,
//                         createdAt: user.created_at
//                     }
//                 }
//             });
            
//         } catch (error) {
//             console.error('用户登录错误:', error);
//             res.status(500).json({
//                 success: false,
//                 error: '服务器错误，请稍后重试'
//             });
//         }
//     }

//     // 管理员登录
//     async adminLogin(req, res) {
//         try {
//             const { username, password } = req.body;
            
//             if (!username || !password) {
//                 return res.status(400).json({
//                     success: false,
//                     error: '管理员账号和密码不能为空'
//                 });
//             }
            
//             const pool = getPool();
            
//             // 查询管理员
//             const [admins] = await pool.promise().query(
//                 'SELECT * FROM admins WHERE username = ? AND password = ?',
//                 [username, password]
//             );
            
//             if (admins.length === 0) {
//                 return res.status(401).json({
//                     success: false,
//                     error: '管理员账号或密码错误'
//                 });
//             }
            
//             res.json({
//                 success: true,
//                 message: '管理员登录成功',
//                 data: {
//                     admin: {
//                         id: admins[0].id,
//                         username: admins[0].username
//                     }
//                 }
//             });
            
//         } catch (error) {
//             console.error('管理员登录错误:', error);
//             res.status(500).json({
//                 success: false,
//                 error: '服务器错误，请稍后重试'
//             });
//         }
//     }

//     // 退出登录
//     logout(req, res) {
//         // 由于我们使用无状态认证，客户端只需清除本地存储的token/user信息
//         res.json({
//             success: true,
//             message: '退出登录成功'
//         });
//     }

//     // 检查认证状态
//     async checkAuth(req, res) {
//         try {
//             // 这里可以添加更复杂的认证检查逻辑
//             // 目前只是简单的返回成功
//             res.json({
//                 success: true,
//                 message: '认证有效'
//             });
            
//         } catch (error) {
//             console.error('检查认证错误:', error);
//             res.status(500).json({
//                 success: false,
//                 error: '认证检查失败'
//             });
//         }
//     }
// }

// module.exports = new AuthController();
const bcrypt = require('bcryptjs');
const { query } = require('../config/database');

const authController = {
    // 用户注册
    register: async (req, res) => {
        try {
            const { username, password } = req.body;
            
            if (!username || !password) {
                return res.status(400).json({
                    success: false,
                    error: '用户名和密码不能为空'
                });
            }

            // 检查用户是否已存在 - 改为 PostgreSQL 语法
            const checkResult = await query('SELECT id FROM users WHERE username = $1', [username]);
            if (checkResult.success && checkResult.data.length > 0) {
                return res.status(400).json({
                    success: false,
                    error: '用户名已存在'
                });
            }

            // 加密密码
            const hashedPassword = await bcrypt.hash(password, 10);
            
            // 创建用户 - 改为 PostgreSQL 语法
            const insertResult = await query(
                'INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id',
                [username, hashedPassword]
            );

            if (insertResult.success) {
                res.json({
                    success: true,
                    message: '注册成功',
                    data: { 
                        userId: insertResult.data[0].id  // PostgreSQL 返回的是数组
                    }
                });
            } else {
                res.status(500).json({
                    success: false,
                    error: '注册失败'
                });
            }
        } catch (error) {
            console.error('注册错误:', error);
            res.status(500).json({
                success: false,
                error: '服务器错误'
            });
        }
    },

    // 用户登录
    userLogin: async (req, res) => {
        try {
            const { username, password } = req.body;
            
            if (!username || !password) {
                return res.status(400).json({
                    success: false,
                    error: '用户名和密码不能为空'
                });
            }

            // 查找用户 - 改为 PostgreSQL 语法
            const result = await query(
                'SELECT id, username, password FROM users WHERE username = $1',
                [username]
            );

            if (!result.success || result.data.length === 0) {
                return res.status(401).json({
                    success: false,
                    error: '用户名或密码错误'
                });
            }

            const user = result.data[0];
            
            // 验证密码
            const isValid = await bcrypt.compare(password, user.password);
            if (!isValid) {
                return res.status(401).json({
                    success: false,
                    error: '用户名或密码错误'
                });
            }

            // 移除密码字段
            const { password: _, ...userWithoutPassword } = user;
            
            res.json({
                success: true,
                message: '登录成功',
                data: { user: userWithoutPassword }
            });
        } catch (error) {
            console.error('登录错误:', error);
            res.status(500).json({
                success: false,
                error: '服务器错误'
            });
        }
    },

    // 管理员登录
    adminLogin: async (req, res) => {
        try {
            const { username, password } = req.body;
            if (!username || !password) {
                return res.status(400).json({
                    success: false,
                    error: '管理员账号和密码不能为空'
                });
            }

            // 查找管理员 - 改为 PostgreSQL 语法
            const result = await query(
                'SELECT id, username, password FROM admins WHERE username = $1',
                [username]
            );

            if (!result.success || result.data.length === 0) {
                return res.status(401).json({
                    success: false,
                    error: '管理员账号或密码错误'
                });
            }

            const admin = result.data[0];
        
            // 验证密码（明文比较，因为数据库中是明文存储）
            if (password !== admin.password) {
                return res.status(401).json({
                    success: false,
                    error: '管理员账号或密码错误'
                });
            }

            // 移除密码字段
            const { password: _, ...adminWithoutPassword } = admin;
        
            res.json({
                success: true,
                message: '管理员登录成功',
                data: { admin: adminWithoutPassword }
            });
        
        } catch (error) {
            console.error('管理员登录错误:', error);
            res.status(500).json({
                success: false,
                error: '服务器错误'
            });
        }
    },

    // 退出登录
    logout: (req, res) => {
        res.json({
            success: true,
            message: '退出成功'
        });
    },

    // 检查认证状态
    checkAuth: (req, res) => {
        res.json({
            success: true,
            data: { authenticated: true }
        });
    }
};

module.exports = authController;