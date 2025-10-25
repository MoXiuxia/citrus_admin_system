// 认证相关的组合式 API
import { ref, computed, watch } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import { checkAuthStatus, hasPermission, secureLogout } from '@/utils/auth.js'

export const useAuth = () => {
  const store = useStore()
  const router = useRouter()
  
  // 响应式状态
  const loading = ref(false)
  const error = ref(null)
  
  // 计算属性
  const isAuthenticated = computed(() => store.getters.isAuthenticated)
  const isAdmin = computed(() => store.getters.isAdmin)
  const currentUser = computed(() => store.getters.currentUser)
  const authError = computed(() => store.getters.currentError)
  
  // 方法
  const loginUser = async (credentials) => {
    loading.value = true
    error.value = null
    
    try {
      const result = await store.dispatch('loginUser', credentials)
      return result
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }
  
  const loginAdmin = async (credentials) => {
    loading.value = true
    error.value = null
    
    try {
      const result = await store.dispatch('loginAdmin', credentials)
      return result
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }
  
  const registerUser = async (userData) => {
    loading.value = true
    error.value = null
    
    try {
      const result = await store.dispatch('registerUser', userData)
      return result
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }
  
  const logout = () => {
    store.dispatch('logout')
    router.push('/login')
  }
  
  const checkPermission = (permission) => {
    return hasPermission(permission)
  }
  
  const requireAuth = (to, from, next) => {
    if (!isAuthenticated.value && !isAdmin.value) {
      next('/login')
    } else {
      next()
    }
  }
  
  const requireAdmin = (to, from, next) => {
    if (!isAdmin.value) {
      if (isAuthenticated.value) {
        next('/user')
      } else {
        next('/login')
      }
    } else {
      next()
    }
  }
  
  const clearError = () => {
    error.value = null
    store.dispatch('clearError')
  }
  
  // 监听认证状态变化
  watch(isAuthenticated, (newValue) => {
    if (!newValue && router.currentRoute.value.meta.requiresAuth) {
      router.push('/login')
    }
  })
  
  watch(isAdmin, (newValue) => {
    if (!newValue && router.currentRoute.value.meta.requiresAdmin) {
      router.push('/user')
    }
  })
  
  // 初始化检查
  const initAuth = () => {
    const { isAuthenticated: authStatus, isAdmin: adminStatus, user } = checkAuthStatus()
    
    if (authStatus) {
      store.commit('SET_USER', user)
    }
    if (adminStatus) {
      store.commit('SET_ADMIN', true)
    }
  }
  
  return {
    // 状态
    loading,
    error,
    
    // 计算属性
    isAuthenticated,
    isAdmin,
    currentUser,
    authError,
    
    // 方法
    loginUser,
    loginAdmin,
    registerUser,
    logout,
    checkPermission,
    requireAuth,
    requireAdmin,
    clearError,
    initAuth
  }
}

export default useAuth