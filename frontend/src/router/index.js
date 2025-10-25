// import { createRouter, createWebHistory } from 'vue-router'
// import Login from '../components/Login.vue'
// import UserHome from '../components/UserHome.vue'
// import AdminHome from '../components/AdminHome.vue'
// import UserView from '../views/UserView.vue'
// import AdminView from '../views/AdminView.vue'

// const routes = [
//     { 
//         path: '/', 
//         redirect: '/login' 
//     },
//     { 
//         path: '/login', 
//         component: Login 
//     },
//     { 
//         path: '/user', 
//         component: UserView,
//         meta: { requiresAuth: true },
//         children: [
//             { 
//                 path: '', 
//                 component: UserHome 
//             }
//         ]
//     },
//     { 
//         path: '/admin', 
//         component: AdminView,
//         meta: { requiresAuth: true, requiresAdmin: true },
//         children: [
//             { 
//                 path: '', 
//                 component: AdminHome 
//             }
//         ]
//     }
// ]

// const router = createRouter({
//     history: createWebHistory(),
//     routes
// })

// router.beforeEach((to, from, next) => {
//     // 检查是否需要认证
//     if (to.meta.requiresAuth) {
//         const isUser = localStorage.getItem('user')
//         const isAdmin = localStorage.getItem('admin')
        
//         if (!isUser && !isAdmin) {
//             next('/login')
//             return
//         }
        
//         // 检查是否需要管理员权限
//         if (to.meta.requiresAdmin && !isAdmin) {
//             next('/user')
//             return
//         }
//     }
    
//     next()
// })

// export default router


import { createRouter, createWebHistory } from 'vue-router'
import { createRouteGuard } from '@/utils/auth'
import Login from '../components/Login.vue'
import UserHome from '../components/UserHome.vue'
import AdminHome from '../components/AdminHome.vue'

const routes = [
  { 
    path: '/', 
    redirect: '/login' 
  },
  { 
    path: '/login', 
    component: Login 
  },
  { 
    path: '/user', 
    component: UserHome, 
    meta: { requiresAuth: true } 
  },
  { 
    path: '/admin', 
    component: AdminHome, 
    meta: { requiresAuth: true, requiresAdmin: true } 
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 应用路由守卫
createRouteGuard(router)

export default router
