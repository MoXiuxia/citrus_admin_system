import { createStore } from 'vuex'

// 状态管理存储
export default createStore({
  state: {
    // 用户信息 - 修复解析错误
    user: (() => {
      try {
        const userStr = localStorage.getItem('user')
        // 检查是否为有效的JSON字符串
        if (userStr && userStr !== 'undefined' && userStr !== 'null') {
          return JSON.parse(userStr)
        }
        return null
      } catch (error) {
        console.error('解析用户信息失败:', error)
        return null
      }
    })(),
    
    // 管理员状态 - 同样修复
    admin: (() => {
      const admin = localStorage.getItem('admin')
      return admin && admin !== 'undefined' && admin !== 'null' && admin !== 'false'
    })(),
    
    // 全局加载状态
    loading: false,
    
    // 全局错误信息
    error: null,
    
    // 通知消息
    notifications: [],
    
    // 陈皮库存数据
    citrusStock: [],
    
    // 用户提交数据
    userSubmissions: [],
    
    // 所有提交数据（管理员）
    allSubmissions: [],
    
    // 待审核数据
    pendingSubmissions: [],
    
    // 系统统计信息
    systemStats: null,
    
    // 页面设置
    settings: {
      theme: (() => {
        const theme = localStorage.getItem('theme')
        return theme && theme !== 'undefined' ? theme : 'light'
      })(),
      language: (() => {
        const language = localStorage.getItem('language')
        return language && language !== 'undefined' ? language : 'zh-CN'
      })(),
      pageSize: (() => {
        const pageSize = localStorage.getItem('pageSize')
        return pageSize && pageSize !== 'undefined' ? parseInt(pageSize) : 10
      })()
    }
  },

  getters: {
    // 用户相关
    isAuthenticated: state => !!state.user,
    isAdmin: state => state.admin,
    currentUser: state => state.user,
    
    // 加载状态
    isLoading: state => state.loading,
    
    // 错误信息
    currentError: state => state.error,
    
    // 通知相关
    unreadNotifications: state => state.notifications.filter(n => !n.read),
    notificationCount: (state, getters) => getters.unreadNotifications.length,
    
    // 数据统计
    stockStats: state => {
      const total = state.citrusStock.reduce((sum, item) => sum + (item.stockWeight || 0), 0)
      const average = state.citrusStock.length > 0 ? total / state.citrusStock.length : 0
      
      return {
        total,
        average,
        items: state.citrusStock.length
      }
    },
    
    submissionStats: state => {
      const total = state.allSubmissions.length
      const approved = state.allSubmissions.filter(s => s.status === 'approved').length
      const pending = state.allSubmissions.filter(s => s.status === 'pending').length
      const rejected = state.allSubmissions.filter(s => s.status === 'rejected').length
      
      return {
        total,
        approved,
        pending,
        rejected,
        approvalRate: total > 0 ? (approved / total) * 100 : 0
      }
    },
    
    // 设置
    currentTheme: state => state.settings.theme,
    currentLanguage: state => state.settings.language,
    currentPageSize: state => state.settings.pageSize
  },

  mutations: {
    // 用户认证相关
    SET_USER(state, user) {
      state.user = user
      if (user) {
        localStorage.setItem('user', JSON.stringify(user))
      } else {
        localStorage.removeItem('user')
      }
    },
    
    SET_ADMIN(state, isAdmin) {
      state.admin = isAdmin
      if (isAdmin) {
        localStorage.setItem('admin', 'true')
      } else {
        localStorage.removeItem('admin')
      }
    },
    
    CLEAR_AUTH(state) {
      state.user = null
      state.admin = false
      localStorage.removeItem('user')
      localStorage.removeItem('admin')
    },
    
    // 加载状态
    SET_LOADING(state, loading) {
      state.loading = loading
    },
    
    // 错误处理
    SET_ERROR(state, error) {
      state.error = error
    },
    
    CLEAR_ERROR(state) {
      state.error = null
    },
    
    // 通知管理
    ADD_NOTIFICATION(state, notification) {
      state.notifications.unshift({
        id: Date.now(),
        timestamp: new Date(),
        read: false,
        ...notification
      })
      
      // 保持最多50条通知
      if (state.notifications.length > 50) {
        state.notifications = state.notifications.slice(0, 50)
      }
    },
    
    MARK_NOTIFICATION_READ(state, notificationId) {
      const notification = state.notifications.find(n => n.id === notificationId)
      if (notification) {
        notification.read = true
      }
    },
    
    REMOVE_NOTIFICATION(state, notificationId) {
      state.notifications = state.notifications.filter(n => n.id !== notificationId)
    },
    
    CLEAR_NOTIFICATIONS(state) {
      state.notifications = []
    },
    
    // 数据管理
    SET_CITRUS_STOCK(state, stock) {
      state.citrusStock = stock
    },
    
    UPDATE_STOCK_ITEM(state, { yearRange, weight }) {
      const item = state.citrusStock.find(item => item.yearRange === yearRange)
      if (item) {
        item.stockWeight = weight
      }
    },
    
    SET_USER_SUBMISSIONS(state, submissions) {
      state.userSubmissions = submissions
    },
    
    ADD_USER_SUBMISSION(state, submission) {
      state.userSubmissions.unshift(submission)
    },
    
    SET_ALL_SUBMISSIONS(state, submissions) {
      state.allSubmissions = submissions
    },
    
    UPDATE_SUBMISSION_STATUS(state, { submissionId, status, reviewedAt }) {
      const submission = state.allSubmissions.find(s => s.id === submissionId)
      if (submission) {
        submission.status = status
        submission.reviewedAt = reviewedAt
      }
      
      // 同时更新用户提交中的状态
      const userSubmission = state.userSubmissions.find(s => s.id === submissionId)
      if (userSubmission) {
        userSubmission.status = status
        userSubmission.reviewedAt = reviewedAt
      }
      
      // 更新待审核列表
      if (status !== 'pending') {
        state.pendingSubmissions = state.pendingSubmissions.filter(s => s.id !== submissionId)
      }
    },
    
    SET_PENDING_SUBMISSIONS(state, submissions) {
      state.pendingSubmissions = submissions
    },
    
    REMOVE_PENDING_SUBMISSION(state, submissionId) {
      state.pendingSubmissions = state.pendingSubmissions.filter(s => s.id !== submissionId)
    },
    
    SET_SYSTEM_STATS(state, stats) {
      state.systemStats = stats
    },
    
    // 设置管理
    SET_THEME(state, theme) {
      state.settings.theme = theme
      localStorage.setItem('theme', theme)
      document.documentElement.setAttribute('data-theme', theme)
    },
    
    SET_LANGUAGE(state, language) {
      state.settings.language = language
      localStorage.setItem('language', language)
    },
    
    SET_PAGE_SIZE(state, pageSize) {
      state.settings.pageSize = pageSize
      localStorage.setItem('pageSize', pageSize.toString())
    }
  },

  actions: {
    // 用户认证
    async loginUser({ commit }, credentials) {
      commit('SET_LOADING', true)
      commit('CLEAR_ERROR')
      
      try {
        const response = await fetch('/api/auth/user-login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(credentials)
        })

        const data = await response.json()
        
        if (response.ok && data.success) {
          const userData = data.data.user || data.user
          commit('SET_USER', userData)
          commit('ADD_NOTIFICATION', {
            type: 'success',
            title: '登录成功',
            message: `欢迎回来，${userData.username}！`
          })
          return { success: true, data }
        } else {
          throw new Error(data.error || '登录失败')
        }
      } catch (error) {
        commit('SET_ERROR', error.message)
        commit('ADD_NOTIFICATION', {
          type: 'error',
          title: '登录失败',
          message: error.message
        })
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    async loginAdmin({ commit }, credentials) {
      commit('SET_LOADING', true)
      commit('CLEAR_ERROR')
      
      try {
        const response = await fetch('/api/auth/admin-login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(credentials)
        })

        const data = await response.json()
        
        if (response.ok && data.success) {
          commit('SET_ADMIN', true)
          commit('ADD_NOTIFICATION', {
            type: 'success',
            title: '管理员登录成功',
            message: '欢迎进入管理系统'
          })
          return { success: true, data }
        } else {
          throw new Error(data.error || '管理员登录失败')
        }
      } catch (error) {
        commit('SET_ERROR', error.message)
        commit('ADD_NOTIFICATION', {
          type: 'error',
          title: '管理员登录失败',
          message: error.message
        })
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    async registerUser({ commit }, userData) {
      commit('SET_LOADING', true)
      commit('CLEAR_ERROR')
      
      try {
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(userData)
        })

        const data = await response.json()
        
        if (response.ok && data.success) {
          commit('ADD_NOTIFICATION', {
            type: 'success',
            title: '注册成功',
            message: '账号注册成功，请登录'
          })
          return { success: true, data }
        } else {
          throw new Error(data.error || '注册失败')
        }
      } catch (error) {
        commit('SET_ERROR', error.message)
        commit('ADD_NOTIFICATION', {
          type: 'error',
          title: '注册失败',
          message: error.message
        })
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    logout({ commit }) {
      commit('CLEAR_AUTH')
      commit('CLEAR_NOTIFICATIONS')
      commit('ADD_NOTIFICATION', {
        type: 'info',
        title: '已退出登录',
        message: '您已成功退出系统'
      })
    },
    
    // 数据加载
    async loadCitrusStock({ commit }) {
      commit('SET_LOADING', true)
      
      try {
        const response = await fetch('/api/citrus/total-stock')
        const data = await response.json()
        
        if (response.ok) {
          commit('SET_CITRUS_STOCK', data)
          return data
        } else {
          throw new Error(data.error || '加载库存失败')
        }
      } catch (error) {
        commit('SET_ERROR', error.message)
        commit('ADD_NOTIFICATION', {
          type: 'error',
          title: '加载库存失败',
          message: error.message
        })
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    async loadUserSubmissions({ commit, state }, params = {}) {
      if (!state.user) return
      
      commit('SET_LOADING', true)
      
      try {
        const response = await fetch(`/api/citrus/user-submissions/${state.user.id}`)
        const data = await response.json()
        
        if (response.ok) {
          commit('SET_USER_SUBMISSIONS', data)
          return data
        } else {
          throw new Error(data.error || '加载用户提交失败')
        }
      } catch (error) {
        commit('SET_ERROR', error.message)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    async loadAllSubmissions({ commit }, params = {}) {
      commit('SET_LOADING', true)
      
      try {
        const response = await fetch('/api/citrus/all-submissions')
        const data = await response.json()
        
        if (response.ok) {
          commit('SET_ALL_SUBMISSIONS', data)
          return data
        } else {
          throw new Error(data.error || '加载所有提交失败')
        }
      } catch (error) {
        commit('SET_ERROR', error.message)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    async loadPendingSubmissions({ commit }, params = {}) {
      commit('SET_LOADING', true)
      
      try {
        const response = await fetch('/api/citrus/pending-submissions')
        const data = await response.json()
        
        if (response.ok) {
          commit('SET_PENDING_SUBMISSIONS', data)
          return data
        } else {
          throw new Error(data.error || '加载待审核提交失败')
        }
      } catch (error) {
        commit('SET_ERROR', error.message)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    async loadSystemStats({ commit }) {
      commit('SET_LOADING', true)
      
      try {
        const response = await fetch('/api/admin/system-stats')
        const data = await response.json()
        
        if (response.ok) {
          commit('SET_SYSTEM_STATS', data)
          return data
        } else {
          throw new Error(data.error || '加载系统统计失败')
        }
      } catch (error) {
        commit('SET_ERROR', error.message)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    // 数据操作
    async submitCitrus({ commit }, formData) {
      commit('SET_LOADING', true)
      commit('CLEAR_ERROR')
      
      try {
        const response = await fetch('/api/citrus/submit', {
          method: 'POST',
          body: formData
        })

        const data = await response.json()
        
        if (response.ok && data.success) {
          commit('ADD_USER_SUBMISSION', data.data)
          commit('ADD_NOTIFICATION', {
            type: 'success',
            title: '提交成功',
            message: `陈皮信息已提交，AI识别结果：${data.data.aiYearResult}`
          })
          return { success: true, data }
        } else {
          throw new Error(data.error || '提交失败')
        }
      } catch (error) {
        commit('SET_ERROR', error.message)
        commit('ADD_NOTIFICATION', {
          type: 'error',
          title: '提交失败',
          message: error.message
        })
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    async reviewSubmission({ commit }, { submissionId, status }) {
      commit('SET_LOADING', true)
      commit('CLEAR_ERROR')
      
      try {
        const response = await fetch('/api/citrus/review', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ submissionId, status })
        })

        const data = await response.json()
        
        if (response.ok && data.success) {
          commit('UPDATE_SUBMISSION_STATUS', {
            submissionId,
            status,
            reviewedAt: new Date()
          })
          
          commit('ADD_NOTIFICATION', {
            type: 'success',
            title: '审核完成',
            message: `已${status === 'approved' ? '通过' : '拒绝'}该提交`
          })
          return { success: true, data }
        } else {
          throw new Error(data.error || '审核失败')
        }
      } catch (error) {
        commit('SET_ERROR', error.message)
        commit('ADD_NOTIFICATION', {
          type: 'error',
          title: '审核失败',
          message: error.message
        })
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    // 设置操作
    changeTheme({ commit }, theme) {
      commit('SET_THEME', theme)
      commit('ADD_NOTIFICATION', {
        type: 'info',
        title: '主题已切换',
        message: `已切换到${theme === 'dark' ? '深色' : '浅色'}主题`
      })
    },
    
    changeLanguage({ commit }, language) {
      commit('SET_LANGUAGE', language)
      commit('ADD_NOTIFICATION', {
        type: 'info',
        title: '语言已切换',
        message: '界面语言已更新'
      })
    },
    
    changePageSize({ commit }, pageSize) {
      commit('SET_PAGE_SIZE', pageSize)
    },
    
    // 通知操作
    markNotificationRead({ commit }, notificationId) {
      commit('MARK_NOTIFICATION_READ', notificationId)
    },
    
    removeNotification({ commit }, notificationId) {
      commit('REMOVE_NOTIFICATION', notificationId)
    },
    
    clearNotifications({ commit }) {
      commit('CLEAR_NOTIFICATIONS')
    },
    
    // 错误处理
    clearError({ commit }) {
      commit('CLEAR_ERROR')
    }
  }
})