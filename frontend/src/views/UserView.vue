<template>
    <div class="user-view">
        <header class="user-header">
            <div class="header-content">
                <h1>陈皮信息管理系统</h1>
                <div class="user-info">
                    <span>欢迎，{{ user.username }}</span>
                    <button class="btn btn-danger" @click="logout">退出登录</button>
                </div>
            </div>
        </header>
        <main class="user-main">
            <router-view></router-view>
        </main>
    </div>
</template>

<script>
import { secureLogout } from '@/utils/auth'

export default {
    name: 'UserView',
    data() {
        return {
            user: JSON.parse(localStorage.getItem('user') || '{}')
        }
    },
    methods: {
        logout() {
            secureLogout(this.$router)
        }
    }
}
</script>

<style scoped>
.user-view {
    min-height: 100vh;
    background-color: #f5f5f5;
}

.user-header {
    background: white;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
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

.user-header h1 {
    color: #333;
    margin: 0;
}

.user-info {
    display: flex;
    align-items: center;
    gap: 15px;
}

.user-main {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
}
</style>