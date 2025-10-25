module.exports = {
    // 数据库配置
    dbConfig: {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      username: process.env.DB_USER || 'citrus_user',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'citrus_db_production',
      dialect: 'mysql',
      logging: false, // 生产环境关闭SQL日志
      // 生产环境连接池优化
      pool: {
        max: 20,
        min: 5,
        acquire: 60000,
        idle: 30000
      }
    },
  
    // 服务器配置
    serverConfig: {
      port: process.env.PORT || 3000,
      host: process.env.HOST || '0.0.0.0',
      cors: {
        origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : ['https://yourdomain.com'],
        credentials: true
      },
      rateLimit: {
        windowMs: 15 * 60 * 1000, // 15分钟
        max: 100 // 生产环境限制更严格
      },
      static: {
        maxAge: 31536000000, // 1年
        etag: true,
        lastModified: true
      },
      logging: {
        file: {
          enabled: true,
          path: './logs/production.log',
          maxSize: '50m',
          maxFiles: '30d'
        },
        console: {
          enabled: false
        }
      }
    },
  
    // 文件上传配置
    uploadConfig: {
      destination: './public/uploads/production',
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB - 生产环境更严格
        files: 3
      },
      fileFilter: (req, file, cb) => {
        const allowedMimes = [
          'image/jpeg',
          'image/jpg',
          'image/png'
        ]
        if (allowedMimes.includes(file.mimetype)) {
          cb(null, true)
        } else {
          cb(new Error('不支持的文件类型，仅支持JPEG和PNG格式'), false)
        }
      }
    },
  
    // 安全配置
    securityConfig: {
      session: {
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        cookie: {
          secure: true, // 生产环境必须HTTPS
          maxAge: 24 * 60 * 60 * 1000, // 24小时
          httpOnly: true,
          sameSite: 'strict'
        }
      },
      password: {
        saltRounds: 12 // 生产环境使用更高的加密强度
      },
      jwt: {
        secret: process.env.JWT_SECRET,
        expiresIn: '12h', // 生产环境token有效期更短
        issuer: 'citrus-system-prod'
      }
    },
  
    // 生产环境特定配置
    production: {
      // 性能优化
      compression: true,
      cache: true,
      // 监控
      monitoring: true,
      // 备份
      backup: {
        enabled: true,
        schedule: '0 2 * * *' // 每天凌晨2点
      },
      // 错误追踪
      errorTracking: true
    }
  }