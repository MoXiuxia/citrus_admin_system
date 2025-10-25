const { query } = require('../config/database');

const initDatabase = async () => {
    try {
        console.log('🔄 正在初始化数据库表结构...');
        
        // 创建用户表
        await query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                username VARCHAR(50) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                email VARCHAR(100),
                phone VARCHAR(20),
                real_name VARCHAR(50),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        
        // 创建管理员表
        await query(`
            CREATE TABLE IF NOT EXISTS admins (
                id SERIAL PRIMARY KEY,
                username VARCHAR(50) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                role VARCHAR(20) DEFAULT 'admin',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        
        // 创建陈皮总库存表
        await query(`
            CREATE TABLE IF NOT EXISTS citrus_total (
                id SERIAL PRIMARY KEY,
                year_range VARCHAR(20) NOT NULL UNIQUE,
                stock_weight DECIMAL(10,2) DEFAULT 0.00,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        
        // 创建陈皮提交表
        await query(`
            CREATE TABLE IF NOT EXISTS citrus_submissions (
                id SERIAL PRIMARY KEY,
                user_id INT NOT NULL,
                image_url VARCHAR(500),
                ai_year_result VARCHAR(20),
                manual_year_selection VARCHAR(20) NOT NULL,
                weight DECIMAL(8,2) NOT NULL,
                status VARCHAR(20) DEFAULT 'pending',
                submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                reviewed_at TIMESTAMP NULL,
                notes TEXT
            )
        `);
        
        console.log('✅ 数据库表结构创建完成');
        
        // 插入初始数据
        await insertInitialData();
        
    } catch (error) {
        console.error('❌ 数据库初始化失败:', error);
        throw error;
    }
};

const insertInitialData = async () => {
    try {
        // 插入默认管理员
        await query(`
            INSERT INTO admins (username, password, role) 
            VALUES ($1, $2, $3)
            ON CONFLICT (username) DO NOTHING
        `, ['admin', 'admin123', 'super_admin']);
        
        // 插入陈皮年份数据
        const yearRanges = [
            '0-5', '5-10', '10-15', '15-20', '20-25', '25-30', '30-35', '35-40',
            '40-45', '45-50', '50-55', '55-60', '60-65', '65-70', '70-75', '75-80',
            '80-85', '85-90', '90-95', '95-100', '100-105', '105-110', '110-115',
            '115-120', '120-125', '125-130', '130-135', '135-140', '140-145',
            '145-150', '150+'
        ];
        
        for (const yearRange of yearRanges) {
            await query(`
                INSERT INTO citrus_total (year_range, stock_weight) 
                VALUES ($1, $2)
                ON CONFLICT (year_range) DO NOTHING
            `, [yearRange, 0]);
        }
        
        console.log('✅ 初始数据插入完成');
    } catch (error) {
        console.log('⚠️ 初始数据插入部分失败（可能已存在）:', error.message);
    }
};

module.exports = initDatabase;