describe('陈皮管理系统端到端测试', () => {
    beforeEach(() => {
      // 每次测试前清除本地存储并访问首页
      cy.clearLocalStorage()
      cy.visit('http://localhost:3000')
    })
  
    describe('用户认证流程', () => {
      it('应该成功注册新用户', () => {
        const username = `testuser_${Date.now()}`
        
        cy.get('.tab-buttons button').contains('用户注册').click()
        cy.get('input[placeholder="请输入账号"]').type(username)
        cy.get('input[placeholder="请输入密码"]').type('testpassword123')
        cy.get('input[placeholder="请再次输入密码"]').type('testpassword123')
        cy.get('button').contains('注册').click()
  
        cy.get('.message.success').should('contain', '注册成功')
      })
  
      it('应该成功登录用户', () => {
        cy.get('input[placeholder="请输入账号"]').type('testuser')
        cy.get('input[placeholder="请输入密码"]').type('password')
        cy.get('button').contains('登录').click()
  
        cy.url().should('include', '/user')
        cy.contains('提交陈皮信息').should('be.visible')
      })
  
      it('应该成功登录管理员', () => {
        cy.get('.tab-buttons button').contains('管理员登录').click()
        cy.get('input[placeholder="请输入管理员账号"]').type('admin')
        cy.get('input[placeholder="请输入密码"]').type('admin')
        cy.get('button').contains('管理员登录').click()
  
        cy.url().should('include', '/admin')
        cy.contains('库存状态').should('be.visible')
      })
    })
  
    describe('用户功能流程', () => {
      beforeEach(() => {
        // 登录用户
        cy.loginUser('testuser', 'password')
      })
  
      it('应该成功提交陈皮信息', () => {
        // 上传图片
        cy.get('input[type="file"]').attachFile('test-citrus.jpg')
        
        // 等待AI识别结果
        cy.get('input[placeholder="上传图片后自动识别"]', { timeout: 10000 })
          .should('have.value')
        
        // 选择年份
        cy.get('select').select('10-20')
        
        // 输入重量
        cy.get('input[placeholder="请输入陈皮重量（克）"]').type('250.5')
        
        // 提交
        cy.get('button').contains('提交').click()
  
        // 检查成功模态框
        cy.get('.modal').should('be.visible')
        cy.get('.modal-content h3').should('contain', '提交成功')
      })
  
      it('应该显示表单验证错误', () => {
        // 不填写任何信息直接提交
        cy.get('button').contains('提交').click()
        
        // 检查按钮是否被禁用或显示错误信息
        cy.get('button').contains('提交').should('be.disabled')
      })
    })
  
    describe('管理员功能流程', () => {
      beforeEach(() => {
        // 登录管理员
        cy.loginAdmin('admin', 'admin')
      })
  
      it('应该显示库存状态', () => {
        cy.contains('库存状态').click()
        cy.get('.table').should('be.visible')
        cy.get('th').contains('年份范围').should('be.visible')
        cy.get('th').contains('库存克数').should('be.visible')
      })
  
      it('应该显示所有提交信息', () => {
        cy.contains('所有提交').click()
        cy.get('.table').should('be.visible')
        cy.get('th').contains('用户').should('be.visible')
        cy.get('th').contains('状态').should('be.visible')
      })
  
      it('应该审核待处理提交', () => {
        cy.contains('待审核任务').click()
        
        // 如果有待审核的提交
        cy.get('tbody tr').then(($rows) => {
          if ($rows.length > 0) {
            cy.get('button').contains('通过').first().click()
            cy.contains('审核完成').should('be.visible')
          }
        })
      })
  
      it('应该添加新管理员', () => {
        cy.contains('管理员管理').click()
        
        const adminUsername = `newadmin_${Date.now()}`
        cy.get('input[placeholder="请输入新管理员账号"]').type(adminUsername)
        cy.get('input[placeholder="请输入密码"]').type('newadmin123')
        cy.get('button').contains('添加管理员').click()
  
        cy.contains('管理员添加成功').should('be.visible')
      })
    })
  
    describe('导航和权限控制', () => {
      it('未登录用户应该重定向到登录页', () => {
        cy.visit('http://localhost:3000/user')
        cy.url().should('include', '/login')
        
        cy.visit('http://localhost:3000/admin')
        cy.url().should('include', '/login')
      })
  
      it('普通用户不能访问管理员页面', () => {
        cy.loginUser('testuser', 'password')
        cy.visit('http://localhost:3000/admin')
        cy.url().should('include', '/user')
      })
  
      it('应该成功退出登录', () => {
        cy.loginUser('testuser', 'password')
        cy.get('button').contains('退出登录').click()
        cy.url().should('include', '/login')
      })
    })
  })
  
  // Cypress 命令扩展
  Cypress.Commands.add('loginUser', (username, password) => {
    cy.visit('http://localhost:3000/login')
    cy.get('input[placeholder="请输入账号"]').type(username)
    cy.get('input[placeholder="请输入密码"]').type(password)
    cy.get('button').contains('登录').click()
  })
  
  Cypress.Commands.add('loginAdmin', (username, password) => {
    cy.visit('http://localhost:3000/login')
    cy.get('.tab-buttons button').contains('管理员登录').click()
    cy.get('input[placeholder="请输入管理员账号"]').type(username)
    cy.get('input[placeholder="请输入密码"]').type(password)
    cy.get('button').contains('管理员登录').click()
  })