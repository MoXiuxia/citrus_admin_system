module.exports = {
    // 数据库配置
    dbConfig: {
      host: process.env.TEST_DB_HOST || 'localhost',
      port: process.env.TEST_DB_PORT || 3306,
      username: process.env.TEST_DB_USER || 'root',
      password: process.env.TEST_DB_PASSWORD || '',
      database: process.env.TEST_DB_NAME || 'citrus_db_test',
      dialect: 'mysql',
      logging: false // 测试环境关闭日志
    },
  
    // 服务器配置
    serverConfig: {
      port: process.env.TEST_PORT || 3001,
      host: 'localhost',
      cors: {
        origin: ['http://localhost:3001'],
        credentials: true
      },
      rateLimit: {
        windowMs: 15 * 60 * 1000,
        max: 5000 // 测试环境放宽限制
      },
      static: {
        maxAge: 0, // 测试环境不缓存
        etag: false,
        lastModified: false
      },
      logging: {
        file: {
          enabled: false,
          path: './logs/test.log',
          maxSize: '10m',
          maxFiles: '7d'
        },
        console: {
          enabled: false // 测试环境关闭控制台日志
        }
      }
    },
  
    // 文件上传配置
    uploadConfig: {
      destination: './public/uploads/test',
      limits: {
        fileSize: 2 * 1024 * 1024, // 2MB - 测试环境较小
        files: 1
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
          cb(new Error('不支持的文件类型'), false)
        }
      }
    },
  
    // 安全配置
    securityConfig: {
      session: {
        secret: 'test-secret-key',
        resave: false,
        saveUninitialized: true,
        cookie: {
          secure: false,
          maxAge: 60 * 60 * 1000, // 1小时
          httpOnly: true
        }
      },
      password: {
        saltRounds: 4 // 测试环境使用较低的加密强度以加快测试速度
      },
      jwt: {
        secret: 'jwt-test-secret',
        expiresIn: '1h',
        issuer: 'citrus-system-test'
      }
    },
  
    // 测试环境特定配置
    test: {
      // 测试数据
      testData: {
        user: {
          username: 'testuser',
          password: 'testpassword'
        },
        admin: {
          username: 'testadmin', 
          password: 'testadmin'
        }
      },
      // 测试超时设置
      timeout: {
        unit: 5000,
        integration: 10000,
        e2e: 30000
      },
      // 数据库清理
      cleanup: true
    }
  }