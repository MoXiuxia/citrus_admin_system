const app = require('./app');
const db = require('./config/database');
const initDatabase = require('./database/supabase-init');

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    // 测试数据库连接
    const dbConnected = await db.testConnection();
    if (!dbConnected) {
      console.error('❌ 数据库连接失败，服务器无法启动');
      process.exit(1);
    }
    
    // 初始化数据库表结构
    console.log('🔄 初始化数据库表结构...');
    await initDatabase();
    
    // 启动服务器
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`✅ 服务器运行在端口 ${PORT}`);
      console.log(`📊 Supabase 数据库连接成功`);
    });
    
  } catch (error) {
    console.error('❌ 服务器启动失败:', error);
    process.exit(1);
  }
};

startServer();