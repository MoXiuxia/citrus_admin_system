// 辅助工具函数

// 日期时间格式化
export const formatDate = (date, format = 'default') => {
    if (!date) return ''
    
    const d = new Date(date)
    
    if (isNaN(d.getTime())) return ''
    
    const formats = {
      default: () => d.toLocaleDateString('zh-CN'),
      datetime: () => d.toLocaleString('zh-CN'),
      time: () => d.toLocaleTimeString('zh-CN', { 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      relative: () => {
        const now = new Date()
        const diff = now - d
        const minutes = Math.floor(diff / 60000)
        const hours = Math.floor(diff / 3600000)
        const days = Math.floor(diff / 86400000)
        
        if (minutes < 1) return '刚刚'
        if (minutes < 60) return `${minutes}分钟前`
        if (hours < 24) return `${hours}小时前`
        if (days < 7) return `${days}天前`
        return d.toLocaleDateString('zh-CN')
      },
      iso: () => d.toISOString().split('T')[0],
      year: () => d.getFullYear().toString()
    }
    
    return formats[format] ? formats[format]() : formats.default()
  }
  
  // 文件大小格式化
  export const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 B'
    
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }
  
  // 数字格式化
  export const formatNumber = (number, options = {}) => {
    const {
      decimals = 0,
      separator = ',',
      decimalPoint = '.'
    } = options
    
    if (isNaN(number) || number === null) return '0'
    
    const num = parseFloat(number)
    const parts = num.toFixed(decimals).split('.')
    
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, separator)
    
    return parts.join(decimalPoint)
  }
  
  // 防抖函数
  export const debounce = (func, wait, immediate = false) => {
    let timeout
    return function executedFunction(...args) {
      const later = () => {
        timeout = null
        if (!immediate) func(...args)
      }
      const callNow = immediate && !timeout
      clearTimeout(timeout)
      timeout = setTimeout(later, wait)
      if (callNow) func(...args)
    }
  }
  
  // 节流函数
  export const throttle = (func, limit) => {
    let inThrottle
    return function(...args) {
      if (!inThrottle) {
        func.apply(this, args)
        inThrottle = true
        setTimeout(() => inThrottle = false, limit)
      }
    }
  }
  
  // 深度克隆
  export const deepClone = (obj) => {
    if (obj === null || typeof obj !== 'object') return obj
    if (obj instanceof Date) return new Date(obj.getTime())
    if (obj instanceof Array) return obj.map(item => deepClone(item))
    if (obj instanceof Object) {
      const clonedObj = {}
      Object.keys(obj).forEach(key => {
        clonedObj[key] = deepClone(obj[key])
      })
      return clonedObj
    }
  }
  
  // 对象合并
  export const deepMerge = (target, source) => {
    const output = Object.assign({}, target)
    
    if (isObject(target) && isObject(source)) {
      Object.keys(source).forEach(key => {
        if (isObject(source[key])) {
          if (!(key in target)) {
            Object.assign(output, { [key]: source[key] })
          } else {
            output[key] = deepMerge(target[key], source[key])
          }
        } else {
          Object.assign(output, { [key]: source[key] })
        }
      })
    }
    
    return output
  }
  
  // 检查是否为对象
  export const isObject = (item) => {
    return item && typeof item === 'object' && !Array.isArray(item)
  }
  
  // 生成随机ID
  export const generateId = (length = 8) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let result = ''
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }
  
  // 数组去重
  export const uniqueArray = (array, key = null) => {
    if (key) {
      const seen = new Set()
      return array.filter(item => {
        const value = item[key]
        if (seen.has(value)) {
          return false
        }
        seen.add(value)
        return true
      })
    }
    return [...new Set(array)]
  }
  
  // 数组分组
  export const groupBy = (array, key) => {
    return array.reduce((groups, item) => {
      const group = item[key]
      groups[group] = groups[group] || []
      groups[group].push(item)
      return groups
    }, {})
  }
  
  // 排序数组
  export const sortBy = (array, key, order = 'asc') => {
    return [...array].sort((a, b) => {
      let aValue = a[key]
      let bValue = b[key]
      
      // 处理字符串比较
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase()
        bValue = bValue.toLowerCase()
      }
      
      if (aValue < bValue) return order === 'asc' ? -1 : 1
      if (aValue > bValue) return order === 'asc' ? 1 : -1
      return 0
    })
  }
  
  // 过滤数组
  export const filterArray = (array, filters) => {
    return array.filter(item => {
      return Object.entries(filters).every(([key, value]) => {
        if (value === null || value === undefined || value === '') return true
        
        const itemValue = item[key]
        
        // 字符串搜索
        if (typeof value === 'string' && typeof itemValue === 'string') {
          return itemValue.toLowerCase().includes(value.toLowerCase())
        }
        
        // 精确匹配
        return itemValue === value
      })
    })
  }
  
  // 验证函数
  export const validators = {
    required: (value) => !!value || '此字段为必填项',
    email: (value) => {
      const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      return pattern.test(value) || '请输入有效的邮箱地址'
    },
    minLength: (min) => (value) => 
      value.length >= min || `至少需要 ${min} 个字符`,
    maxLength: (max) => (value) => 
      value.length <= max || `不能超过 ${max} 个字符`,
    number: (value) => !isNaN(parseFloat(value)) || '请输入有效的数字',
    minValue: (min) => (value) => 
      parseFloat(value) >= min || `值不能小于 ${min}`,
    maxValue: (max) => (value) => 
      parseFloat(value) <= max || `值不能大于 ${max}`,
    phone: (value) => {
      const pattern = /^1[3-9]\d{9}$/
      return pattern.test(value) || '请输入有效的手机号码'
    }
  }
  
  // 本地存储工具
  export const storage = {
    get: (key, defaultValue = null) => {
      try {
        const item = localStorage.getItem(key)
        return item ? JSON.parse(item) : defaultValue
      } catch {
        return defaultValue
      }
    },
    
    set: (key, value) => {
      try {
        localStorage.setItem(key, JSON.stringify(value))
        return true
      } catch {
        return false
      }
    },
    
    remove: (key) => {
      try {
        localStorage.removeItem(key)
        return true
      } catch {
        return false
      }
    },
    
    clear: () => {
      try {
        localStorage.clear()
        return true
      } catch {
        return false
      }
    }
  }
  
  // 颜色工具
  export const colorUtils = {
    // 生成随机颜色
    randomColor: () => {
      const letters = '0123456789ABCDEF'
      let color = '#'
      for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)]
      }
      return color
    },
    
    // 颜色亮度调整
    lighten: (color, percent) => {
      const num = parseInt(color.replace('#', ''), 16)
      const amt = Math.round(2.55 * percent)
      const R = (num >> 16) + amt
      const G = (num >> 8 & 0x00FF) + amt
      const B = (num & 0x0000FF) + amt
      return '#' + (
        0x1000000 +
        (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
        (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
        (B < 255 ? B < 1 ? 0 : B : 255)
      ).toString(16).slice(1)
    },
    
    // 颜色变暗
    darken: (color, percent) => {
      return colorUtils.lighten(color, -percent)
    }
  }
  
  // 导出默认工具集合
  export default {
    formatDate,
    formatFileSize,
    formatNumber,
    debounce,
    throttle,
    deepClone,
    deepMerge,
    generateId,
    uniqueArray,
    groupBy,
    sortBy,
    filterArray,
    validators,
    storage,
    colorUtils
  }