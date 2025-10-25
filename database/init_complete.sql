-- 创建数据库
CREATE DATABASE IF NOT EXISTS citrus_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE citrus_db;

-- 用户信息表
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100),
    phone VARCHAR(20),
    real_name VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 管理员信息表
CREATE TABLE IF NOT EXISTS admins (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('super_admin', 'admin') DEFAULT 'admin',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 陈皮总信息表
CREATE TABLE IF NOT EXISTS citrus_total (
    id INT AUTO_INCREMENT PRIMARY KEY,
    year_range VARCHAR(20) NOT NULL UNIQUE,
    stock_weight DECIMAL(10,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 用户提交的陈皮详细信息表
CREATE TABLE IF NOT EXISTS citrus_submissions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    image_url VARCHAR(500),
    ai_year_result VARCHAR(20),
    manual_year_selection VARCHAR(20) NOT NULL,
    weight DECIMAL(8,2) NOT NULL,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reviewed_at TIMESTAMP NULL,
    notes TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 创建索引
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_admins_username ON admins(username);
CREATE INDEX idx_citrus_total_year ON citrus_total(year_range);
CREATE INDEX idx_citrus_submissions_status ON citrus_submissions(status);
CREATE INDEX idx_citrus_submissions_user_id ON citrus_submissions(user_id);
CREATE INDEX idx_citrus_submissions_submitted_at ON citrus_submissions(submitted_at);

-- 插入初始管理员账号
INSERT IGNORE INTO admins (username, password, role) VALUES 
('admin', 'admin', 'super_admin');

-- 插入测试管理员账号（使用bcrypt加密的密码：admin123）
INSERT IGNORE INTO admins (username, password, role) VALUES 
('superadmin', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'super_admin');

-- 插入陈皮年份库存初始数据
INSERT IGNORE INTO citrus_total (year_range, stock_weight) VALUES 
('0-10', 0),
('10-20', 0),
('20-30', 0),
('30+', 0);

-- 插入测试用户（使用bcrypt加密的密码：password）
INSERT IGNORE INTO users (username, password, email, real_name) VALUES 
('testuser', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'test@example.com', '测试用户');

-- 显示创建的表
SHOW TABLES;

-- 显示各表的数据统计
SELECT 'users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'admins', COUNT(*) FROM admins
UNION ALL
SELECT 'citrus_total', COUNT(*) FROM citrus_total
UNION ALL
SELECT 'citrus_submissions', COUNT(*) FROM citrus_submissions;