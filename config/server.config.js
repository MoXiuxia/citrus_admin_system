const { serverConfig, uploadConfig, securityConfig } = require('./env/' + (process.env.NODE_ENV || 'development'))

module.exports = {
  // 服务器基础配置
  server: {
    port: serverConfig.port,
    host: serverConfig.host,
    env: process.env.NODE_ENV || 'development',
    name: '陈皮信息管理系统',
    version: '1.0.0',
    
    // CORS 配置
    cors: {
      origin: serverConfig.cors.origin,
      credentials: serverConfig.cors.credentials,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
    },
    
    // 请求限制
    rateLimit: {
      windowMs: serverConfig.rateLimit.windowMs,
      max: serverConfig.rateLimit.max
    },
    
    // 静态文件服务
    static: {
      maxAge: serverConfig.static.maxAge,
      etag: serverConfig.static.etag,
      lastModified: serverConfig.static.lastModified
    }
  },

  // 文件上传配置
  upload: {
    destination: uploadConfig.destination,
    limits: {
      fileSize: uploadConfig.limits.fileSize,
      files: uploadConfig.limits.files
    },
    fileFilter: uploadConfig.fileFilter,
    // 支持的文件类型
    allowedMimeTypes: [
      'image/jpeg',
      'image/jpg', 
      'image/png',
      'image/gif',
      'image/webp'
    ],
    // 文件命名策略
    filename: function(req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
      cb(null, file.fieldname + '-' + uniqueSuffix + '.' + file.originalname.split('.').pop())
    }
  },

  // 安全配置
  security: {
    // 会话配置
    session: {
      secret: securityConfig.session.secret,
      resave: securityConfig.session.resave,
      saveUninitialized: securityConfig.session.saveUninitialized,
      cookie: {
        secure: securityConfig.session.cookie.secure,
        maxAge: securityConfig.session.cookie.maxAge,
        httpOnly: securityConfig.session.cookie.httpOnly
      }
    },
    
    // 密码加密
    password: {
      saltRounds: securityConfig.password.saltRounds,
      algorithm: 'bcrypt'
    },
    
    // JWT 配置（如果使用）
    jwt: {
      secret: securityConfig.jwt.secret,
      expiresIn: securityConfig.jwt.expiresIn,
      issuer: securityConfig.jwt.issuer
    },
    
    // Helmet 安全头配置
    helmet: {
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", "data:", "blob:"]
        }
      }
    }
  },

  // 日志配置
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    file: {
      enabled: serverConfig.logging.file.enabled,
      path: serverConfig.logging.file.path,
      maxSize: serverConfig.logging.file.maxSize,
      maxFiles: serverConfig.logging.file.maxFiles
    },
    console: {
      enabled: serverConfig.logging.console.enabled,
      colorize: true
    }
  },

  // 获取当前环境服务器配置
  getServerConfig: function() {
    return this.server
  },

  // 获取上传配置
  getUploadConfig: function() {
    return this.upload
  },

  // 获取安全配置
  getSecurityConfig: function() {
    return this.security
  },

  // 验证服务器配置
  validateConfig: function() {
    const config = this.getServerConfig()
    
    if (!config.port || config.port < 1 || config.port > 65535) {
      throw new Error('服务器端口配置无效')
    }
    
    if (!config.host) {
      throw new Error('服务器主机配置缺失')
    }
    
    return true
  }
}