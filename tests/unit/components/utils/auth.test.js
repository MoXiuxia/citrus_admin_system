import { 
    checkAuthStatus, 
    hasPermission, 
    secureLogout 
  } from '../../../src/utils/auth'
  
  // Mock localStorage
  const localStorageMock = (() => {
    let store = {}
    return {
      getItem: jest.fn(key => store[key] || null),
      setItem: jest.fn((key, value) => {
        store[key] = value.toString()
      }),
      removeItem: jest.fn(key => {
        delete store[key]
      }),
      clear: jest.fn(() => {
        store = {}
      })
    }
  })()
  
  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock
  })
  
  // Mock Vue Router
  const mockRouter = {
    push: jest.fn()
  }
  
  describe('认证工具函数单元测试', () => {
    beforeEach(() => {
      localStorage.clear()
      jest.clearAllMocks()
    })
  
    describe('checkAuthStatus', () => {
      test('应该正确返回未认证状态', () => {
        const status = checkAuthStatus()
        
        expect(status.isAuthenticated).toBe(false)
        expect(status.isAdmin).toBe(false)
        expect(status.user).toBe(null)
      })
  
      test('应该正确返回用户认证状态', () => {
        const userData = { id: 1, username: 'testuser' }
        localStorage.setItem('user', JSON.stringify(userData))
        
        const status = checkAuthStatus()
        
        expect(status.isAuthenticated).toBe(true)
        expect(status.isAdmin).toBe(false)
        expect(status.user).toEqual(userData)
      })
  
      test('应该正确返回管理员认证状态', () => {
        localStorage.setItem('admin', 'true')
        const userData = { id: 1, username: 'admin' }
        localStorage.setItem('user', JSON.stringify(userData))
        
        const status = checkAuthStatus()
        
        expect(status.isAuthenticated).toBe(true)
        expect(status.isAdmin).toBe(true)
        expect(status.user).toEqual(userData)
      })
    })
  
    describe('hasPermission', () => {
      test('管理员应该拥有所有权限', () => {
        localStorage.setItem('admin', 'true')
        
        expect(hasPermission('any_permission')).toBe(true)
      })
  
      test('认证用户应该拥有基本权限', () => {
        const userData = { id: 1, username: 'testuser' }
        localStorage.setItem('user', JSON.stringify(userData))
        
        expect(hasPermission('basic_permission')).toBe(true)
      })
  
      test('未认证用户不应该拥有权限', () => {
        expect(hasPermission('any_permission')).toBe(false)
      })
    })
  
    describe('secureLogout', () => {
      test('应该清除所有存储并重定向', () => {
        // 设置一些初始状态
        localStorage.setItem('user', JSON.stringify({ id: 1, username: 'testuser' }))
        localStorage.setItem('admin', 'true')
        sessionStorage.setItem('someKey', 'someValue')
  
        // Mock window.location.reload
        delete window.location
        window.location = { reload: jest.fn() }
  
        secureLogout(mockRouter)
  
        // 检查存储是否被清除
        expect(localStorage.clear).toHaveBeenCalled()
        expect(sessionStorage.clear).toHaveBeenCalled()
  
        // 检查是否重定向到登录页
        expect(mockRouter.push).toHaveBeenCalledWith('/login')
  
        // 检查是否调用了页面刷新
        setTimeout(() => {
          expect(window.location.reload).toHaveBeenCalled()
        }, 150)
      })
    })
  })