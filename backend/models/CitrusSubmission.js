const { getPool } = require('../config/database');

class CitrusSubmission {
    // 创建提交记录
    static async create(submissionData) {
        const { userId, imageUrl, aiYearResult, manualYearSelection, weight, status = 'pending' } = submissionData;
        
        if (!userId || !manualYearSelection || !weight) {
            throw new Error('用户ID、年份选择和重量不能为空');
        }
        
        const validYears = ['0-10', '10-20', '20-30', '30+'];
        if (!validYears.includes(manualYearSelection)) {
            throw new Error('无效的年份选择');
        }
        
        if (isNaN(weight) || parseFloat(weight) <= 0) {
            throw new Error('重量必须是大于0的数字');
        }
        
        const pool = getPool();
        
        const [result] = await pool.promise().query(
            `INSERT INTO citrus_submissions 
            (user_id, image_url, ai_year_result, manual_year_selection, weight, status) 
            VALUES (?, ?, ?, ?, ?, ?)`,
            [userId, imageUrl, aiYearResult, manualYearSelection, parseFloat(weight), status]
        );
        
        return await this.findById(result.insertId);
    }

    // 根据ID查找提交记录
    static async findById(id) {
        const pool = getPool();
        
        const [submissions] = await pool.promise().query(
            `SELECT 
                cs.*,
                u.username
            FROM citrus_submissions cs
            JOIN users u ON cs.user_id = u.id
            WHERE cs.id = ?`,
            [id]
        );
        
        if (submissions.length === 0) {
            return null;
        }
        
        return this.mapSubmission(submissions[0]);
    }

    // 获取用户的所有提交记录
    static async findByUserId(userId, options = {}) {
        const { page = 1, limit = 10 } = options;
        const offset = (page - 1) * limit;
        
        const pool = getPool();
        
        const [submissions] = await pool.promise().query(
            `SELECT 
                cs.*,
                u.username
            FROM citrus_submissions cs
            JOIN users u ON cs.user_id = u.id
            WHERE cs.user_id = ?
            ORDER BY cs.submitted_at DESC
            LIMIT ? OFFSET ?`,
            [userId, parseInt(limit), offset]
        );
        
        // 查询总数
        const [countResult] = await pool.promise().query(
            'SELECT COUNT(*) as total FROM citrus_submissions WHERE user_id = ?',
            [userId]
        );
        
        const total = countResult[0].total;
        const totalPages = Math.ceil(total / limit);
        
        return {
            submissions: submissions.map(submission => this.mapSubmission(submission)),
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages
            }
        };
    }

    // 获取所有提交记录
    static async findAll(options = {}) {
        const { 
            page = 1, 
            limit = 10, 
            status = '',
            year = '',
            search = ''
        } = options;
        
        const offset = (page - 1) * limit;
        
        const pool = getPool();
        
        let whereConditions = [];
        let queryParams = [];
        
        if (status) {
            whereConditions.push('cs.status = ?');
            queryParams.push(status);
        }
        
        if (year) {
            whereConditions.push('cs.manual_year_selection = ?');
            queryParams.push(year);
        }
        
        if (search) {
            whereConditions.push('u.username LIKE ?');
            queryParams.push(`%${search}%`);
        }
        
        const whereClause = whereConditions.length > 0 
            ? `WHERE ${whereConditions.join(' AND ')}` 
            : '';
        
        const [submissions] = await pool.promise().query(
            `SELECT 
                cs.*,
                u.username
            FROM citrus_submissions cs
            JOIN users u ON cs.user_id = u.id
            ${whereClause}
            ORDER BY cs.submitted_at DESC
            LIMIT ? OFFSET ?`,
            [...queryParams, parseInt(limit), offset]
        );
        
        // 查询总数
        const [countResult] = await pool.promise().query(
            `SELECT COUNT(*) as total 
            FROM citrus_submissions cs
            JOIN users u ON cs.user_id = u.id
            ${whereClause}`,
            queryParams
        );
        
        const total = countResult[0].total;
        const totalPages = Math.ceil(total / limit);
        
        return {
            submissions: submissions.map(submission => this.mapSubmission(submission)),
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages,
                filters: { status, year, search }
            }
        };
    }

    // 获取待审核的提交记录
    static async findPending(options = {}) {
        const { page = 1, limit = 10 } = options;
        const offset = (page - 1) * limit;
        
        const pool = getPool();
        
        const [submissions] = await pool.promise().query(
            `SELECT 
                cs.*,
                u.username
            FROM citrus_submissions cs
            JOIN users u ON cs.user_id = u.id
            WHERE cs.status = 'pending'
            ORDER BY cs.submitted_at DESC
            LIMIT ? OFFSET ?`,
            [parseInt(limit), offset]
        );
        
        // 查询总数
        const [countResult] = await pool.promise().query(
            'SELECT COUNT(*) as total FROM citrus_submissions WHERE status = "pending"'
        );
        
        const total = countResult[0].total;
        const totalPages = Math.ceil(total / limit);
        
        return {
            submissions: submissions.map(submission => this.mapSubmission(submission)),
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages
            }
        };
    }

    // 更新提交状态
    static async updateStatus(id, status) {
        if (!['pending', 'approved', 'rejected'].includes(status)) {
            throw new Error('无效的状态');
        }
        
        const pool = getPool();
        
        // 检查提交记录是否存在
        const submission = await this.findById(id);
        if (!submission) {
            throw new Error('提交记录不存在');
        }
        
        await pool.promise().query(
            'UPDATE citrus_submissions SET status = ?, reviewed_at = CURRENT_TIMESTAMP WHERE id = ?',
            [status, id]
        );
        
        return await this.findById(id);
    }

    // 批量更新状态
    static async batchUpdateStatus(ids, status) {
        if (!Array.isArray(ids) || ids.length === 0) {
            throw new Error('请选择要更新的记录');
        }
        
        if (!['pending', 'approved', 'rejected'].includes(status)) {
            throw new Error('无效的状态');
        }
        
        const pool = getPool();
        
        const placeholders = ids.map(() => '?').join(',');
        
        await pool.promise().query(
            `UPDATE citrus_submissions 
            SET status = ?, reviewed_at = CURRENT_TIMESTAMP 
            WHERE id IN (${placeholders})`,
            [status, ...ids]
        );
        
        // 返回更新后的记录
        const [updatedSubmissions] = await pool.promise().query(
            `SELECT 
                cs.*,
                u.username
            FROM citrus_submissions cs
            JOIN users u ON cs.user_id = u.id
            WHERE cs.id IN (${placeholders})`,
            ids
        );
        
        return updatedSubmissions.map(submission => this.mapSubmission(submission));
    }

    // 获取提交统计
    static async getStats() {
        const pool = getPool();
        
        // 按状态统计
        const [statusStats] = await pool.promise().query(
            `SELECT 
                status,
                COUNT(*) as count,
                SUM(weight) as total_weight
            FROM citrus_submissions 
            GROUP BY status`
        );
        
        // 按年份统计
        const [yearStats] = await pool.promise().query(
            `SELECT 
                manual_year_selection as year,
                COUNT(*) as count,
                SUM(weight) as total_weight
            FROM citrus_submissions 
            GROUP BY manual_year_selection
            ORDER BY manual_year_selection`
        );
        
        // 最近30天提交趋势
        const [trendStats] = await pool.promise().query(
            `SELECT 
                DATE(submitted_at) as date,
                COUNT(*) as count,
                SUM(weight) as total_weight
            FROM citrus_submissions 
            WHERE submitted_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
            GROUP BY DATE(submitted_at)
            ORDER BY date`
        );
        
        return {
            statusStats,
            yearStats,
            trendStats
        };
    }

    // 删除提交记录
    static async delete(id) {
        const pool = getPool();
        
        // 检查提交记录是否存在
        const submission = await this.findById(id);
        if (!submission) {
            throw new Error('提交记录不存在');
        }
        
        await pool.promise().query(
            'DELETE FROM citrus_submissions WHERE id = ?',
            [id]
        );
        
        return true;
    }

    // 映射提交数据
    static mapSubmission(submission) {
        return {
            id: submission.id,
            userId: submission.user_id,
            username: submission.username,
            imageUrl: submission.image_url,
            aiYearResult: submission.ai_year_result,
            manualYearSelection: submission.manual_year_selection,
            weight: parseFloat(submission.weight),
            status: submission.status,
            submittedAt: submission.submitted_at,
            reviewedAt: submission.reviewed_at
        };
    }
}

module.exports = CitrusSubmission;