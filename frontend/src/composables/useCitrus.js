// 陈皮数据相关的组合式 API
import { ref, computed, watch } from 'vue'
import { useStore } from 'vuex'
import { debounce } from '@/utils/helpers.js'

export const useCitrus = () => {
  const store = useStore()
  
  // 响应式状态
  const loading = ref(false)
  const error = ref(null)
  const filters = ref({
    status: '',
    year: '',
    search: '',
    dateRange: ''
  })
  const pagination = ref({
    page: 1,
    pageSize: store.getters.currentPageSize,
    total: 0
  })
  
  // 计算属性
  const citrusStock = computed(() => store.state.citrusStock)
  const userSubmissions = computed(() => store.state.userSubmissions)
  const allSubmissions = computed(() => store.state.allSubmissions)
  const pendingSubmissions = computed(() => store.state.pendingSubmissions)
  const systemStats = computed(() => store.state.systemStats)
  
  const stockStats = computed(() => store.getters.stockStats)
  const submissionStats = computed(() => store.getters.submissionStats)
  
  const filteredSubmissions = computed(() => {
    let submissions = allSubmissions.value
    
    // 状态筛选
    if (filters.value.status) {
      submissions = submissions.filter(s => s.status === filters.value.status)
    }
    
    // 年份筛选
    if (filters.value.year) {
      submissions = submissions.filter(s => s.manualYearSelection === filters.value.year)
    }
    
    // 搜索筛选
    if (filters.value.search) {
      const searchTerm = filters.value.search.toLowerCase()
      submissions = submissions.filter(s => 
        s.username?.toLowerCase().includes(searchTerm) ||
        s.id?.toString().includes(searchTerm)
      )
    }
    
    // 日期范围筛选
    if (filters.value.dateRange) {
      const now = new Date()
      let startDate
      
      switch (filters.value.dateRange) {
        case 'today':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
          break
        case 'week':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7)
          break
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())
          break
        case 'quarter':
          startDate = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate())
          break
      }
      
      submissions = submissions.filter(s => new Date(s.submittedAt) >= startDate)
    }
    
    // 更新分页总数
    pagination.value.total = submissions.length
    
    // 分页
    const start = (pagination.value.page - 1) * pagination.value.pageSize
    const end = start + pagination.value.pageSize
    
    return submissions.slice(start, end)
  })
  
  // 方法
  const loadCitrusStock = async () => {
    loading.value = true
    error.value = null
    
    try {
      const result = await store.dispatch('loadCitrusStock')
      return result
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }
  
  const loadUserSubmissions = async (params = {}) => {
    loading.value = true
    error.value = null
    
    try {
      const result = await store.dispatch('loadUserSubmissions', params)
      return result
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }
  
  const loadAllSubmissions = async (params = {}) => {
    loading.value = true
    error.value = null
    
    try {
      const result = await store.dispatch('loadAllSubmissions', params)
      pagination.value.total = result?.pagination?.total || 0
      return result
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }
  
  const loadPendingSubmissions = async (params = {}) => {
    loading.value = true
    error.value = null
    
    try {
      const result = await store.dispatch('loadPendingSubmissions', params)
      return result
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }
  
  const loadSystemStats = async () => {
    loading.value = true
    error.value = null
    
    try {
      const result = await store.dispatch('loadSystemStats')
      return result
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }
  
  const submitCitrus = async (formData) => {
    loading.value = true
    error.value = null
    
    try {
      const result = await store.dispatch('submitCitrus', formData)
      return result
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }
  
  const reviewSubmission = async (submissionId, status) => {
    loading.value = true
    error.value = null
    
    try {
      const result = await store.dispatch('reviewSubmission', {
        submissionId,
        status
      })
      return result
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }
  
  const batchReviewSubmissions = async (submissionIds, status) => {
    loading.value = true
    error.value = null
    
    try {
      const result = await store.dispatch('batchReviewSubmissions', {
        submissionIds,
        status
      })
      return result
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }
  
  const updateFilters = (newFilters) => {
    filters.value = { ...filters.value, ...newFilters }
    pagination.value.page = 1 // 重置到第一页
  }
  
  const resetFilters = () => {
    filters.value = {
      status: '',
      year: '',
      search: '',
      dateRange: ''
    }
    pagination.value.page = 1
  }
  
  const setPage = (page) => {
    pagination.value.page = page
  }
  
  const setPageSize = (pageSize) => {
    pagination.value.pageSize = pageSize
    pagination.value.page = 1
    store.dispatch('changePageSize', pageSize)
  }
  
  const clearError = () => {
    error.value = null
    store.dispatch('clearError')
  }
  
  // 防抖搜索
  const debouncedSearch = debounce((searchTerm) => {
    updateFilters({ search: searchTerm })
  }, 300)
  
  // 监听分页变化，自动重新加载数据
  watch(
    [() => pagination.value.page, () => pagination.value.pageSize],
    () => {
      if (allSubmissions.value.length > 0) {
        // 如果已经有数据，只进行客户端分页
        // 否则需要从服务器加载
      }
    }
  )
  
  // 监听筛选条件变化，自动重新加载数据
  watch(
    filters,
    () => {
      if (allSubmissions.value.length > 0) {
        // 客户端筛选
      } else {
        // 需要从服务器加载
        loadAllSubmissions(filters.value)
      }
    },
    { deep: true }
  )
  
  return {
    // 状态
    loading,
    error,
    filters,
    pagination,
    
    // 计算属性
    citrusStock,
    userSubmissions,
    allSubmissions,
    pendingSubmissions,
    systemStats,
    stockStats,
    submissionStats,
    filteredSubmissions,
    
    // 数据加载方法
    loadCitrusStock,
    loadUserSubmissions,
    loadAllSubmissions,
    loadPendingSubmissions,
    loadSystemStats,
    
    // 数据操作方法
    submitCitrus,
    reviewSubmission,
    batchReviewSubmissions,
    
    // 筛选和分页方法
    updateFilters,
    resetFilters,
    setPage,
    setPageSize,
    debouncedSearch,
    
    // 工具方法
    clearError
  }
}

export default useCitrus