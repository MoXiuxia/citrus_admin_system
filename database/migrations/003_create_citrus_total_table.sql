-- 陈皮总信息表
CREATE TABLE IF NOT EXISTS citrus_total (
    id INT AUTO_INCREMENT PRIMARY KEY,
    year_range VARCHAR(20) NOT NULL,
    stock_weight DECIMAL(10,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 创建索引以提高查询性能
CREATE INDEX idx_citrus_total_year_range ON citrus_total(year_range);