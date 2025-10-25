// const { getPool } = require('../config/database');

// class CitrusController {
//     // 获取所有有效的年份范围
//     getValidYears() {
//         return [
//             '0-5', '5-10', '10-15', '15-20', '20-25', '25-30', '30-35', '35-40',
//             '40-45', '45-50', '50-55', '55-60', '60-65', '65-70', '70-75', '75-80',
//             '80-85', '85-90', '90-95', '95-100', '100-105', '105-110', '110-115',
//             '115-120', '120-125', '125-130', '130-135', '135-140', '140-145',
//             '145-150', '150+'
//         ];
//     }

//     // 模拟AI识别年份 - 从所有有效年份中随机选择
//     simulateAIYearRecognition() {
//         const years = this.getValidYears();
//         return years[Math.floor(Math.random() * years.length)];
//     }

//     // 提交陈皮信息
//     async submitCitrus(req, res) {
//         try {
//             console.log('收到提交请求:', req.body);
//             console.log('文件信息:', req.file);
//             const { userId, manualYear, weight } = req.body;
            
//             if (!userId || !manualYear || !weight) {
//                 return res.status(400).json({
//                     success: false,
//                     error: '用户ID、年份选择和重量不能为空'
//                 });
//             }
            
//             if (isNaN(weight) || parseFloat(weight) <= 0) {
//                 return res.status(400).json({
//                     success: false,
//                     error: '重量必须是大于0的数字'
//                 });
//             }
            
//             // 使用动态获取的有效年份范围进行验证
//             const validYears = this.getValidYears();
//             if (!validYears.includes(manualYear)) {
//                 return res.status(400).json({
//                     success: false,
//                     error: '无效的年份选择'
//                 });
//             }
            
//             const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;
            
//             // 修复：使用正确的this上下文调用方法
//             const aiYearResult = this.simulateAIYearRecognition();
//             const status = aiYearResult === manualYear ? 'approved' : 'pending';
            
//             const pool = getPool();
            
//             // 开始事务
//             const connection = await pool.promise().getConnection();
//             await connection.beginTransaction();
            
//             try {
//                 // 插入提交记录
//                 const [submitResult] = await connection.query(
//                     `INSERT INTO citrus_submissions 
//                     (user_id, image_url, ai_year_result, manual_year_selection, weight, status) 
//                     VALUES (?, ?, ?, ?, ?, ?)`,
//                     [userId, imageUrl, aiYearResult, manualYear, parseFloat(weight), status]
//                 );
                
//                 // 如果审核通过，更新总库存
//                 if (status === 'approved') {
//                     await connection.query(
//                         'UPDATE citrus_total SET stock_weight = stock_weight + ? WHERE year_range = ?',
//                         [parseFloat(weight), manualYear]
//                     );
//                 }
                
//                 await connection.commit();
                
//                 res.json({
//                     success: true,
//                     message: '陈皮信息提交成功',
//                     data: {
//                         submissionId: submitResult.insertId,
//                         aiYearResult,
//                         status,
//                         imageUrl
//                     }
//                 });
                
//             } catch (transactionError) {
//                 await connection.rollback();
//                 throw transactionError;
//             } finally {
//                 connection.release();
//             }
            
//         } catch (error) {
//             console.error('提交陈皮信息错误:', error);
//             res.status(500).json({
//                 success: false,
//                 error: '提交失败，请稍后重试'
//             });
//         }
//     }

//     // 获取陈皮总库存
//     async getTotalStock(req, res) {
//         try {
//             const pool = getPool();
            
//             const [stockData] = await pool.promise().query(
//                 'SELECT * FROM citrus_total ORDER BY year_range'
//             );
            
//             res.json({
//                 success: true,
//                 data: {
//                     stock: stockData
//                 }
//             });
            
//         } catch (error) {
//             console.error('获取库存数据错误:', error);
//             res.status(500).json({
//                 success: false,
//                 error: '获取库存数据失败'
//             });
//         }
//     }

//     // 获取所有用户提交信息
//     async getAllSubmissions(req, res) {
//         try {
//             const { 
//                 page = 1, 
//                 limit = 10, 
//                 status = '',
//                 year = '',
//                 search = ''
//             } = req.query;
            
//             const offset = (page - 1) * limit;
            
//             const pool = getPool();
            
//             let whereConditions = [];
//             let queryParams = [];
            
//             if (status) {
//                 whereConditions.push('cs.status = ?');
//                 queryParams.push(status);
//             }
            
//             if (year) {
//                 whereConditions.push('cs.manual_year_selection = ?');
//                 queryParams.push(year);
//             }
            
//             if (search) {
//                 whereConditions.push('u.username LIKE ?');
//                 queryParams.push(`%${search}%`);
//             }
            
//             const whereClause = whereConditions.length > 0 
//                 ? `WHERE ${whereConditions.join(' AND ')}` 
//                 : '';
            
//             // 查询提交记录
//             const [submissions] = await pool.promise().query(
//                 `SELECT 
//                     cs.*,
//                     u.username
//                 FROM citrus_submissions cs
//                 JOIN users u ON cs.user_id = u.id
//                 ${whereClause}
//                 ORDER BY cs.submitted_at DESC
//                 LIMIT ? OFFSET ?`,
//                 [...queryParams, parseInt(limit), offset]
//             );
            
//             // 查询总数
//             const [countResult] = await pool.promise().query(
//                 `SELECT COUNT(*) as total 
//                 FROM citrus_submissions cs
//                 JOIN users u ON cs.user_id = u.id
//                 ${whereClause}`,
//                 queryParams
//             );
            
//             const total = countResult[0].total;
//             const totalPages = Math.ceil(total / limit);
            
//             res.json({
//                 success: true,
//                 data: {
//                     submissions,
//                     pagination: {
//                         page: parseInt(page),
//                         limit: parseInt(limit),
//                         total,
//                         totalPages,
//                         filters: { status, year, search }
//                     }
//                 }
//             });
            
//         } catch (error) {
//             console.error('获取提交记录错误:', error);
//             res.status(500).json({
//                 success: false,
//                 error: '获取提交记录失败'
//             });
//         }
//     }

//     // 获取待审核任务
//     async getPendingSubmissions(req, res) {
//         try {
//             const { page = 1, limit = 10 } = req.query;
//             const offset = (page - 1) * limit;
            
//             const pool = getPool();
            
//             // 查询待审核记录
//             const [submissions] = await pool.promise().query(
//                 `SELECT 
//                     cs.*,
//                     u.username
//                 FROM citrus_submissions cs
//                 JOIN users u ON cs.user_id = u.id
//                 WHERE cs.status = 'pending'
//                 ORDER BY cs.submitted_at DESC
//                 LIMIT ? OFFSET ?`,
//                 [parseInt(limit), offset]
//             );
            
//             // 查询总数
//             const [countResult] = await pool.promise().query(
//                 'SELECT COUNT(*) as total FROM citrus_submissions WHERE status = "pending"'
//             );
            
//             const total = countResult[0].total;
//             const totalPages = Math.ceil(total / limit);
            
//             res.json({
//                 success: true,
//                 data: {
//                     submissions,
//                     pagination: {
//                         page: parseInt(page),
//                         limit: parseInt(limit),
//                         total,
//                         totalPages
//                     }
//                 }
//             });
            
//         } catch (error) {
//             console.error('获取待审核任务错误:', error);
//             res.status(500).json({
//                 success: false,
//                 error: '获取待审核任务失败'
//             });
//         }
//     }

//     // 审核提交
//     async reviewSubmission(req, res) {
//         try {
//             const { submissionId } = req.params;
//             const { status } = req.body;
            
//             if (!['approved', 'rejected'].includes(status)) {
//                 return res.status(400).json({
//                     success: false,
//                     error: '无效的审核状态'
//                 });
//             }
            
//             const pool = getPool();
            
//             // 开始事务
//             const connection = await pool.promise().getConnection();
//             await connection.beginTransaction();
            
//             try {
//                 // 获取提交信息
//                 const [submissions] = await connection.query(
//                     'SELECT * FROM citrus_submissions WHERE id = ?',
//                     [submissionId]
//                 );
                
//                 if (submissions.length === 0) {
//                     await connection.rollback();
//                     return res.status(404).json({
//                         success: false,
//                         error: '提交记录不存在'
//                     });
//                 }
                
//                 const submission = submissions[0];
                
//                 if (submission.status !== 'pending') {
//                     await connection.rollback();
//                     return res.status(400).json({
//                         success: false,
//                         error: '该记录已审核，无法重复审核'
//                     });
//                 }
                
//                 // 更新审核状态
//                 await connection.query(
//                     'UPDATE citrus_submissions SET status = ?, reviewed_at = CURRENT_TIMESTAMP WHERE id = ?',
//                     [status, submissionId]
//                 );
                
//                 // 如果审核通过，更新总库存
//                 if (status === 'approved') {
//                     await connection.query(
//                         'UPDATE citrus_total SET stock_weight = stock_weight + ? WHERE year_range = ?',
//                         [submission.weight, submission.manual_year_selection]
//                     );
//                 }
                
//                 await connection.commit();
                
//                 res.json({
//                     success: true,
//                     message: `审核${status === 'approved' ? '通过' : '拒绝'}成功`
//                 });
                
//             } catch (transactionError) {
//                 await connection.rollback();
//                 throw transactionError;
//             } finally {
//                 connection.release();
//             }
            
//         } catch (error) {
//             console.error('审核提交错误:', error);
//             res.status(500).json({
//                 success: false,
//                 error: '审核失败，请稍后重试'
//             });
//         }
//     }

//     // 批量审核
//     async batchReview(req, res) {
//         try {
//             const { submissionIds, status } = req.body;
            
//             if (!Array.isArray(submissionIds) || submissionIds.length === 0) {
//                 return res.status(400).json({
//                     success: false,
//                     error: '请选择要审核的记录'
//                 });
//             }
            
//             if (!['approved', 'rejected'].includes(status)) {
//                 return res.status(400).json({
//                     success: false,
//                     error: '无效的审核状态'
//                 });
//             }
            
//             const pool = getPool();
//             const connection = await pool.promise().getConnection();
//             await connection.beginTransaction();
            
//             try {
//                 // 获取所有待审核的记录信息
//                 const placeholders = submissionIds.map(() => '?').join(',');
//                 const [submissions] = await connection.query(
//                     `SELECT id, manual_year_selection, weight 
//                     FROM citrus_submissions 
//                     WHERE id IN (${placeholders}) AND status = 'pending'`,
//                     submissionIds
//                 );
                
//                 if (submissions.length === 0) {
//                     await connection.rollback();
//                     return res.status(400).json({
//                         success: false,
//                         error: '没有找到可审核的记录'
//                     });
//                 }
                
//                 // 批量更新状态
//                 await connection.query(
//                     `UPDATE citrus_submissions 
//                     SET status = ?, reviewed_at = CURRENT_TIMESTAMP 
//                     WHERE id IN (${placeholders})`,
//                     [status, ...submissionIds]
//                 );
                
//                 // 如果审核通过，更新总库存
//                 if (status === 'approved') {
//                     const yearWeights = {};
//                     submissions.forEach(submission => {
//                         const year = submission.manual_year_selection;
//                         const weight = parseFloat(submission.weight);
//                         yearWeights[year] = (yearWeights[year] || 0) + weight;
//                     });
                    
//                     for (const [year, totalWeight] of Object.entries(yearWeights)) {
//                         await connection.query(
//                             'UPDATE citrus_total SET stock_weight = stock_weight + ? WHERE year_range = ?',
//                             [totalWeight, year]
//                         );
//                     }
//                 }
                
//                 await connection.commit();
                
//                 res.json({
//                     success: true,
//                     message: `批量审核完成，成功处理 ${submissions.length} 条记录`
//                 });
                
//             } catch (transactionError) {
//                 await connection.rollback();
//                 throw transactionError;
//             } finally {
//                 connection.release();
//             }
            
//         } catch (error) {
//             console.error('批量审核错误:', error);
//             res.status(500).json({
//                 success: false,
//                 error: '批量审核失败'
//             });
//         }
//     }

//     // 获取提交统计
//     async getSubmissionStats(req, res) {
//         try {
//             const pool = getPool();
            
//             // 按状态统计
//             const [statusStats] = await pool.promise().query(
//                 `SELECT 
//                     status,
//                     COUNT(*) as count,
//                     SUM(weight) as total_weight
//                 FROM citrus_submissions 
//                 GROUP BY status`
//             );
            
//             // 按年份统计
//             const [yearStats] = await pool.promise().query(
//                 `SELECT 
//                     manual_year_selection as year,
//                     COUNT(*) as count,
//                     SUM(weight) as total_weight
//                 FROM citrus_submissions 
//                 GROUP BY manual_year_selection
//                 ORDER BY manual_year_selection`
//             );
            
//             // 最近30天提交趋势
//             const [trendStats] = await pool.promise().query(
//                 `SELECT 
//                     DATE(submitted_at) as date,
//                     COUNT(*) as count,
//                     SUM(weight) as total_weight
//                 FROM citrus_submissions 
//                 WHERE submitted_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
//                 GROUP BY DATE(submitted_at)
//                 ORDER BY date`
//             );
            
//             res.json({
//                 success: true,
//                 data: {
//                     statusStats,
//                     yearStats,
//                     trendStats
//                 }
//             });
            
//         } catch (error) {
//             console.error('获取提交统计错误:', error);
//             res.status(500).json({
//                 success: false,
//                 error: '获取统计信息失败'
//             });
//         }
//     }
// }

// // 修复：确保正确绑定方法
// const citrusController = new CitrusController();

// // 手动绑定方法以确保正确的this上下文
// const boundSubmitCitrus = citrusController.submitCitrus.bind(citrusController);
// const boundGetTotalStock = citrusController.getTotalStock.bind(citrusController);
// const boundGetAllSubmissions = citrusController.getAllSubmissions.bind(citrusController);
// const boundGetPendingSubmissions = citrusController.getPendingSubmissions.bind(citrusController);
// const boundReviewSubmission = citrusController.reviewSubmission.bind(citrusController);
// const boundBatchReview = citrusController.batchReview.bind(citrusController);
// const boundGetSubmissionStats = citrusController.getSubmissionStats.bind(citrusController);

// module.exports = {
//     submitCitrus: boundSubmitCitrus,
//     getTotalStock: boundGetTotalStock,
//     getAllSubmissions: boundGetAllSubmissions,
//     getPendingSubmissions: boundGetPendingSubmissions,
//     reviewSubmission: boundReviewSubmission,
//     batchReview: boundBatchReview,
//     getSubmissionStats: boundGetSubmissionStats
// };


const db = require('../config/database');

class CitrusController {
    // 获取所有有效的年份范围
    getValidYears() {
        return [
            '0-5', '5-10', '10-15', '15-20', '20-25', '25-30', '30-35', '35-40',
            '40-45', '45-50', '50-55', '55-60', '60-65', '65-70', '70-75', '75-80',
            '80-85', '85-90', '90-95', '95-100', '100-105', '105-110', '110-115',
            '115-120', '120-125', '125-130', '130-135', '135-140', '140-145',
            '145-150', '150+'
        ];
    }

    // 模拟AI识别年份 - 从所有有效年份中随机选择
    simulateAIYearRecognition() {
        const years = this.getValidYears();
        return years[Math.floor(Math.random() * years.length)];
    }

    // 提交陈皮信息
    async submitCitrus(req, res) {
        let connection;
        try {
            console.log('收到提交请求:', req.body);
            console.log('文件信息:', req.file);
            const { userId, manualYear, weight } = req.body;
            
            // 检查userId是否为有效的数字
            if (!userId || userId === 'undefined' || isNaN(parseInt(userId))) {
                return res.status(400).json({
                    success: false,
                    error: '用户ID无效，请重新登录'
                });
            }
            
            const numericUserId = parseInt(userId);
            
            if (!manualYear || !weight) {
                return res.status(400).json({
                    success: false,
                    error: '年份选择和重量不能为空'
                });
            }
            
            if (isNaN(weight) || parseFloat(weight) <= 0) {
                return res.status(400).json({
                    success: false,
                    error: '重量必须是大于0的数字'
                });
            }
            
            // 使用动态获取的有效年份范围进行验证
            const validYears = this.getValidYears();
            if (!validYears.includes(manualYear)) {
                return res.status(400).json({
                    success: false,
                    error: '无效的年份选择'
                });
            }
            
            const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;
            
            // 模拟AI识别结果
            const aiYearResult = this.simulateAIYearRecognition();
            const status = aiYearResult === manualYear ? 'approved' : 'pending';
            
            // 使用数据库连接池
            connection = await db.promisePool.getConnection();
            await connection.beginTransaction();
            
            try {
                // 插入提交记录
                const [submitResult] = await connection.query(
                    `INSERT INTO citrus_submissions 
                    (user_id, image_url, ai_year_result, manual_year_selection, weight, status) 
                    VALUES (?, ?, ?, ?, ?, ?)`,
                    [numericUserId, imageUrl, aiYearResult, manualYear, parseFloat(weight), status]
                );
                
                // 如果审核通过，更新总库存
                if (status === 'approved') {
                    await connection.query(
                        'UPDATE citrus_total SET stock_weight = stock_weight + ? WHERE year_range = ?',
                        [parseFloat(weight), manualYear]
                    );
                }
                
                await connection.commit();
                
                res.json({
                    success: true,
                    message: '陈皮信息提交成功',
                    data: {
                        submissionId: submitResult.insertId,
                        aiYearResult,
                        status,
                        imageUrl
                    }
                });
                
            } catch (transactionError) {
                await connection.rollback();
                throw transactionError;
            } finally {
                if (connection) connection.release();
            }
            
        } catch (error) {
            console.error('提交陈皮信息错误:', error);
            res.status(500).json({
                success: false,
                error: '提交失败，请稍后重试'
            });
        }
    }

    // 获取陈皮总库存
    async getTotalStock(req, res) {
        try {
            const [stockData] = await db.promisePool.query(
                'SELECT * FROM citrus_total ORDER BY year_range'
            );
            
            res.json({
                success: true,
                data: {
                    stock: stockData
                }
            });
            
        } catch (error) {
            console.error('获取库存数据错误:', error);
            res.status(500).json({
                success: false,
                error: '获取库存数据失败'
            });
        }
    }

    // 获取所有用户提交信息
    async getAllSubmissions(req, res) {
        try {
            const { 
                page = 1, 
                limit = 10, 
                status = '',
                year = '',
                search = ''
            } = req.query;
            
            const offset = (page - 1) * limit;
            
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
            
            // 查询提交记录
            const [submissions] = await db.promisePool.query(
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
            const [countResult] = await db.promisePool.query(
                `SELECT COUNT(*) as total 
                FROM citrus_submissions cs
                JOIN users u ON cs.user_id = u.id
                ${whereClause}`,
                queryParams
            );
            
            const total = countResult[0].total;
            const totalPages = Math.ceil(total / limit);
            
            res.json({
                success: true,
                data: {
                    submissions,
                    pagination: {
                        page: parseInt(page),
                        limit: parseInt(limit),
                        total,
                        totalPages,
                        filters: { status, year, search }
                    }
                }
            });
            
        } catch (error) {
            console.error('获取提交记录错误:', error);
            res.status(500).json({
                success: false,
                error: '获取提交记录失败'
            });
        }
    }

    // 获取待审核任务
    async getPendingSubmissions(req, res) {
        try {
            const { page = 1, limit = 10 } = req.query;
            const offset = (page - 1) * limit;
            
            // 查询待审核记录
            const [submissions] = await db.promisePool.query(
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
            const [countResult] = await db.promisePool.query(
                'SELECT COUNT(*) as total FROM citrus_submissions WHERE status = "pending"'
            );
            
            const total = countResult[0].total;
            const totalPages = Math.ceil(total / limit);
            
            res.json({
                success: true,
                data: {
                    submissions,
                    pagination: {
                        page: parseInt(page),
                        limit: parseInt(limit),
                        total,
                        totalPages
                    }
                }
            });
            
        } catch (error) {
            console.error('获取待审核任务错误:', error);
            res.status(500).json({
                success: false,
                error: '获取待审核任务失败'
            });
        }
    }

    // 审核提交
    async reviewSubmission(req, res) {
        let connection;
        try {
            const { submissionId } = req.params;
            const { status } = req.body;
            
            if (!['approved', 'rejected'].includes(status)) {
                return res.status(400).json({
                    success: false,
                    error: '无效的审核状态'
                });
            }
            
            // 开始事务
            connection = await db.promisePool.getConnection();
            await connection.beginTransaction();
            
            try {
                // 获取提交信息
                const [submissions] = await connection.query(
                    'SELECT * FROM citrus_submissions WHERE id = ?',
                    [submissionId]
                );
                
                if (submissions.length === 0) {
                    await connection.rollback();
                    return res.status(404).json({
                        success: false,
                        error: '提交记录不存在'
                    });
                }
                
                const submission = submissions[0];
                
                if (submission.status !== 'pending') {
                    await connection.rollback();
                    return res.status(400).json({
                        success: false,
                        error: '该记录已审核，无法重复审核'
                    });
                }
                
                // 更新审核状态
                await connection.query(
                    'UPDATE citrus_submissions SET status = ?, reviewed_at = CURRENT_TIMESTAMP WHERE id = ?',
                    [status, submissionId]
                );
                
                // 如果审核通过，更新总库存
                if (status === 'approved') {
                    await connection.query(
                        'UPDATE citrus_total SET stock_weight = stock_weight + ? WHERE year_range = ?',
                        [submission.weight, submission.manual_year_selection]
                    );
                }
                
                await connection.commit();
                
                res.json({
                    success: true,
                    message: `审核${status === 'approved' ? '通过' : '拒绝'}成功`
                });
                
            } catch (transactionError) {
                await connection.rollback();
                throw transactionError;
            } finally {
                if (connection) connection.release();
            }
            
        } catch (error) {
            console.error('审核提交错误:', error);
            res.status(500).json({
                success: false,
                error: '审核失败，请稍后重试'
            });
        }
    }

    // 批量审核
    async batchReview(req, res) {
        let connection;
        try {
            const { submissionIds, status } = req.body;
            
            if (!Array.isArray(submissionIds) || submissionIds.length === 0) {
                return res.status(400).json({
                    success: false,
                    error: '请选择要审核的记录'
                });
            }
            
            if (!['approved', 'rejected'].includes(status)) {
                return res.status(400).json({
                    success: false,
                    error: '无效的审核状态'
                });
            }
            
            connection = await db.promisePool.getConnection();
            await connection.beginTransaction();
            
            try {
                // 获取所有待审核的记录信息
                const placeholders = submissionIds.map(() => '?').join(',');
                const [submissions] = await connection.query(
                    `SELECT id, manual_year_selection, weight 
                    FROM citrus_submissions 
                    WHERE id IN (${placeholders}) AND status = 'pending'`,
                    submissionIds
                );
                
                if (submissions.length === 0) {
                    await connection.rollback();
                    return res.status(400).json({
                        success: false,
                        error: '没有找到可审核的记录'
                    });
                }
                
                // 批量更新状态
                await connection.query(
                    `UPDATE citrus_submissions 
                    SET status = ?, reviewed_at = CURRENT_TIMESTAMP 
                    WHERE id IN (${placeholders})`,
                    [status, ...submissionIds]
                );
                
                // 如果审核通过，更新总库存
                if (status === 'approved') {
                    const yearWeights = {};
                    submissions.forEach(submission => {
                        const year = submission.manual_year_selection;
                        const weight = parseFloat(submission.weight);
                        yearWeights[year] = (yearWeights[year] || 0) + weight;
                    });
                    
                    for (const [year, totalWeight] of Object.entries(yearWeights)) {
                        await connection.query(
                            'UPDATE citrus_total SET stock_weight = stock_weight + ? WHERE year_range = ?',
                            [totalWeight, year]
                        );
                    }
                }
                
                await connection.commit();
                
                res.json({
                    success: true,
                    message: `批量审核完成，成功处理 ${submissions.length} 条记录`
                });
                
            } catch (transactionError) {
                await connection.rollback();
                throw transactionError;
            } finally {
                if (connection) connection.release();
            }
            
        } catch (error) {
            console.error('批量审核错误:', error);
            res.status(500).json({
                success: false,
                error: '批量审核失败'
            });
        }
    }

    // 获取提交统计
    async getSubmissionStats(req, res) {
        try {
            // 按状态统计
            const [statusStats] = await db.promisePool.query(
                `SELECT 
                    status,
                    COUNT(*) as count,
                    SUM(weight) as total_weight
                FROM citrus_submissions 
                GROUP BY status`
            );
            
            // 按年份统计
            const [yearStats] = await db.promisePool.query(
                `SELECT 
                    manual_year_selection as year,
                    COUNT(*) as count,
                    SUM(weight) as total_weight
                FROM citrus_submissions 
                GROUP BY manual_year_selection
                ORDER BY manual_year_selection`
            );
            
            // 最近30天提交趋势
            const [trendStats] = await db.promisePool.query(
                `SELECT 
                    DATE(submitted_at) as date,
                    COUNT(*) as count,
                    SUM(weight) as total_weight
                FROM citrus_submissions 
                WHERE submitted_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
                GROUP BY DATE(submitted_at)
                ORDER BY date`
            );
            
            res.json({
                success: true,
                data: {
                    statusStats,
                    yearStats,
                    trendStats
                }
            });
            
        } catch (error) {
            console.error('获取提交统计错误:', error);
            res.status(500).json({
                success: false,
                error: '获取统计信息失败'
            });
        }
    }
}

// 创建控制器实例并绑定方法
const citrusController = new CitrusController();

module.exports = {
    submitCitrus: citrusController.submitCitrus.bind(citrusController),
    getTotalStock: citrusController.getTotalStock.bind(citrusController),
    getAllSubmissions: citrusController.getAllSubmissions.bind(citrusController),
    getPendingSubmissions: citrusController.getPendingSubmissions.bind(citrusController),
    reviewSubmission: citrusController.reviewSubmission.bind(citrusController),
    batchReview: citrusController.batchReview.bind(citrusController),
    getSubmissionStats: citrusController.getSubmissionStats.bind(citrusController)
};