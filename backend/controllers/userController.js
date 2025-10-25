const { query } = require('../config/database');

const userController = {
    // 获取用户信息
    async getUserInfo(req, res) {
        try {
            const { userId } = req.params;
            
            const result = await query(
                'SELECT id, username, created_at FROM users WHERE id = $1',
                [userId]
            );
            
            if (!result.success || result.data.length === 0) {
                return res.status(404).json({
                    success: false,
                    error: '用户不存在'
                });
            }
            
            const user = result.data[0];
            
            res.json({
                success: true,
                data: {
                    user: {
                        id: user.id,
                        username: user.username,
                        createdAt: user.created_at
                    }
                }
            });
            
        } catch (error) {
            console.error('获取用户信息错误:', error);
            res.status(500).json({
                success: false,
                error: '获取用户信息失败'
            });
        }
    },

    // 获取用户提交记录
    async getUserSubmissions(req, res) {
        try {
            const { userId } = req.params;
            const { page = 1, limit = 10 } = req.query;
            
            const offset = (page - 1) * limit;
            
            // 查询用户提交记录 - 改为 PostgreSQL 语法
            const submissionsResult = await query(
                `SELECT 
                    cs.id,
                    cs.image_url,
                    cs.ai_year_result,
                    cs.manual_year_selection,
                    cs.weight,
                    cs.status,
                    cs.submitted_at,
                    cs.reviewed_at
                FROM citrus_submissions cs
                WHERE cs.user_id = $1
                ORDER BY cs.submitted_at DESC
                LIMIT $2 OFFSET $3`,
                [userId, parseInt(limit), offset]
            );
            
            // 查询总数
            const countResult = await query(
                'SELECT COUNT(*) as total FROM citrus_submissions WHERE user_id = $1',
                [userId]
            );
            
            const total = parseInt(countResult.data[0].total);
            const totalPages = Math.ceil(total / limit);
            
            res.json({
                success: true,
                data: {
                    submissions: submissionsResult.data,
                    pagination: {
                        page: parseInt(page),
                        limit: parseInt(limit),
                        total,
                        totalPages
                    }
                }
            });
            
        } catch (error) {
            console.error('获取用户提交记录错误:', error);
            res.status(500).json({
                success: false,
                error: '获取提交记录失败'
            });
        }
    },

    // 更新用户信息
    async updateUserInfo(req, res) {
        try {
            const { userId } = req.params;
            const { username, currentPassword, newPassword } = req.body;
            
            // 验证当前用户
            const userResult = await query(
                'SELECT * FROM users WHERE id = $1',
                [userId]
            );
            
            if (userResult.data.length === 0) {
                return res.status(404).json({
                    success: false,
                    error: '用户不存在'
                });
            }
            
            const user = userResult.data[0];
            const updates = [];
            const params = [];
            let paramCount = 1;
            
            // 更新用户名
            if (username && username !== user.username) {
                // 检查用户名是否已存在
                const existingResult = await query(
                    'SELECT id FROM users WHERE username = $1 AND id != $2',
                    [username, userId]
                );
                
                if (existingResult.data.length > 0) {
                    return res.status(400).json({
                        success: false,
                        error: '用户名已存在'
                    });
                }
                
                updates.push(`username = $${paramCount}`);
                params.push(username);
                paramCount++;
            }
            
            // 更新密码
            if (newPassword) {
                if (!currentPassword) {
                    return res.status(400).json({
                        success: false,
                        error: '当前密码不能为空'
                    });
                }
                
                const bcrypt = require('bcryptjs');
                const isValid = await bcrypt.compare(currentPassword, user.password);
                
                if (!isValid) {
                    return res.status(400).json({
                        success: false,
                        error: '当前密码错误'
                    });
                }
                
                if (newPassword.length < 6) {
                    return res.status(400).json({
                        success: false,
                        error: '新密码长度不能少于6个字符'
                    });
                }
                
                const hashedPassword = await bcrypt.hash(newPassword, 10);
                updates.push(`password = $${paramCount}`);
                params.push(hashedPassword);
                paramCount++;
            }
            
            if (updates.length === 0) {
                return res.status(400).json({
                    success: false,
                    error: '没有要更新的信息'
                });
            }
            
            params.push(userId);
            
            await query(
                `UPDATE users SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = $${paramCount}`,
                params
            );
            
            res.json({
                success: true,
                message: '用户信息更新成功'
            });
            
        } catch (error) {
            console.error('更新用户信息错误:', error);
            res.status(500).json({
                success: false,
                error: '更新用户信息失败'
            });
        }
    },

    // 删除用户（管理员功能）
    async deleteUser(req, res) {
        try {
            const { userId } = req.params;
            
            // 检查用户是否存在
            const userResult = await query(
                'SELECT id FROM users WHERE id = $1',
                [userId]
            );
            
            if (userResult.data.length === 0) {
                return res.status(404).json({
                    success: false,
                    error: '用户不存在'
                });
            }
            
            // 删除用户
            await query(
                'DELETE FROM users WHERE id = $1',
                [userId]
            );
            
            res.json({
                success: true,
                message: '用户删除成功'
            });
            
        } catch (error) {
            console.error('删除用户错误:', error);
            res.status(500).json({
                success: false,
                error: '删除用户失败'
            });
        }
    },

    // 获取所有用户列表（管理员功能）
    async getAllUsers(req, res) {
        try {
            const { page = 1, limit = 10, search = '' } = req.query;
            
            const offset = (page - 1) * limit;
            
            let whereClause = '';
            let queryParams = [];
            let paramCount = 1;
            
            if (search) {
                whereClause = `WHERE username LIKE $${paramCount}`;
                queryParams.push(`%${search}%`);
                paramCount++;
            }
            
            // 查询用户列表
            const usersResult = await query(
                `SELECT 
                    id,
                    username,
                    created_at,
                    updated_at
                FROM users 
                ${whereClause}
                ORDER BY created_at DESC
                LIMIT $${paramCount} OFFSET $${paramCount + 1}`,
                [...queryParams, parseInt(limit), offset]
            );
            
            // 查询总数
            const countResult = await query(
                `SELECT COUNT(*) as total FROM users ${whereClause}`,
                queryParams
            );
            
            const total = parseInt(countResult.data[0].total);
            const totalPages = Math.ceil(total / limit);
            
            res.json({
                success: true,
                data: {
                    users: usersResult.data,
                    pagination: {
                        page: parseInt(page),
                        limit: parseInt(limit),
                        total,
                        totalPages,
                        search
                    }
                }
            });
            
        } catch (error) {
            console.error('获取用户列表错误:', error);
            res.status(500).json({
                success: false,
                error: '获取用户列表失败'
            });
        }
    }
};

module.exports = userController;