const { dbConfig } = require('./env/' + (process.env.NODE_ENV || 'development'))

module.exports = {
  // 数据库连接配置
  development: {
    host: dbConfig.host,
    port: dbConfig.port,
    user: dbConfig.username,
    password: dbConfig.password,
    database: dbConfig.database,
    charset: 'utf8mb4',
    connectionLimit: 10,
    acquireTimeout: 60000,
    timeout: 60000,
    reconnect: true,
    // 连接池配置
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    // 连接重试配置
    retry: {
      max: 3,
      timeout: 1000
    }
  },

  test: {
    host: dbConfig.host,
    port: dbConfig.port,
    user: dbConfig.username,
    password: dbConfig.password,
    database: dbConfig.database,
    charset: 'utf8mb4',
    connectionLimit: 5,
    acquireTimeout: 30000,
    timeout: 30000
  },

  production: {
    host: dbConfig.host,
    port: dbConfig.port,
    user: dbConfig.username,
    password: dbConfig.password,
    database: dbConfig.database,
    charset: 'utf8mb4',
    connectionLimit: 20,
    acquireTimeout: 60000,
    timeout: 60000,
    // 生产环境连接池配置
    pool: {
      max: 20,
      min: 5,
      acquire: 60000,
      idle: 30000
    },
    // 生产环境重试配置
    retry: {
      max: 5,
      timeout: 2000
    }
  },

  // 获取当前环境配置
  getConfig: function() {
    const env = process.env.NODE_ENV || 'development'
    return this[env]
  },

  // 数据库连接URL（用于某些ORM）
  getConnectionUrl: function() {
    const config = this.getConfig()
    return `mysql://${config.user}:${config.password}@${config.host}:${config.port}/${config.database}`
  },

  // 验证配置
  validateConfig: function() {
    const config = this.getConfig()
    const required = ['host', 'port', 'user', 'password', 'database']
    const missing = required.filter(field => !config[field])
    
    if (missing.length > 0) {
      throw new Error(`数据库配置缺少以下字段: ${missing.join(', ')}`)
    }
    
    return true
  }
}