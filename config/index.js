const databaseConfig = require('./database.config')
const serverConfig = require('./server.config')

// 环境配置
const env = process.env.NODE_ENV || 'development'
const envConfig = require('./env/' + env)

// 合并所有配置
const config = {
  env: env,
  isDevelopment: env === 'development',
  isProduction: env === 'production', 
  isTest: env === 'test',
  
  // 数据库配置
  database: databaseConfig.getConfig(),
  
  // 服务器配置
  server: serverConfig.getServerConfig(),
  
  // 上传配置
  upload: serverConfig.getUploadConfig(),
  
  // 安全配置
  security: serverConfig.getSecurityConfig(),
  
  // 环境特定配置
  ...envConfig
}

// 配置验证
try {
  databaseConfig.validateConfig()
  serverConfig.validateConfig()
  console.log(`✅ 配置文件验证通过 - 环境: ${env}`)
} catch (error) {
  console.error('❌ 配置文件验证失败:', error.message)
  process.exit(1)
}

// 配置工具函数
config.getDatabaseUrl = () => databaseConfig.getConnectionUrl()
config.getFullConfig = () => config

module.exports = config