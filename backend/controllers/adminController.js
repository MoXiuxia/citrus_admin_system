// const bcrypt = require('bcryptjs');
// const { getPool } = require('../config/database');

// class AdminController {
//     // 添加管理员
//     async addAdmin(req, res) {
//         try {
//             const { username, password } = req.body;
            
//             if (!username || !password) {
//                 return res.status(400).json({
//                     success: false,
//                     error: '管理员账号和密码不能为空'
//                 });
//             }
            
//             if (username.length < 3 || username.length > 50) {
//                 return res.status(400).json({
//                     success: false,
//                     error: '管理员账号长度必须在3-50个字符之间'
//                 });
//             }
            
//             if (password.length < 6) {
//                 return res.status(400).json({
//                     success: false,
//                     error: '密码长度不能少于6个字符'
//                 });
//             }
            
//             const pool = getPool();
            
//             // 检查管理员是否已存在
//             const [existingAdmins] = await pool.promise().query(
//                 'SELECT id FROM admins WHERE username = ?',
//                 [username]
//             );
            
//             if (existingAdmins.length > 0) {
//                 return res.status(400).json({
//                     success: false,
//                     error: '管理员账号已存在'
//                 });
//             }
            
//             // 在实际应用中应该加密存储密码
//             // 这里为了简单直接存储，生产环境应该使用加密
//             await pool.promise().query(
//                 'INSERT INTO admins (username, password) VALUES (?, ?)',
//                 [username, password]
//             );
            
//             res.json({
//                 success: true,
//                 message: '管理员添加成功'
//             });
            
//         } catch (error) {
//             console.error('添加管理员错误:', error);
//             res.status(500).json({
//                 success: false,
//                 error: '添加管理员失败'
//             });
//         }
//     }

//     // 获取管理员列表
//     async getAdmins(req, res) {
//         try {
//             const { page = 1, limit = 10 } = req.query;
//             const offset = (page - 1) * limit;
            
//             const pool = getPool();
            
//             // 查询管理员列表
//             const [admins] = await pool.promise().query(
//                 `SELECT 
//                     id,
//                     username,
//                     created_at,
//                     updated_at
//                 FROM admins 
//                 ORDER BY created_at DESC
//                 LIMIT ? OFFSET ?`,
//                 [parseInt(limit), offset]
//             );
            
//             // 查询总数
//             const [countResult] = await pool.promise().query(
//                 'SELECT COUNT(*) as total FROM admins'
//             );
            
//             const total = countResult[0].total;
//             const totalPages = Math.ceil(total / limit);
            
//             res.json({
//                 success: true,
//                 data: {
//                     admins,
//                     pagination: {
//                         page: parseInt(page),
//                         limit: parseInt(limit),
//                         total,
//                         totalPages
//                     }
//                 }
//             });
            
//         } catch (error) {
//             console.error('获取管理员列表错误:', error);
//             res.status(500).json({
//                 success: false,
//                 error: '获取管理员列表失败'
//             });
//         }
//     }

//     // 删除管理员
//     async deleteAdmin(req, res) {
//         try {
//             const { adminId } = req.params;
            
//             // 防止删除默认管理员
//             if (parseInt(adminId) === 1) {
//                 return res.status(400).json({
//                     success: false,
//                     error: '不能删除默认管理员账号'
//                 });
//             }
            
//             const pool = getPool();
            
//             // 检查管理员是否存在
//             const [admins] = await pool.promise().query(
//                 'SELECT id FROM admins WHERE id = ?',
//                 [adminId]
//             );
            
//             if (admins.length === 0) {
//                 return res.status(404).json({
//                     success: false,
//                     error: '管理员不存在'
//                 });
//             }
            
//             await pool.promise().query(
//                 'DELETE FROM admins WHERE id = ?',
//                 [adminId]
//             );
            
//             res.json({
//                 success: true,
//                 message: '管理员删除成功'
//             });
            
//         } catch (error) {
//             console.error('删除管理员错误:', error);
//             res.status(500).json({
//                 success: false,
//                 error: '删除管理员失败'
//             });
//         }
//     }

//     // 更新管理员信息
//     async updateAdmin(req, res) {
//         try {
//             const { adminId } = req.params;
//             const { username, password } = req.body;
            
//             // 防止修改默认管理员用户名
//             if (parseInt(adminId) === 1 && username && username !== 'admin') {
//                 return res.status(400).json({
//                     success: false,
//                     error: '不能修改默认管理员的用户名'
//                 });
//             }
            
//             const pool = getPool();
            
//             // 检查管理员是否存在
//             const [admins] = await pool.promise().query(
//                 'SELECT * FROM admins WHERE id = ?',
//                 [adminId]
//             );
            
//             if (admins.length === 0) {
//                 return res.status(404).json({
//                     success: false,
//                     error: '管理员不存在'
//                 });
//             }
            
//             const updates = [];
//             const params = [];
            
//             // 更新用户名
//             if (username && username !== admins[0].username) {
//                 // 检查用户名是否已存在
//                 const [existingAdmins] = await pool.promise().query(
//                     'SELECT id FROM admins WHERE username = ? AND id != ?',
//                     [username, adminId]
//                 );
                
//                 if (existingAdmins.length > 0) {
//                     return res.status(400).json({
//                         success: false,
//                         error: '管理员账号已存在'
//                     });
//                 }
                
//                 updates.push('username = ?');
//                 params.push(username);
//             }
            
//             // 更新密码
//             if (password) {
//                 if (password.length < 6) {
//                     return res.status(400).json({
//                         success: false,
//                         error: '密码长度不能少于6个字符'
//                     });
//                 }
//                 updates.push('password = ?');
//                 params.push(password);
//             }
            
//             if (updates.length === 0) {
//                 return res.status(400).json({
//                     success: false,
//                     error: '没有要更新的信息'
//                 });
//             }
            
//             params.push(adminId);
            
//             await pool.promise().query(
//                 `UPDATE admins SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
//                 params
//             );
            
//             res.json({
//                 success: true,
//                 message: '管理员信息更新成功'
//             });
            
//         } catch (error) {
//             console.error('更新管理员信息错误:', error);
//             res.status(500).json({
//                 success: false,
//                 error: '更新管理员信息失败'
//             });
//         }
//     }

//     // 获取系统统计信息
//     async getSystemStats(req, res) {
//         try {
//             const pool = getPool();
            
//             // 获取各种统计信息
//             const [
//                 [userCount],
//                 [adminCount],
//                 [totalSubmissions],
//                 [pendingSubmissions],
//                 [totalStock]
//             ] = await Promise.all([
//                 pool.promise().query('SELECT COUNT(*) as count FROM users'),
//                 pool.promise().query('SELECT COUNT(*) as count FROM admins'),
//                 pool.promise().query('SELECT COUNT(*) as count FROM citrus_submissions'),
//                 pool.promise().query('SELECT COUNT(*) as count FROM citrus_submissions WHERE status = "pending"'),
//                 pool.promise().query('SELECT SUM(stock_weight) as total FROM citrus_total')
//             ]);
            
//             // 获取各年份库存分布
//             const [yearDistribution] = await pool.promise().query(
//                 'SELECT year_range, stock_weight FROM citrus_total ORDER BY year_range'
//             );
            
//             // 获取最近提交
//             const [recentSubmissions] = await pool.promise().query(
//                 `SELECT 
//                     cs.id,
//                     cs.manual_year_selection,
//                     cs.weight,
//                     cs.status,
//                     cs.submitted_at,
//                     u.username
//                 FROM citrus_submissions cs
//                 JOIN users u ON cs.user_id = u.id
//                 ORDER BY cs.submitted_at DESC
//                 LIMIT 10`
//             );
            
//             res.json({
//                 success: true,
//                 data: {
//                     stats: {
//                         totalUsers: userCount[0].count,
//                         totalAdmins: adminCount[0].count,
//                         totalSubmissions: totalSubmissions[0].count,
//                         pendingSubmissions: pendingSubmissions[0].count,
//                         totalStock: totalStock[0].total || 0
//                     },
//                     yearDistribution,
//                     recentSubmissions
//                 }
//             });
            
//         } catch (error) {
//             console.error('获取系统统计错误:', error);
//             res.status(500).json({
//                 success: false,
//                 error: '获取系统统计失败'
//             });
//         }
//     }
// }

// module.exports = new AdminController();

const { query } = require('../config/database');

const adminController = {
    // 添加管理员
    async addAdmin(req, res) {
        try {
            const { username, password } = req.body;
            
            if (!username || !password) {
                return res.status(400).json({
                    success: false,
                    error: '管理员账号和密码不能为空'
                });
            }
            
            // 检查管理员是否已存在
            const existingResult = await query(
                'SELECT id FROM admins WHERE username = $1',
                [username]
            );
            
            if (existingResult.data.length > 0) {
                return res.status(400).json({
                    success: false,
                    error: '管理员账号已存在'
                });
            }
            
            // 插入管理员
            await query(
                'INSERT INTO admins (username, password) VALUES ($1, $2)',
                [username, password]
            );
            
            res.json({
                success: true,
                message: '管理员添加成功'
            });
            
        } catch (error) {
            console.error('添加管理员错误:', error);
            res.status(500).json({
                success: false,
                error: '添加管理员失败'
            });
        }
    },

    // 获取管理员列表
    async getAdmins(req, res) {
        try {
            const { page = 1, limit = 10 } = req.query;
            const offset = (page - 1) * limit;
            
            // 查询管理员列表
            const adminsResult = await query(
                `SELECT 
                    id,
                    username,
                    created_at,
                    updated_at
                FROM admins 
                ORDER BY created_at DESC
                LIMIT $1 OFFSET $2`,
                [parseInt(limit), offset]
            );
            
            // 查询总数
            const countResult = await query(
                'SELECT COUNT(*) as total FROM admins'
            );
            
            const total = parseInt(countResult.data[0].total);
            const totalPages = Math.ceil(total / limit);
            
            res.json({
                success: true,
                data: {
                    admins: adminsResult.data,
                    pagination: {
                        page: parseInt(page),
                        limit: parseInt(limit),
                        total,
                        totalPages
                    }
                }
            });
            
        } catch (error) {
            console.error('获取管理员列表错误:', error);
            res.status(500).json({
                success: false,
                error: '获取管理员列表失败'
            });
        }
    },

    // 获取系统统计信息
    async getSystemStats(req, res) {
        try {
            // 获取各种统计信息
            const [
                userCount,
                adminCount,
                totalSubmissions,
                pendingSubmissions,
                totalStock
            ] = await Promise.all([
                query('SELECT COUNT(*) as count FROM users'),
                query('SELECT COUNT(*) as count FROM admins'),
                query('SELECT COUNT(*) as count FROM citrus_submissions'),
                query('SELECT COUNT(*) as count FROM citrus_submissions WHERE status = $1', ['pending']),
                query('SELECT SUM(stock_weight) as total FROM citrus_total')
            ]);
            
            // 获取各年份库存分布
            const yearDistribution = await query(
                'SELECT year_range, stock_weight FROM citrus_total ORDER BY year_range'
            );
            
            res.json({
                success: true,
                data: {
                    stats: {
                        totalUsers: parseInt(userCount.data[0].count),
                        totalAdmins: parseInt(adminCount.data[0].count),
                        totalSubmissions: parseInt(totalSubmissions.data[0].count),
                        pendingSubmissions: parseInt(pendingSubmissions.data[0].count),
                        totalStock: parseFloat(totalStock.data[0].total) || 0
                    },
                    yearDistribution: yearDistribution.data
                }
            });
            
        } catch (error) {
            console.error('获取系统统计错误:', error);
            res.status(500).json({
                success: false,
                error: '获取系统统计失败'
            });
        }
    }
};

module.exports = adminController;