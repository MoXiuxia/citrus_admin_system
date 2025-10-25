<template>
    <div class="admin-view">
        <header class="admin-header">
            <div class="header-content">
                <h1>陈皮管理系统 - 管理员</h1>
                <div class="admin-info">
                    <span>管理员面板</span>
                    <button class="btn btn-danger" @click="logout">退出登录</button>
                </div>
            </div>
        </header>
        <main class="admin-main">
            <router-view></router-view>
        </main>
    </div>
</template>

<script>
import { secureLogout } from '@/utils/auth'

export default {
    name: 'AdminView',
    methods: {
        logout() {
            secureLogout(this.$router)
        }
    }
}
</script>

<style scoped>
.admin-view {
    min-height: 100vh;
    background-color: #f8f9fa;
}

.admin-header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 1rem 0;
}

.header-content {
    max-width: 1200px;
    margin: 0 auto;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 20px;
}

.admin-header h1 {
    margin: 0;
    font-size: 1.5rem;
}

.admin-info {
    display: flex;
    align-items: center;
    gap: 15px;
}

.admin-main {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
}
</style>