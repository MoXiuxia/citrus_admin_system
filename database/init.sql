-- 创建数据库
-- 创建数据库
CREATE DATABASE IF NOT EXISTS citrus_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE citrus_db;

-- 执行迁移文件（使用绝对路径）
SOURCE H:/node-portable-MAD/node-portable-MAD/work/citrus-admin-system/database/migrations/001_create_users_table.sql;
SOURCE H:/node-portable-MAD/node-portable-MAD/work/citrus-admin-system/database/migrations/002_create_admins_table.sql;
SOURCE H:/node-portable-MAD/node-portable-MAD/work/citrus-admin-system/database/migrations/003_create_citrus_total_table.sql;
SOURCE H:/node-portable-MAD/node-portable-MAD/work/citrus-admin-system/database/migrations/004_create_citrus_submissions_table.sql;

-- 执行种子数据（使用绝对路径）
SOURCE H:/node-portable-MAD/node-portable-MAD/work/citrus-admin-system/database/seeds/admins_seed.sql;
SOURCE H:/node-portable-MAD/node-portable-MAD/work/citrus-admin-system/database/seeds/citrus_total_seed.sql;



-- -- 创建数据库
-- CREATE DATABASE IF NOT EXISTS citrus_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- USE citrus_db;

-- -- 用户信息表
-- CREATE TABLE IF NOT EXISTS users (
--     id INT AUTO_INCREMENT PRIMARY KEY,
--     username VARCHAR(50) UNIQUE NOT NULL,
--     password VARCHAR(255) NOT NULL,
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
-- );

-- -- 管理员信息表
-- CREATE TABLE IF NOT EXISTS admins (
--     id INT AUTO_INCREMENT PRIMARY KEY,
--     username VARCHAR(50) UNIQUE NOT NULL,
--     password VARCHAR(255) NOT NULL,
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
-- );

-- -- 陈皮总信息表
-- CREATE TABLE IF NOT EXISTS citrus_total (
--     id INT AUTO_INCREMENT PRIMARY KEY,
--     year_range VARCHAR(20) NOT NULL,
--     stock_weight DECIMAL(10,2) DEFAULT 0.00,
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
-- );

-- -- 用户提交的陈皮详细信息表
-- CREATE TABLE IF NOT EXISTS citrus_submissions (
--     id INT AUTO_INCREMENT PRIMARY KEY,
--     user_id INT NOT NULL,
--     image_url VARCHAR(500),
--     ai_year_result VARCHAR(20),
--     manual_year_selection VARCHAR(20) NOT NULL,
--     weight DECIMAL(8,2) NOT NULL,
--     status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
--     submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     reviewed_at TIMESTAMP NULL,
--     FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
-- );

-- -- 插入初始管理员账号
-- INSERT IGNORE INTO admins (username, password) VALUES 
-- ('admin', 'admin');

-- -- 插入陈皮年份库存初始数据
-- INSERT IGNORE INTO citrus_total (year_range, stock_weight) VALUES 
-- ('0-10', 0),
-- ('10-20', 0),
-- ('20-30', 0),
-- ('30+', 0);

-- -- 创建索引以提高查询性能
-- CREATE INDEX idx_citrus_submissions_status ON citrus_submissions(status);
-- CREATE INDEX idx_citrus_submissions_user_id ON citrus_submissions(user_id);
-- CREATE INDEX idx_citrus_submissions_submitted_at ON citrus_submissions(submitted_at);


