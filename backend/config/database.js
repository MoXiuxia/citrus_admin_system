// const mysql = require('mysql2');
// require('dotenv').config();

// // 数据库连接配置
// const dbConfig = {
//     host: process.env.DB_HOST || 'localhost',
//     port: process.env.DB_PORT || 3306,
//     user: process.env.DB_USER || 'root',
//     password: process.env.DB_PASSWORD || '123456',
//     database: process.env.DB_NAME || 'citrus_db',
//     charset: 'utf8mb4',
//     timezone: '+08:00',
//     connectTimeout: 10000,
//     acquireTimeout: 10000,
//     timeout: 10000,
//     waitForConnections: true,
//     connectionLimit: 10,
//     queueLimit: 0,
//     multipleStatements: true
// };

// // 创建连接池
// const pool = mysql.createPool(dbConfig);
// const promisePool = pool.promise();

// // 添加 getPool 函数
// const getPool = () => {
//     return pool;
// };

// // 改进的连接测试函数
// const testConnection = async () => {
//     let connection;
//     try {
//         connection = await promisePool.getConnection();
//         console.log('✅ 数据库连接成功');
        
//         // 测试查询
//         const [rows] = await connection.execute('SELECT 1 as test');
//         console.log('✅ 数据库查询测试成功');
        
//         connection.release();
//         return true;
//     } catch (error) {
//         console.error('❌ 数据库连接失败:', error.message);
        
//         // 提供详细的错误信息
//         if (error.code === 'ER_ACCESS_DENIED_ERROR') {
//             console.error('💡 提示: 请检查数据库用户名和密码是否正确');
//         } else if (error.code === 'ECONNREFUSED') {
//             console.error('💡 提示: 请确保MySQL服务正在运行');
//         } else if (error.code === 'ER_BAD_DB_ERROR') {
//             console.error('💡 提示: 数据库不存在，将尝试创建');
//         }
        
//         if (connection) {
//             connection.release();
//         }
//         return false;
//     }
// };

// // 简化的数据库初始化
// const initDatabase = async () => {
//     try {
//         console.log('🔄 正在初始化数据库...');
        
//         // 首先创建数据库（如果不存在）
//         await promisePool.query(`CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
//         await promisePool.query(`USE \`${dbConfig.database}\``);
//         console.log('✅ 数据库创建/选择成功');
        
//         // 检查表是否存在，如果不存在则创建
//         const [tables] = await promisePool.query('SHOW TABLES');
        
//         if (tables.length === 0) {
//             console.log('📦 创建数据库表结构...');
//             await createTables();
//             await insertSeedData();
//         } else {
//             console.log('✅ 数据库表已存在，跳过初始化');
//         }
        
//         return true;
//     } catch (error) {
//         console.error('❌ 数据库初始化失败:', error.message);
//         return false;
//     }
// };

// // 创建表结构
// const createTables = async () => {
//     const tablesSQL = [
//         `CREATE TABLE IF NOT EXISTS users (
//             id INT AUTO_INCREMENT PRIMARY KEY,
//             username VARCHAR(50) UNIQUE NOT NULL,
//             password VARCHAR(255) NOT NULL,
//             email VARCHAR(100),
//             phone VARCHAR(20),
//             real_name VARCHAR(50),
//             created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//             updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
//             INDEX idx_username (username)
//         ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

//         `CREATE TABLE IF NOT EXISTS admins (
//             id INT AUTO_INCREMENT PRIMARY KEY,
//             username VARCHAR(50) UNIQUE NOT NULL,
//             password VARCHAR(255) NOT NULL,
//             role ENUM('super_admin', 'admin') DEFAULT 'admin',
//             created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//             updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
//             INDEX idx_admin_username (username)
//         ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

//         `CREATE TABLE IF NOT EXISTS citrus_total (
//             id INT AUTO_INCREMENT PRIMARY KEY,
//             year_range VARCHAR(20) NOT NULL UNIQUE,
//             stock_weight DECIMAL(10,2) DEFAULT 0.00,
//             created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//             updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
//             INDEX idx_year_range (year_range)
//         ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

//         `CREATE TABLE IF NOT EXISTS citrus_submissions (
//             id INT AUTO_INCREMENT PRIMARY KEY,
//             user_id INT NOT NULL,
//             image_url VARCHAR(500),
//             ai_year_result VARCHAR(20),
//             manual_year_selection VARCHAR(20) NOT NULL,
//             weight DECIMAL(8,2) NOT NULL,
//             status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
//             submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//             reviewed_at TIMESTAMP NULL,
//             notes TEXT,
//             FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
//             INDEX idx_status (status),
//             INDEX idx_user_id (user_id),
//             INDEX idx_submitted_at (submitted_at)
//         ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`
//     ];

//     for (const sql of tablesSQL) {
//         await promisePool.query(sql);
//     }
//     console.log('✅ 所有表创建完成');
// };

// // 插入初始数据
// const insertSeedData = async () => {
//     try {
//         // 插入管理员账号
//         await promisePool.query(`INSERT IGNORE INTO admins (username, password, role) VALUES 
//             ('admin', 'admin', 'super_admin')`);

//         // 插入陈皮年份数据 - 更新为完整的年份范围
//         const yearRanges = [
//             '0-5', '5-10', '10-15', '15-20', '20-25', '25-30', '30-35', '35-40',
//             '40-45', '45-50', '50-55', '55-60', '60-65', '65-70', '70-75', '75-80',
//             '80-85', '85-90', '90-95', '95-100', '100-105', '105-110', '110-115',
//             '115-120', '120-125', '125-130', '130-135', '135-140', '140-145',
//             '145-150', '150+'
//         ];
        
//         const insertPromises = yearRanges.map(yearRange => 
//             promisePool.query(`INSERT IGNORE INTO citrus_total (year_range, stock_weight) VALUES (?, 0)`, [yearRange])
//         );
        
//         await Promise.all(insertPromises);
//         console.log('✅ 陈皮年份数据插入完成');

//     } catch (error) {
//         console.log('⚠️  部分初始数据插入失败（可能已存在）:', error.message);
//     }
// };

// // 查询辅助函数
// const query = async (sql, params = []) => {
//     try {
//         const [rows, fields] = await promisePool.execute(sql, params);
//         return { success: true, data: rows, fields };
//     } catch (error) {
//         console.error('数据库查询错误:', error);
//         return { success: false, error: error.message };
//     }
// };

// module.exports = {
//     dbConfig,
//     pool,
//     promisePool,
//     getPool, // 添加这个导出
//     testConnection,
//     initDatabase,
//     query
// };

const { Pool } = require('pg');
require('dotenv').config();

// 使用 Supabase PostgreSQL 连接 - 增强配置
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { 
    rejectUnauthorized: false 
  },
  // 连接池优化配置
  max: 10,                    // 最大连接数
  idleTimeoutMillis: 30000,   // 空闲连接超时
  connectionTimeoutMillis: 5000, // 连接超时
  maxUses: 7500,              // 单个连接最大使用次数
});

// 添加连接池事件监听
pool.on('connect', (client) => {
  console.log('🔗 新的数据库连接建立');
});

pool.on('error', (err, client) => {
  console.error('❌ 数据库连接池错误:', err);
});

// 测试连接
const testConnection = async () => {
  let client;
  try {
    client = await pool.connect();
    console.log('✅ Supabase 数据库连接成功');
    
    // 测试查询
    const result = await client.query('SELECT NOW() as current_time');
    console.log('✅ 数据库查询测试成功，当前时间:', result.rows[0].current_time);
    
    return true;
  } catch (error) {
    console.error('❌ 数据库连接失败:', error.message);
    return false;
  } finally {
    if (client) client.release();
  }
};

// 执行查询的辅助函数
const query = async (text, params = []) => {
  let client;
  try {
    client = await pool.connect();
    const result = await client.query(text, params);
    return { 
      success: true, 
      data: result.rows,
      rowCount: result.rowCount
    };
  } catch (error) {
    console.error('数据库查询错误:', error);
    return { 
      success: false, 
      error: error.message 
    };
  } finally {
    if (client) client.release();
  }
};

module.exports = {
  pool,
  testConnection,
  query
};