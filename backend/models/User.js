// const { getPool } = require('../config/database');
// const bcrypt = require('bcryptjs');

// class User {
//     // 创建用户
//     static async create(userData) {
//         const { username, password } = userData;
        
//         if (!username || !password) {
//             throw new Error('用户名和密码不能为空');
//         }
        
//         const pool = getPool();
        
//         // 检查用户名是否已存在
//         const [existingUsers] = await pool.promise().query(
//             'SELECT id FROM users WHERE username = ?',
//             [username]
//         );
        
//         if (existingUsers.length > 0) {
//             throw new Error('用户名已存在');
//         }
        
//         // 加密密码
//         const hashedPassword = await bcrypt.hash(password, 10);
        
//         const [result] = await pool.promise().query(
//             'INSERT INTO users (username, password) VALUES (?, ?)',
//             [username, hashedPassword]
//         );
        
//         return {
//             id: result.insertId,
//             username,
//             createdAt: new Date()
//         };
//     }

//     // 根据ID查找用户
//     static async findById(id) {
//         const pool = getPool();
        
//         const [users] = await pool.promise().query(
//             'SELECT id, username, created_at, updated_at FROM users WHERE id = ?',
//             [id]
//         );
        
//         if (users.length === 0) {
//             return null;
//         }
        
//         return this.mapUser(users[0]);
//     }

//     // 根据用户名查找用户
//     static async findByUsername(username) {
//         const pool = getPool();
        
//         const [users] = await pool.promise().query(
//             'SELECT * FROM users WHERE username = ?',
//             [username]
//         );
        
//         if (users.length === 0) {
//             return null;
//         }
        
//         return users[0];
//     }

//     // 验证用户密码
//     static async verifyPassword(plainPassword, hashedPassword) {
//         return await bcrypt.compare(plainPassword, hashedPassword);
//     }

//     // 更新用户信息
//     static async update(id, updateData) {
//         const { username, password } = updateData;
        
//         const pool = getPool();
        
//         // 检查用户是否存在
//         const user = await this.findById(id);
//         if (!user) {
//             throw new Error('用户不存在');
//         }
        
//         const updates = [];
//         const params = [];
        
//         // 更新用户名
//         if (username && username !== user.username) {
//             // 检查用户名是否已存在
//             const [existingUsers] = await pool.promise().query(
//                 'SELECT id FROM users WHERE username = ? AND id != ?',
//                 [username, id]
//             );
            
//             if (existingUsers.length > 0) {
//                 throw new Error('用户名已存在');
//             }
            
//             updates.push('username = ?');
//             params.push(username);
//         }
        
//         // 更新密码
//         if (password) {
//             const hashedPassword = await bcrypt.hash(password, 10);
//             updates.push('password = ?');
//             params.push(hashedPassword);
//         }
        
//         if (updates.length === 0) {
//             throw new Error('没有要更新的信息');
//         }
        
//         params.push(id);
        
//         await pool.promise().query(
//             `UPDATE users SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
//             params
//         );
        
//         return await this.findById(id);
//     }

//     // 删除用户
//     static async delete(id) {
//         const pool = getPool();
        
//         // 检查用户是否存在
//         const user = await this.findById(id);
//         if (!user) {
//             throw new Error('用户不存在');
//         }
        
//         await pool.promise().query(
//             'DELETE FROM users WHERE id = ?',
//             [id]
//         );
        
//         return true;
//     }

//     // 获取所有用户
//     static async findAll(options = {}) {
//         const { page = 1, limit = 10, search = '' } = options;
//         const offset = (page - 1) * limit;
        
//         const pool = getPool();
        
//         let whereClause = '';
//         let queryParams = [];
        
//         if (search) {
//             whereClause = 'WHERE username LIKE ?';
//             queryParams.push(`%${search}%`);
//         }
        
//         const [users] = await pool.promise().query(
//             `SELECT 
//                 id,
//                 username,
//                 created_at,
//                 updated_at
//             FROM users 
//             ${whereClause}
//             ORDER BY created_at DESC
//             LIMIT ? OFFSET ?`,
//             [...queryParams, parseInt(limit), offset]
//         );
        
//         // 查询总数
//         const [countResult] = await pool.promise().query(
//             `SELECT COUNT(*) as total FROM users ${whereClause}`,
//             queryParams
//         );
        
//         const total = countResult[0].total;
//         const totalPages = Math.ceil(total / limit);
        
//         return {
//             users: users.map(user => this.mapUser(user)),
//             pagination: {
//                 page: parseInt(page),
//                 limit: parseInt(limit),
//                 total,
//                 totalPages,
//                 search
//             }
//         };
//     }

//     // 获取用户统计信息
//     static async getStats() {
//         const pool = getPool();
        
//         const [countResult] = await pool.promise().query(
//             'SELECT COUNT(*) as total FROM users'
//         );
        
//         // 获取最近注册的用户
//         const [recentUsers] = await pool.promise().query(
//             'SELECT id, username, created_at FROM users ORDER BY created_at DESC LIMIT 5'
//         );
        
//         return {
//             totalUsers: countResult[0].total,
//             recentUsers: recentUsers.map(user => this.mapUser(user))
//         };
//     }

//     // 映射用户数据
//     static mapUser(user) {
//         return {
//             id: user.id,
//             username: user.username,
//             createdAt: user.created_at,
//             updatedAt: user.updated_at
//         };
//     }
// }

// module.exports = User;

const { query } = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
    // 根据用户名查找用户
    static async findByUsername(username) {
        const result = await query(
            'SELECT * FROM users WHERE username = $1',
            [username]
        );
        
        if (result.data.length === 0) {
            return null;
        }
        
        return result.data[0];
    }

    // 创建用户
    static async create(userData) {
        const { username, password } = userData;
        
        if (!username || !password) {
            throw new Error('用户名和密码不能为空');
        }
        
        // 检查用户名是否已存在
        const existingResult = await query(
            'SELECT id FROM users WHERE username = $1',
            [username]
        );
        
        if (existingResult.data.length > 0) {
            throw new Error('用户名已存在');
        }
        
        // 加密密码
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const result = await query(
            'INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id, username, created_at',
            [username, hashedPassword]
        );
        
        return result.data[0];
    }
}

module.exports = User;