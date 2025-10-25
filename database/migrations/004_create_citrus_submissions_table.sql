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
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 创建索引以提高查询性能
CREATE INDEX idx_citrus_submissions_status ON citrus_submissions(status);
CREATE INDEX idx_citrus_submissions_user_id ON citrus_submissions(user_id);
CREATE INDEX idx_citrus_submissions_submitted_at ON citrus_submissions(submitted_at);
CREATE INDEX idx_citrus_submissions_manual_year ON citrus_submissions(manual_year_selection);