// API 接口封装工具

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

// 请求配置
const defaultConfig = {
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
};

// 请求拦截器
const requestInterceptors = [];
// 响应拦截器
const responseInterceptors = [];

// 添加拦截器
export const addRequestInterceptor = (interceptor) => {
  requestInterceptors.push(interceptor);
};

export const addResponseInterceptor = (interceptor) => {
  responseInterceptors.push(interceptor);
};

// 通用请求方法
class ApiClient {
  constructor(config = {}) {
    this.config = { ...defaultConfig, ...config };
  }

  // 处理请求拦截器
  async processRequestInterceptors(config) {
    let processedConfig = { ...config };
    
    for (const interceptor of requestInterceptors) {
      processedConfig = await interceptor(processedConfig);
    }
    
    return processedConfig;
  }

  // 处理响应拦截器
  async processResponseInterceptors(response) {
    let processedResponse = response;
    
    for (const interceptor of responseInterceptors) {
      processedResponse = await interceptor(processedResponse);
    }
    
    return processedResponse;
  }

  // 处理错误
  handleError(error) {
    console.error('API请求错误:', error);
    
    if (error.name === 'AbortError') {
      throw new Error('请求超时');
    }
    
    if (error.response) {
      // 服务器返回错误状态码
      const { status, data } = error.response;
      const message = data?.error || data?.message || `请求失败 (${status})`;
      throw new Error(message);
    } else if (error.request) {
      // 请求发送失败
      throw new Error('网络连接错误，请检查网络设置');
    } else {
      // 其他错误
      throw new Error(error.message || '未知错误');
    }
  }

  // 发送请求
  async request(endpoint, options = {}) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

    try {
      // 处理请求配置
      let config = {
        ...this.config,
        ...options,
        signal: controller.signal,
      };

      // 应用请求拦截器
      config = await this.processRequestInterceptors(config);

      const url = `${config.baseURL}${endpoint}`;
      
      const response = await fetch(url, config);

      // 清除超时
      clearTimeout(timeoutId);

      // 处理响应
      let processedResponse = {
        ok: response.ok,
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
        url: response.url,
      };

      // 解析响应数据
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        processedResponse.data = await response.json();
      } else {
        processedResponse.data = await response.text();
      }

      // 应用响应拦截器
      processedResponse = await this.processResponseInterceptors(processedResponse);

      if (!response.ok) {
        throw {
          response: processedResponse,
          request: config,
        };
      }

      return processedResponse;
    } catch (error) {
      clearTimeout(timeoutId);
      return this.handleError(error);
    }
  }

  // GET 请求
  async get(endpoint, params = {}, options = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    
    return this.request(url, {
      method: 'GET',
      ...options,
    });
  }

  // POST 请求
  async post(endpoint, data = {}, options = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
      ...options,
    });
  }

  // PUT 请求
  async put(endpoint, data = {}, options = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
      ...options,
    });
  }

  // PATCH 请求
  async patch(endpoint, data = {}, options = {}) {
    return this.request(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
      ...options,
    });
  }

  // DELETE 请求
  async delete(endpoint, options = {}) {
    return this.request(endpoint, {
      method: 'DELETE',
      ...options,
    });
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
    });
  }
}

// 创建默认实例
export const apiClient = new ApiClient();

// 认证相关的 API
export const authAPI = {
  // 用户注册
  register: (userData) => apiClient.post('/auth/register', userData),
  
  // 用户登录
  userLogin: (credentials) => apiClient.post('/auth/user-login', credentials),
  
  // 管理员登录
  adminLogin: (credentials) => apiClient.post('/auth/admin-login', credentials),
  
  // 退出登录
  logout: () => apiClient.post('/auth/logout'),
  
  // 检查认证状态
  checkAuth: () => apiClient.get('/auth/check'),
};

// 用户相关的 API
export const userAPI = {
  // 获取用户信息
  getUser: (userId) => apiClient.get(`/users/${userId}`),
  
  // 获取用户提交记录
  getUserSubmissions: (userId, params = {}) => 
    apiClient.get(`/users/${userId}/submissions`, params),
  
  // 更新用户信息
  updateUser: (userId, userData) => 
    apiClient.put(`/users/${userId}`, userData),
  
  // 删除用户
  deleteUser: (userId) => apiClient.delete(`/users/${userId}`),
  
  // 获取所有用户列表
  getAllUsers: (params = {}) => apiClient.get('/users', params),
};

// 管理员相关的 API
export const adminAPI = {
  // 添加管理员
  addAdmin: (adminData) => apiClient.post('/admin/add', adminData),
  
  // 获取管理员列表
  getAdmins: (params = {}) => apiClient.get('/admin/list', params),
  
  // 更新管理员信息
  updateAdmin: (adminId, adminData) => 
    apiClient.put(`/admin/${adminId}`, adminData),
  
  // 删除管理员
  deleteAdmin: (adminId) => apiClient.delete(`/admin/${adminId}`),
  
  // 获取系统统计信息
  getSystemStats: () => apiClient.get('/admin/stats'),
};

// 陈皮相关的 API
export const citrusAPI = {
  // 提交陈皮信息
  submitCitrus: (formData) => apiClient.upload('/citrus/submit', formData),
  
  // 获取陈皮总库存
  getTotalStock: () => apiClient.get('/citrus/stock'),
  
  // 获取所有用户提交信息
  getAllSubmissions: (params = {}) => apiClient.get('/citrus/submissions', params),
  
  // 获取待审核任务
  getPendingSubmissions: (params = {}) => 
    apiClient.get('/citrus/submissions/pending', params),
  
  // 审核单个提交
  reviewSubmission: (submissionId, status) => 
    apiClient.post(`/citrus/submissions/${submissionId}/review`, { status }),
  
  // 批量审核提交
  batchReview: (data) => apiClient.post('/citrus/submissions/batch-review', data),
  
  // 获取提交统计
  getSubmissionStats: () => apiClient.get('/citrus/stats'),
};

// 系统相关的 API
export const systemAPI = {
  // 健康检查
  healthCheck: () => apiClient.get('/health'),
  
  // AI 服务状态
  getAIStatus: () => apiClient.get('/ai/status'),
};

// 添加认证拦截器
addRequestInterceptor(async (config) => {
  // 添加用户认证头
  const user = localStorage.getItem('user');
  if (user) {
    const userData = JSON.parse(user);
    config.headers['X-User-Id'] = userData.id;
  }

  // 添加管理员认证头
  const admin = localStorage.getItem('admin');
  if (admin) {
    config.headers['X-Admin-Auth'] = 'true';
  }

  return config;
});

// 添加响应拦截器 - 处理认证失败
addResponseInterceptor(async (response) => {
  if (response.status === 401) {
    // 清除本地存储的认证信息
    localStorage.removeItem('user');
    localStorage.removeItem('admin');
    
    // 跳转到登录页面
    if (window.location.pathname !== '/login') {
      window.location.href = '/login';
    }
  }
  
  return response;
});

// 添加响应拦截器 - 统一处理错误
addResponseInterceptor(async (response) => {
  if (!response.ok && response.data && response.data.error) {
    // 可以在这里添加全局错误提示
    console.error('API Error:', response.data.error);
  }
  
  return response;
});

// 工具函数
export const apiUtils = {
  // 生成查询参数
  buildQueryString: (params) => {
    const searchParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        if (Array.isArray(value)) {
          value.forEach(v => searchParams.append(key, v));
        } else {
          searchParams.append(key, value);
        }
      }
    });
    
    return searchParams.toString();
  },
  
  // 处理文件上传
  createFormData: (data) => {
    const formData = new FormData();
    
    Object.entries(data).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        if (value instanceof File) {
          formData.append(key, value);
        } else if (Array.isArray(value)) {
          value.forEach(v => formData.append(key, v));
        } else {
          formData.append(key, value);
        }
      }
    });
    
    return formData;
  },
  
  // 取消请求
  createCancelToken: () => {
    const controller = new AbortController();
    return {
      cancel: () => controller.abort(),
      signal: controller.signal,
    };
  },
  
  // 重试机制
  retry: async (fn, retries = 3, delay = 1000) => {
    try {
      return await fn();
    } catch (error) {
      if (retries === 0) throw error;
      
      await new Promise(resolve => setTimeout(resolve, delay));
      return apiUtils.retry(fn, retries - 1, delay * 2);
    }
  },
};

// 导出默认实例和所有 API
export default {
  client: apiClient,
  auth: authAPI,
  user: userAPI,
  admin: adminAPI,
  citrus: citrusAPI,
  system: systemAPI,
  utils: apiUtils,
};

// 使用示例：
/*
// 在 Vue 组件中使用
import api from '@/assets/js/api.js';

// 用户登录
async function login() {
  try {
    const response = await api.auth.userLogin({
      username: 'user1',
      password: 'password123'
    });
    console.log('登录成功:', response.data);
  } catch (error) {
    console.error('登录失败:', error.message);
  }
}

// 获取库存数据
async function loadStock() {
  try {
    const response = await api.citrus.getTotalStock();
    return response.data;
  } catch (error) {
    console.error('加载库存失败:', error.message);
    return null;
  }
}

// 文件上传
async function uploadImage(file) {
  try {
    const formData = api.utils.createFormData({
      image: file,
      userId: 1,
      manualYear: '10-20',
      weight: 150.5
    });
    
    const response = await api.citrus.submitCitrus(formData);
    console.log('上传成功:', response.data);
  } catch (error) {
    console.error('上传失败:', error.message);
  }
}
*/