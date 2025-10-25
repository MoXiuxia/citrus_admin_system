-- 插入初始管理员账号
INSERT IGNORE INTO admins (username, password) VALUES 
('admin', 'admin');

-- 注意：在实际生产环境中，密码应该使用加密存储
-- 例如：INSERT IGNORE INTO admins (username, password) VALUES ('admin', MD5('admin'));