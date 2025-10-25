const { getPool } = require('../config/database');

class Admin {
    // 创建管理员
    static async create(adminData) {
        const { username, password } = adminData;
        
        if (!username || !password) {
            throw new Error('管理员账号和密码不能为空');
        }
        
        const pool = getPool();
        
        // 检查管理员是否已存在
        const [existingAdmins] = await pool.promise().query(
            'SELECT id FROM admins WHERE username = ?',
            [username]
        );
        
        if (existingAdmins.length > 0) {
            throw new Error('管理员账号已存在');
        }
        
        const [result] = await pool.promise().query(
            'INSERT INTO admins (username, password) VALUES (?, ?)',
            [username, password]
        );
        
        return {
            id: result.insertId,
            username,
            createdAt: new Date()
        };
    }

    // 根据ID查找管理员
    static async findById(id) {
        const pool = getPool();
        
        const [admins] = await pool.promise().query(
            'SELECT id, username, created_at, updated_at FROM admins WHERE id = ?',
            [id]
        );
        
        if (admins.length === 0) {
            return null;
        }
        
        return this.mapAdmin(admins[0]);
    }

    // 根据用户名和密码查找管理员
    static async findByCredentials(username, password) {
        const pool = getPool();
        
        const [admins] = await pool.promise().query(
            'SELECT * FROM admins WHERE username = ? AND password = ?',
            [username, password]
        );
        
        if (admins.length === 0) {
            return null;
        }
        
        return admins[0];
    }

    // 更新管理员信息
    static async update(id, updateData) {
        const { username, password } = updateData;
        
        // 防止修改默认管理员用户名
        if (parseInt(id) === 1 && username && username !== 'admin') {
            throw new Error('不能修改默认管理员的用户名');
        }
        
        const pool = getPool();
        
        // 检查管理员是否存在
        const admin = await this.findById(id);
        if (!admin) {
            throw new Error('管理员不存在');
        }
        
        const updates = [];
        const params = [];
        
        // 更新用户名
        if (username && username !== admin.username) {
            // 检查用户名是否已存在
            const [existingAdmins] = await pool.promise().query(
                'SELECT id FROM admins WHERE username = ? AND id != ?',
                [username, id]
            );
            
            if (existingAdmins.length > 0) {
                throw new Error('管理员账号已存在');
            }
            
            updates.push('username = ?');
            params.push(username);
        }
        
        // 更新密码
        if (password) {
            updates.push('password = ?');
            params.push(password);
        }
        
        if (updates.length === 0) {
            throw new Error('没有要更新的信息');
        }
        
        params.push(id);
        
        await pool.promise().query(
            `UPDATE admins SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
            params
        );
        
        return await this.findById(id);
    }

    // 删除管理员
    static async delete(id) {
        // 防止删除默认管理员
        if (parseInt(id) === 1) {
            throw new Error('不能删除默认管理员账号');
        }
        
        const pool = getPool();
        
        // 检查管理员是否存在
        const admin = await this.findById(id);
        if (!admin) {
            throw new Error('管理员不存在');
        }
        
        await pool.promise().query(
            'DELETE FROM admins WHERE id = ?',
            [id]
        );
        
        return true;
    }

    // 获取所有管理员
    static async findAll(options = {}) {
        const { page = 1, limit = 10 } = options;
        const offset = (page - 1) * limit;
        
        const pool = getPool();
        
        const [admins] = await pool.promise().query(
            `SELECT 
                id,
                username,
                created_at,
                updated_at
            FROM admins 
            ORDER BY created_at DESC
            LIMIT ? OFFSET ?`,
            [parseInt(limit), offset]
        );
        
        // 查询总数
        const [countResult] = await pool.promise().query(
            'SELECT COUNT(*) as total FROM admins'
        );
        
        const total = countResult[0].total;
        const totalPages = Math.ceil(total / limit);
        
        return {
            admins: admins.map(admin => this.mapAdmin(admin)),
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages
            }
        };
    }

    // 获取管理员统计信息
    static async getStats() {
        const pool = getPool();
        
        const [countResult] = await pool.promise().query(
            'SELECT COUNT(*) as total FROM admins'
        );
        
        return {
            totalAdmins: countResult[0].total
        };
    }

    // 映射管理员数据
    static mapAdmin(admin) {
        return {
            id: admin.id,
            username: admin.username,
            createdAt: admin.created_at,
            updatedAt: admin.updated_at
        };
    }
}

module.exports = Admin;