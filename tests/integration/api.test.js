const request = require('supertest')
const app = require('../../app') // 后端 Express 应用
const db = require('../../database/config')

// 测试数据
const testUser = {
  username: 'testuser_' + Date.now(),
  password: 'testpassword123'
}

const testAdmin = {
  username: 'admin',
  password: 'admin'
}

describe('API 集成测试', () => {
  beforeAll(async () => {
    // 确保数据库连接
    await db.authenticate()
  })

  afterAll(async () => {
    // 清理测试数据
    await db.query('DELETE FROM users WHERE username LIKE "testuser_%"')
    await db.close()
  })

  describe('认证相关接口', () => {
    test('POST /api/register - 用户注册', async () => {
      const response = await request(app)
        .post('/api/register')
        .send({
          username: testUser.username,
          password: testUser.password
        })
        .expect('Content-Type', /json/)
        .expect(200)

      expect(response.body).toHaveProperty('message', '注册成功')
    })

    test('POST /api/register - 重复用户名注册失败', async () => {
      const response = await request(app)
        .post('/api/register')
        .send({
          username: testUser.username,
          password: 'anotherpassword'
        })
        .expect('Content-Type', /json/)
        .expect(400)

      expect(response.body).toHaveProperty('error')
    })

    test('POST /api/user-login - 用户登录', async () => {
      const response = await request(app)
        .post('/api/user-login')
        .send({
          username: testUser.username,
          password: testUser.password
        })
        .expect('Content-Type', /json/)
        .expect(200)

      expect(response.body).toHaveProperty('message', '登录成功')
      expect(response.body).toHaveProperty('user')
      expect(response.body.user).toHaveProperty('username', testUser.username)
    })

    test('POST /api/admin-login - 管理员登录', async () => {
      const response = await request(app)
        .post('/api/admin-login')
        .send({
          username: testAdmin.username,
          password: testAdmin.password
        })
        .expect('Content-Type', /json/)
        .expect(200)

      expect(response.body).toHaveProperty('message', '管理员登录成功')
    })
  })

  describe('陈皮管理接口', () => {
    let authToken
    let userId

    beforeAll(async () => {
      // 登录获取令牌
      const loginResponse = await request(app)
        .post('/api/user-login')
        .send({
          username: testUser.username,
          password: testUser.password
        })

      userId = loginResponse.body.user.id
    })

    test('POST /api/submit-citrus - 提交陈皮信息', async () => {
      const response = await request(app)
        .post('/api/submit-citrus')
        .field('userId', userId)
        .field('manualYear', '10-20')
        .field('weight', '250.5')
        .attach('image', Buffer.from('fake image content'), 'test.jpg')
        .expect('Content-Type', /json/)
        .expect(200)

      expect(response.body).toHaveProperty('message', '提交成功')
      expect(response.body).toHaveProperty('aiYearResult')
      expect(response.body).toHaveProperty('status')
    })

    test('GET /api/total-stock - 获取总库存', async () => {
      const response = await request(app)
        .get('/api/total-stock')
        .expect('Content-Type', /json/)
        .expect(200)

      expect(Array.isArray(response.body)).toBe(true)
      expect(response.body.length).toBeGreaterThan(0)
      expect(response.body[0]).toHaveProperty('year_range')
      expect(response.body[0]).toHaveProperty('stock_weight')
    })

    test('GET /api/all-submissions - 获取所有提交', async () => {
      const response = await request(app)
        .get('/api/all-submissions')
        .expect('Content-Type', /json/)
        .expect(200)

      expect(Array.isArray(response.body)).toBe(true)
    })
  })

  describe('管理员接口', () => {
    test('GET /api/pending-submissions - 获取待审核任务', async () => {
      const response = await request(app)
        .get('/api/pending-submissions')
        .expect('Content-Type', /json/)
        .expect(200)

      expect(Array.isArray(response.body)).toBe(true)
    })

    test('POST /api/review-submission - 审核提交', async () => {
      // 先获取一个待审核的提交
      const pendingResponse = await request(app)
        .get('/api/pending-submissions')

      if (pendingResponse.body.length > 0) {
        const submissionId = pendingResponse.body[0].id
        
        const response = await request(app)
          .post('/api/review-submission')
          .send({
            submissionId: submissionId,
            status: 'approved'
          })
          .expect('Content-Type', /json/)
          .expect(200)

        expect(response.body).toHaveProperty('message', '审核完成')
      }
    })
  })

  describe('错误处理', () => {
    test('POST /api/submit-citrus - 缺少必要参数', async () => {
      const response = await request(app)
        .post('/api/submit-citrus')
        .send({})
        .expect('Content-Type', /json/)
        .expect(500)

      expect(response.body).toHaveProperty('error')
    })

    test('GET /api/nonexistent - 不存在的接口', async () => {
      const response = await request(app)
        .get('/api/nonexistent')
        .expect(404)
    })
  })
})