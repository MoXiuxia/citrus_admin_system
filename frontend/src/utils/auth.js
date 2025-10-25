// 认证工具函数

// 认证状态检查
export const checkAuthStatus = () => {
  const user = localStorage.getItem('user')
  const admin = localStorage.getItem('admin')
  
  return {
    isAuthenticated: !!(user && user !== 'undefined' && user !== 'null'),
    isAdmin: !!(admin && admin !== 'undefined' && admin !== 'null' && admin !== 'false'),
    user: (() => {
      try {
        return user && user !== 'undefined' && user !== 'null' ? JSON.parse(user) : null
      } catch (e) {
        return null
      }
    })()
  }
}

// 路由守卫
export const createRouteGuard = (router) => {
  router.beforeEach((to, from, next) => {
    const { isAuthenticated, isAdmin } = checkAuthStatus()
    
    // 检查是否需要认证
    if (to.meta.requiresAuth && !isAuthenticated && !isAdmin) {
      next('/login')
      return
    }
    
    // 检查是否需要管理员权限
    if (to.meta.requiresAdmin && !isAdmin) {
      if (isAuthenticated) {
        next('/user')
      } else {
        next('/login')
      }
      return
    }
    
    // 已认证用户访问登录页，重定向到对应首页
    if (to.path === '/login' && (isAuthenticated || isAdmin)) {
      if (isAdmin) {
        next('/admin')
      } else {
        next('/user')
      }
      return
    }
    
    next()
  })
}

// 权限检查
export const hasPermission = (permission) => {
  const { isAdmin, user } = checkAuthStatus()
  
  // 管理员拥有所有权限
  if (isAdmin) return true
  
  // 这里可以根据用户角色检查具体权限
  // 目前简单实现：所有认证用户都有基本权限
  if (user) {
    // 可以根据用户信息检查具体权限
    return true
  }
  
  return false
}

// 安全登出
export const secureLogout = (router) => {
  // 清除所有本地存储
  localStorage.clear()
  sessionStorage.clear()
  
  // 重定向到登录页
  router.push('/login')
  
  // 强制刷新页面以确保状态完全清除
  setTimeout(() => {
    window.location.reload()
  }, 100)
}

// 导出工具函数
export default {
  checkAuthStatus,
  createRouteGuard,
  hasPermission,
  secureLogout
}

// // 令牌刷新（预留功能）
// export const refreshToken = async () => {
//   // 这里可以实现令牌刷新逻辑
//   console.log('刷新令牌功能待实现')
//   return Promise.resolve(true)
// }

// // 自动登出检测
// export const setupAutoLogout = (store) => {
//   let inactivityTimer
  
//   const resetTimer = () => {
//     clearTimeout(inactivityTimer)
//     // 设置30分钟无操作自动登出
//     inactivityTimer = setTimeout(() => {
//       store.dispatch('logout')
//       window.location.href = '/login'
//     }, 30 * 60 * 1000) // 30分钟
//   }
  
//   // 监听用户活动
//   const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart']
//   events.forEach(event => {
//     document.addEventListener(event, resetTimer, true)
//   })
  
//   resetTimer()
  
//   // 返回清理函数
//   return () => {
//     clearTimeout(inactivityTimer)
//     events.forEach(event => {
//       document.removeEventListener(event, resetTimer, true)
//     })
//   }
// }

// // 权限检查
// export const hasPermission = (permission) => {
//   const { isAdmin, user } = checkAuthStatus()
  
//   // 管理员拥有所有权限
//   if (isAdmin) return true
  
//   // 这里可以根据用户角色检查具体权限
//   // 目前简单实现：所有认证用户都有基本权限
//   if (user) {
//     // 可以根据用户信息检查具体权限
//     return true
//   }
  
//   return false
// }

// // 安全登出
// export const secureLogout = (store, router) => {
//   // 清除所有本地存储
//   localStorage.clear()
//   sessionStorage.clear()
  
//   // 清除 store 状态
//   store.dispatch('logout')
  
//   // 重定向到登录页
//   router.push('/login')
  
//   // 强制刷新页面以确保状态完全清除
//   setTimeout(() => {
//     window.location.reload()
//   }, 100)
// }

// // 导出工具函数
// export default {
//   checkAuthStatus,
//   createRouteGuard,
//   refreshToken,
//   setupAutoLogout,
//   hasPermission,
//   secureLogout
// }