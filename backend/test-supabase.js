require('dotenv').config();
const { testConnection } = require('./config/database');
const initSupabaseDatabase = require('./database/supabase-init');

const runTest = async () => {
  console.log('🧪 开始 Supabase 集成测试...\n');
  
  // 1. 测试连接
  const connected = await testConnection();
  if (!connected) {
    console.log('❌ 连接测试失败，请检查环境变量');
    process.exit(1);
  }
  
  // 2. 初始化数据库
  try {
    await initSupabaseDatabase();
    console.log('\n🎉 所有测试通过！Supabase 配置成功！');
  } catch (error) {
    console.log('\n❌ 数据库初始化失败:', error.message);
  }
};

runTest();
