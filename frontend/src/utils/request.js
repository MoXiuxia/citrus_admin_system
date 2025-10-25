// 请求封装 - 基于之前的 api.js 但针对 Vue 3 和组合式 API 优化
import { useStore } from 'vuex'

// API 基础配置
const API_CONFIG = {
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
  timeout: 30000,
  retryCount: 3,
  retryDelay: 1000
}

// 请求队列（用于取消请求）
const pendingRequests = new Map()

// 创建唯一的请求 ID
function generateRequestId(config) {
  return `${config.method}-${config.url}-${JSON.stringify(config.params || config.data)}`
}

// 请求拦截器
const requestInterceptors = []

// 响应拦截器
const responseInterceptors = []

// 添加拦截器
export const addRequestInterceptor = (interceptor) => {
  requestInterceptors.push(interceptor)
}

export const addResponseInterceptor = (interceptor) => {
  responseInterceptors.push(interceptor)
}

// 请求类
class Request {
  constructor(config = {}) {
    this.config = { ...API_CONFIG, ...config }
  }

  // 处理请求拦截器
  async processRequestInterceptors(config) {
    let processedConfig = { ...config }
    
    for (const interceptor of requestInterceptors) {
      const result = await interceptor(processedConfig)
      if (result) {
        processedConfig = result
      }
    }
    
    return processedConfig
  }

  // 处理响应拦截器
  async processResponseInterceptors(response) {
    let processedResponse = response
    
    for (const interceptor of responseInterceptors) {
      const result = await interceptor(processedResponse)
      if (result) {
        processedResponse = result
      }
    }
    
    return processedResponse
  }

  // 错误处理
  handleError(error, config) {
    console.error('API请求错误:', error)
    
    let errorMessage = '未知错误'
    
    if (error.name === 'AbortError') {
      errorMessage = '请求超时，请检查网络连接'
    } else if (error.response) {
      // 服务器返回错误状态码
      const { status, data } = error.response
      errorMessage = data?.error || data?.message || `请求失败 (${status})`
      
      // 认证错误特殊处理
      if (status === 401) {
        errorMessage = '登录已过期，请重新登录'
        // 触发登出
        const store = useStore()
        store.dispatch('logout')
      }
    } else if (error.request) {
      // 请求发送失败
      errorMessage = '网络连接错误，请检查网络设置'
    } else {
      // 其他错误
      errorMessage = error.message || '未知错误'
    }
    
    return {
      success: false,
      error: errorMessage,
      code: error.response?.status || 0
    }
  }

  // 重试机制
  async retryRequest(fn, retries = this.config.retryCount, delay = this.config.retryDelay) {
    try {
      return await fn()
    } catch (error) {
      if (retries === 0) throw error
      
      await new Promise(resolve => setTimeout(resolve, delay))
      return this.retryRequest(fn, retries - 1, delay * 2)
    }
  }

  // 发送请求
  async request(endpoint, options = {}) {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout)

    const requestId = generateRequestId({ ...options, url: endpoint })
    
    // 取消重复请求
    if (pendingRequests.has(requestId)) {
      pendingRequests.get(requestId).abort()
    }
    pendingRequests.set(requestId, controller)

    try {
      // 处理请求配置
      let config = {
        ...this.config,
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...this.config.headers,
          ...options.headers
        }
      }

      // 应用请求拦截器
      config = await this.processRequestInterceptors(config)

      const url = `${config.baseURL}${endpoint}`
      
      const response = await fetch(url, config)

      // 清除超时
      clearTimeout(timeoutId)

      // 处理响应
      let processedResponse = {
        ok: response.ok,
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
        url: response.url,
      }

      // 解析响应数据
      const contentType = response.headers.get('content-type')
      if (contentType && contentType.includes('application/json')) {
        processedResponse.data = await response.json()
      } else {
        processedResponse.data = await response.text()
      }

      // 应用响应拦截器
      processedResponse = await this.processResponseInterceptors(processedResponse)

      if (!response.ok) {
        throw {
          response: processedResponse,
          request: config,
        }
      }

      return {
        success: true,
        ...processedResponse
      }
    } catch (error) {
      clearTimeout(timeoutId)
      return this.handleError(error, options)
    } finally {
      // 清理请求记录
      pendingRequests.delete(requestId)
    }
  }

  // GET 请求
  async get(endpoint, params = {}, options = {}) {
    const queryString = new URLSearchParams(params).toString()
    const url = queryString ? `${endpoint}?${queryString}` : endpoint
    
    return this.request(url, {
      method: 'GET',
      ...options,
    })
  }

  // POST 请求
  async post(endpoint, data = {}, options = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
      ...options,
    })
  }

  // PUT 请求
  async put(endpoint, data = {}, options = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
      ...options,
    })
  }

  // PATCH 请求
  async patch(endpoint, data = {}, options = {}) {
    return this.request(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
      ...options,
    })
  }

  // DELETE 请求
  async delete(endpoint, options = {}) {
    return this.request(endpoint, {
      method: 'DELETE',
      ...options,
    })
  }

  // 文件上传
  async upload(endpoint, formData, options = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: formData,
      headers: {
        // 不设置 Content-Type，让浏览器自动设置
      },
      ...options,
    })
  }

  // 取消请求
  cancelRequest(requestId) {
    if (pendingRequests.has(requestId)) {
      pendingRequests.get(requestId).abort()
      pendingRequests.delete(requestId)
    }
  }

  // 取消所有请求
  cancelAllRequests() {
    pendingRequests.forEach(controller => controller.abort())
    pendingRequests.clear()
  }
}

// 创建默认实例
export const request = new Request()

// 认证相关的 API
export const authAPI = {
  register: (userData) => request.post('/auth/register', userData),
  userLogin: (credentials) => request.post('/auth/user-login', credentials),
  adminLogin: (credentials) => request.post('/auth/admin-login', credentials),
  logout: () => request.post('/auth/logout'),
  checkAuth: () => request.get('/auth/check')
}

// 用户相关的 API
export const userAPI = {
  getUser: (userId) => request.get(`/users/${userId}`),
  getUserSubmissions: (userId, params = {}) => 
    request.get(`/users/${userId}/submissions`, params),
  updateUser: (userId, userData) => 
    request.put(`/users/${userId}`, userData),
  deleteUser: (userId) => request.delete(`/users/${userId}`),
  getAllUsers: (params = {}) => request.get('/users', params)
}

// 管理员相关的 API
export const adminAPI = {
  addAdmin: (adminData) => request.post('/admin/add', adminData),
  getAdmins: (params = {}) => request.get('/admin/list', params),
  updateAdmin: (adminId, adminData) => 
    request.put(`/admin/${adminId}`, adminData),
  deleteAdmin: (adminId) => request.delete(`/admin/${adminId}`),
  getSystemStats: () => request.get('/admin/stats')
}

// 陈皮相关的 API
export const citrusAPI = {
  submitCitrus: (formData) => request.upload('/citrus/submit', formData),
  getTotalStock: () => request.get('/citrus/stock'),
  getAllSubmissions: (params = {}) => request.get('/citrus/submissions', params),
  getPendingSubmissions: (params = {}) => 
    request.get('/citrus/submissions/pending', params),
  reviewSubmission: (submissionId, status) => 
    request.post(`/citrus/submissions/${submissionId}/review`, { status }),
  batchReview: (data) => request.post('/citrus/submissions/batch-review', data),
  getSubmissionStats: () => request.get('/citrus/stats')
}

// 系统相关的 API
export const systemAPI = {
  healthCheck: () => request.get('/health'),
  getAIStatus: () => request.get('/ai/status')
}

// 添加认证拦截器
addRequestInterceptor(async (config) => {
  // 添加用户认证头
  const user = localStorage.getItem('user')
  if (user) {
    const userData = JSON.parse(user)
    config.headers['X-User-Id'] = userData.id
  }

  // 添加管理员认证头
  const admin = localStorage.getItem('admin')
  if (admin) {
    config.headers['X-Admin-Auth'] = 'true'
  }

  return config
})

// 添加响应拦截器 - 处理认证失败
addResponseInterceptor(async (response) => {
  if (response.status === 401) {
    // 清除本地存储的认证信息
    localStorage.removeItem('user')
    localStorage.removeItem('admin')
    
    // 跳转到登录页面
    if (window.location.pathname !== '/login') {
      window.location.href = '/login'
    }
  }
  
  return response
})

// 导出默认实例和所有 API
export default {
  request,
  auth: authAPI,
  user: userAPI,
  admin: adminAPI,
  citrus: citrusAPI,
  system: systemAPI
}