<template>
    <header class="app-header">
        <div class="header-container">
            <!-- Logo和标题 -->
            <div class="header-brand">
                <div class="logo">
                    <span class="logo-icon">🍊</span>
                    <h1 class="logo-text">陈皮信息管理系统</h1>
                </div>
            </div>

            <!-- 导航菜单 -->
            <nav class="header-nav" v-if="showNavigation">
                <router-link 
                    v-for="item in navItems" 
                    :key="item.path"
                    :to="item.path" 
                    :class="['nav-item', { active: $route.path === item.path }]"
                >
                    <span class="nav-icon">{{ item.icon }}</span>
                    <span class="nav-text">{{ item.name }}</span>
                </router-link>
            </nav>

            <!-- 用户信息 -->
            <div class="header-user" v-if="userInfo">
                <div class="user-info">
                    <span class="user-avatar">
                        {{ userInfo.username?.charAt(0).toUpperCase() }}
                    </span>
                    <div class="user-details">
                        <span class="user-name">{{ userInfo.username }}</span>
                        <span class="user-role">{{ userRole }}</span>
                    </div>
                </div>
                <div class="header-actions">
                    <button class="btn btn-icon" @click="toggleNotifications" title="通知">
                        <span class="icon">🔔</span>
                        <span class="notification-badge" v-if="unreadCount > 0">{{ unreadCount }}</span>
                    </button>
                    <button class="btn btn-icon" @click="toggleUserMenu" title="用户菜单">
                        <span class="icon">⬇️</span>
                    </button>
                    
                    <!-- 用户菜单 -->
                    <div class="user-menu" v-if="showUserMenu">
                        <div class="menu-item" @click="goToProfile">
                            <span class="menu-icon">👤</span>
                            个人信息
                        </div>
                        <div class="menu-item" @click="goToSettings">
                            <span class="menu-icon">⚙️</span>
                            设置
                        </div>
                        <div class="menu-divider"></div>
                        <div class="menu-item logout" @click="logout">
                            <span class="menu-icon">🚪</span>
                            退出登录
                        </div>
                    </div>
                </div>
            </div>

            <!-- 通知面板 -->
            <div class="notification-panel" v-if="showNotifications">
                <div class="panel-header">
                    <h3>通知</h3>
                    <button class="btn btn-icon" @click="closeNotifications">
                        <span class="icon">✕</span>
                    </button>
                </div>
                <div class="panel-content">
                    <div v-if="notifications.length === 0" class="empty-notifications">
                        <span class="empty-icon">📭</span>
                        <p>暂无通知</p>
                    </div>
                    <div v-else class="notifications-list">
                        <div 
                            v-for="notification in notifications" 
                            :key="notification.id"
                            :class="['notification-item', { unread: !notification.read }]"
                            @click="markAsRead(notification.id)"
                        >
                            <div class="notification-icon">
                                {{ getNotificationIcon(notification.type) }}
                            </div>
                            <div class="notification-content">
                                <p class="notification-message">{{ notification.message }}</p>
                                <span class="notification-time">{{ formatTime(notification.time) }}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- 遮罩层 -->
        <div 
            class="overlay" 
            v-if="showUserMenu || showNotifications"
            @click="closeAll"
        ></div>
    </header>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

export default {
    name: 'AppHeader',
    setup() {
        const router = useRouter()
        const route = useRoute()
        
        // 响应式数据
        const showUserMenu = ref(false)
        const showNotifications = ref(false)
        const notifications = ref([])
        const userInfo = ref(null)
        
        // 计算属性
        const showNavigation = computed(() => {
            return route.path !== '/login'
        })
        
        const userRole = computed(() => {
            if (localStorage.getItem('admin')) return '管理员'
            if (localStorage.getItem('user')) return '用户'
            return '游客'
        })
        
        const unreadCount = computed(() => {
            return notifications.value.filter(n => !n.read).length
        })
        
        const navItems = computed(() => {
            if (localStorage.getItem('admin')) {
                return [
                    { path: '/admin', name: '管理首页', icon: '🏠' },
                    { path: '/admin?tab=stock', name: '库存管理', icon: '📦' },
                    { path: '/admin?tab=pending', name: '审核任务', icon: '📋' }
                ]
            } else if (localStorage.getItem('user')) {
                return [
                    { path: '/user', name: '提交信息', icon: '📝' }
                ]
            }
            return []
        })
        
        // 方法
        const toggleUserMenu = () => {
            showUserMenu.value = !showUserMenu.value
            showNotifications.value = false
        }
        
        const toggleNotifications = () => {
            showNotifications.value = !showNotifications.value
            showUserMenu.value = false
        }
        
        const closeAll = () => {
            showUserMenu.value = false
            showNotifications.value = false
        }
        
        const closeNotifications = () => {
            showNotifications.value = false
        }
        
        const logout = () => {
            localStorage.removeItem('user')
            localStorage.removeItem('admin')
            closeAll()
            router.push('/login')
        }
        
        const goToProfile = () => {
            // 跳转到个人信息页面
            closeAll()
            // 这里可以添加跳转到个人资料的逻辑
            console.log('跳转到个人信息')
        }
        
        const goToSettings = () => {
            // 跳转到设置页面
            closeAll()
            // 这里可以添加跳转到设置的逻辑
            console.log('跳转到设置')
        }
        
        const markAsRead = (notificationId) => {
            const notification = notifications.value.find(n => n.id === notificationId)
            if (notification) {
                notification.read = true
            }
        }
        
        const getNotificationIcon = (type) => {
            const icons = {
                success: '✅',
                warning: '⚠️',
                error: '❌',
                info: 'ℹ️',
                review: '📋',
                system: '🔧'
            }
            return icons[type] || '📢'
        }
        
        const formatTime = (time) => {
            const now = new Date()
            const notificationTime = new Date(time)
            const diff = now - notificationTime
            
            if (diff < 60000) return '刚刚'
            if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
            if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`
            return notificationTime.toLocaleDateString()
        }
        
        const loadUserInfo = () => {
            const userData = localStorage.getItem('user')
            if (userData) {
                userInfo.value = JSON.parse(userData)
            } else if (localStorage.getItem('admin')) {
                userInfo.value = { username: '管理员' }
            }
        }
        
        const loadNotifications = () => {
            // 模拟通知数据
            notifications.value = [
                {
                    id: 1,
                    type: 'success',
                    message: '您的陈皮提交已通过审核',
                    time: new Date(Date.now() - 300000),
                    read: false
                },
                {
                    id: 2,
                    type: 'review',
                    message: '您有新的审核任务待处理',
                    time: new Date(Date.now() - 1800000),
                    read: true
                },
                {
                    id: 3,
                    type: 'info',
                    message: '系统维护通知：本周六凌晨2-4点进行系统维护',
                    time: new Date(Date.now() - 86400000),
                    read: true
                }
            ]
        }
        
        // 点击外部关闭菜单
        const handleClickOutside = (event) => {
            if (!event.target.closest('.header-user') && showUserMenu.value) {
                showUserMenu.value = false
            }
            if (!event.target.closest('.header-actions') && showNotifications.value) {
                showNotifications.value = false
            }
        }
        
        // 生命周期
        onMounted(() => {
            loadUserInfo()
            loadNotifications()
            document.addEventListener('click', handleClickOutside)
        })
        
        onUnmounted(() => {
            document.removeEventListener('click', handleClickOutside)
        })
        
        return {
            showUserMenu,
            showNotifications,
            notifications,
            userInfo,
            showNavigation,
            userRole,
            unreadCount,
            navItems,
            toggleUserMenu,
            toggleNotifications,
            closeAll,
            closeNotifications,
            logout,
            goToProfile,
            goToSettings,
            markAsRead,
            getNotificationIcon,
            formatTime
        }
    }
}
</script>

<style scoped>
.app-header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    position: sticky;
    top: 0;
    z-index: 1000;
}

.header-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 64px;
}

.header-brand {
    display: flex;
    align-items: center;
}

.logo {
    display: flex;
    align-items: center;
    gap: 12px;
}

.logo-icon {
    font-size: 28px;
}

.logo-text {
    font-size: 20px;
    font-weight: 600;
    margin: 0;
    color: white;
}

.header-nav {
    display: flex;
    gap: 8px;
}

.nav-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    border-radius: 6px;
    color: rgba(255,255,255,0.8);
    text-decoration: none;
    transition: all 0.3s ease;
    font-weight: 500;
}

.nav-item:hover {
    background: rgba(255,255,255,0.1);
    color: white;
}

.nav-item.active {
    background: rgba(255,255,255,0.2);
    color: white;
}

.nav-icon {
    font-size: 16px;
}

.nav-text {
    font-size: 14px;
}

.header-user {
    display: flex;
    align-items: center;
    gap: 16px;
    position: relative;
}

.user-info {
    display: flex;
    align-items: center;
    gap: 12px;
}

.user-avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: rgba(255,255,255,0.2);
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    font-size: 14px;
}

.user-details {
    display: flex;
    flex-direction: column;
}

.user-name {
    font-weight: 600;
    font-size: 14px;
}

.user-role {
    font-size: 12px;
    opacity: 0.8;
}

.header-actions {
    display: flex;
    align-items: center;
    gap: 8px;
    position: relative;
}

.btn-icon {
    background: rgba(255,255,255,0.1);
    border: none;
    border-radius: 6px;
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    position: relative;
    transition: all 0.3s ease;
    color: white;
}

.btn-icon:hover {
    background: rgba(255,255,255,0.2);
}

.notification-badge {
    position: absolute;
    top: -4px;
    right: -4px;
    background: #ff4757;
    color: white;
    border-radius: 50%;
    width: 18px;
    height: 18px;
    font-size: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.user-menu {
    position: absolute;
    top: 100%;
    right: 0;
    background: white;
    border-radius: 8px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.15);
    min-width: 180px;
    z-index: 1001;
    margin-top: 8px;
    overflow: hidden;
}

.menu-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    cursor: pointer;
    transition: background 0.3s ease;
    color: #333;
    font-size: 14px;
}

.menu-item:hover {
    background: #f8f9fa;
}

.menu-item.logout {
    color: #dc3545;
}

.menu-item.logout:hover {
    background: #ffe6e6;
}

.menu-divider {
    height: 1px;
    background: #e9ecef;
    margin: 4px 0;
}

.menu-icon {
    font-size: 16px;
    width: 20px;
    text-align: center;
}

.notification-panel {
    position: absolute;
    top: 100%;
    right: 0;
    background: white;
    border-radius: 8px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.15);
    width: 320px;
    max-height: 400px;
    z-index: 1001;
    margin-top: 8px;
    display: flex;
    flex-direction: column;
}

.panel-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px;
    border-bottom: 1px solid #e9ecef;
}

.panel-header h3 {
    margin: 0;
    color: #333;
    font-size: 16px;
}

.panel-content {
    flex: 1;
    overflow-y: auto;
}

.empty-notifications {
    padding: 40px 20px;
    text-align: center;
    color: #6c757d;
}

.empty-icon {
    font-size: 48px;
    margin-bottom: 16px;
    display: block;
}

.notifications-list {
    padding: 8px 0;
}

.notification-item {
    display: flex;
    gap: 12px;
    padding: 12px 16px;
    cursor: pointer;
    transition: background 0.3s ease;
    border-left: 3px solid transparent;
}

.notification-item:hover {
    background: #f8f9fa;
}

.notification-item.unread {
    background: #f0f7ff;
    border-left-color: #007bff;
}

.notification-icon {
    font-size: 18px;
    flex-shrink: 0;
}

.notification-content {
    flex: 1;
}

.notification-message {
    margin: 0 0 4px 0;
    font-size: 14px;
    color: #333;
    line-height: 1.4;
}

.notification-time {
    font-size: 12px;
    color: #6c757d;
}

.overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: transparent;
    z-index: 999;
}

@media (max-width: 768px) {
    .header-container {
        padding: 0 16px;
    }
    
    .logo-text {
        font-size: 16px;
    }
    
    .nav-text {
        display: none;
    }
    
    .user-details {
        display: none;
    }
    
    .notification-panel {
        width: 280px;
    }
}
</style>