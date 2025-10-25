module.exports = {
    // 数据库配置
    dbConfig: {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      username: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'citrus_db_development',
      dialect: 'mysql',
      logging: console.log
    },
  
    // 服务器配置
    serverConfig: {
      port: process.env.PORT || 3000,
      host: process.env.HOST || 'localhost',
      cors: {
        origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
        credentials: true
      },
      rateLimit: {
        windowMs: 15 * 60 * 1000, // 15分钟
        max: 1000 // 每窗口最多1000次请求
      },
      static: {
        maxAge: 3600000, // 1小时
        etag: true,
        lastModified: true
      },
      logging: {
        file: {
          enabled: false,
          path: './logs/development.log',
          maxSize: '10m',
          maxFiles: '7d'
        },
        console: {
          enabled: true
        }
      }
    },
  
    // 文件上传配置
    uploadConfig: {
      destination: './public/uploads/development',
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
        files: 5
      },
      fileFilter: (req, file, cb) => {
        const allowedMimes = [
          'image/jpeg',
          'image/jpg',
          'image/png',
          'image/gif',
          'image/webp'
        ]
        if (allowedMimes.includes(file.mimetype)) {
          cb(null, true)
        } else {
          cb(new Error('不支持的文件类型'), false)
        }
      }
    },
  
    // 安全配置
    securityConfig: {
      session: {
        secret: process.env.SESSION_SECRET || 'development-secret-key-change-in-production',
        resave: false,
        saveUninitialized: true,
        cookie: {
          secure: false,
          maxAge: 24 * 60 * 60 * 1000, // 24小时
          httpOnly: true
        }
      },
      password: {
        saltRounds: 10
      },
      jwt: {
        secret: process.env.JWT_SECRET || 'jwt-development-secret',
        expiresIn: '24h',
        issuer: 'citrus-system-dev'
      }
    },
  
    // 开发环境特定配置
    development: {
      // 启用详细日志
      debug: true,
      // 自动重新加载
      autoReload: true,
      // 数据库同步（慎用）
      dbSync: false,
      // 种子数据
      seedData: true
    }
  }