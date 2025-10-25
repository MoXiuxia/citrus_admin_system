<template>
    <div class="login-container">
        <div class="login-card">
            <div class="logo-section">
                <div class="logo-icon">🍊</div>
                <h2>陈皮信息管理系统</h2>
                <p class="subtitle">新会陈皮 · 传承百年</p>
            </div>
            
            <div class="tab-buttons">
                <button 
                    :class="['tab-btn', activeTab === 'user' ? 'active' : '']"
                    @click="activeTab = 'user'"
                >
                    用户登录
                </button>
                <button 
                    :class="['tab-btn', activeTab === 'admin' ? 'active' : '']"
                    @click="activeTab = 'admin'"
                >
                    管理员登录
                </button>
                <button 
                    :class="['tab-btn', activeTab === 'register' ? 'active' : '']"
                    @click="activeTab = 'register'"
                >
                    用户注册
                </button>
            </div>

            <!-- 用户登录 -->
            <div v-if="activeTab === 'user'" class="form-container">
                <div class="form-group">
                    <label>账号:</label>
                    <input type="text" v-model="userLogin.username" placeholder="请输入账号">
                </div>
                <div class="form-group">
                    <label>密码:</label>
                    <input type="password" v-model="userLogin.password" placeholder="请输入密码">
                </div>
                <button class="btn btn-primary" @click="handleUserLogin">登录</button>
            </div>

            <!-- 管理员登录 -->
            <div v-if="activeTab === 'admin'" class="form-container">
                <div class="form-group">
                    <label>管理员账号:</label>
                    <input type="text" v-model="adminLogin.username" placeholder="请输入管理员账号">
                </div>
                <div class="form-group">
                    <label>密码:</label>
                    <input type="password" v-model="adminLogin.password" placeholder="请输入密码">
                </div>
                <button class="btn btn-primary" @click="handleAdminLogin">管理员登录</button>
            </div>

            <!-- 用户注册 -->
            <div v-if="activeTab === 'register'" class="form-container">
                <div class="form-group">
                    <label>账号:</label>
                    <input type="text" v-model="register.username" placeholder="请输入账号">
                </div>
                <div class="form-group">
                    <label>密码:</label>
                    <input type="password" v-model="register.password" placeholder="请输入密码">
                </div>
                <div class="form-group">
                    <label>确认密码:</label>
                    <input type="password" v-model="register.confirmPassword" placeholder="请再次输入密码">
                </div>
                <button class="btn btn-success" @click="handleRegister">注册</button>
            </div>

            <div v-if="message" class="message" :class="messageType">
                {{ message }}
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'Login',
    data() {
        return {
            activeTab: 'user',
            userLogin: {
                username: '',
                password: ''
            },
            adminLogin: {
                username: '',
                password: ''
            },
            register: {
                username: '',
                password: '',
                confirmPassword: ''
            },
            message: '',
            messageType: ''
        }
    },
    methods: {
        async handleUserLogin() {
            if (!this.userLogin.username || !this.userLogin.password) {
                this.showMessage('请输入账号和密码', 'error');
                return;
            }

            try {
                const response = await fetch('/api/auth/user-login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(this.userLogin)
                });

                const data = await response.json();
                console.log('用户登录响应:', data);

                if (response.ok && data.success) {
                    // 根据后端返回的数据结构调整
                    const userData = data.data.user || data.user;
                    localStorage.setItem('user', JSON.stringify(userData));
                    this.showMessage('登录成功', 'success');
                    setTimeout(() => {
                        this.$router.push('/user');
                    }, 1000);
                } else {
                    this.showMessage(data.error || '登录失败', 'error');
                }
            } catch (error) {
                console.error('登录错误:', error);
                this.showMessage('登录失败，请稍后重试', 'error');
            }
        },

        async handleAdminLogin() {
            if (!this.adminLogin.username || !this.adminLogin.password) {
                this.showMessage('请输入管理员账号和密码', 'error');
                return;
            }

            try {
                const response = await fetch('/api/auth/admin-login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(this.adminLogin)
                });

                const data = await response.json();
                console.log('管理员登录响应:', data);

                if (response.ok && data.success) {
                    localStorage.setItem('admin', 'true');
                    this.showMessage('管理员登录成功', 'success');
                    setTimeout(() => {
                        this.$router.push('/admin');
                    }, 1000);
                } else {
                    this.showMessage(data.error || '登录失败', 'error');
                }
            } catch (error) {
                console.error('管理员登录错误:', error);
                this.showMessage('登录失败，请稍后重试', 'error');
            }
        },

        async handleRegister() {
            if (!this.register.username || !this.register.password) {
                this.showMessage('请输入账号和密码', 'error');
                return;
            }

            if (this.register.password !== this.register.confirmPassword) {
                this.showMessage('两次输入的密码不一致', 'error');
                return;
            }

            try {
                const response = await fetch('/api/auth/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        username: this.register.username,
                        password: this.register.password
                    })
                });

                const data = await response.json();

                if (response.ok && data.success) {
                    this.showMessage('注册成功，请登录', 'success');
                    this.activeTab = 'user';
                    this.userLogin.username = this.register.username;
                    this.register = { username: '', password: '', confirmPassword: '' };
                } else {
                    this.showMessage(data.error || '注册失败', 'error');
                }
            } catch (error) {
                this.showMessage('注册失败，请稍后重试', 'error');
            }
        },

        showMessage(msg, type) {
            this.message = msg;
            this.messageType = type;
            setTimeout(() => {
                this.message = '';
            }, 3000);
        }
    }
}
</script>

<style scoped>
:root {
  --citrus-primary: #FFA726;
  --citrus-secondary: #8D6E63;
  --citrus-accent: #FFB74D;
  --citrus-light: #FFF3E0;
  --citrus-dark: #5D4037;
  --citrus-success: #689F38;
  --citrus-warning: #FF9800;
  --citrus-error: #E53935;
  --citrus-white: #FFFFFF;
  --citrus-gray-100: #F5F5F5;
  --citrus-gray-200: #EEEEEE;
  --citrus-gray-300: #E0E0E0;
  --citrus-gray-400: #BDBDBD;
  --citrus-gray-500: #9E9E9E;
  --citrus-gray-600: #757575;
  --citrus-gray-700: #616161;
  --citrus-gray-800: #424242;
  --citrus-gray-900: #212121;
}

.login-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    background: linear-gradient(135deg, var(--citrus-light) 0%, #FFECB3 100%);
    padding: 20px;
}

.login-card {
    background: var(--citrus-white);
    padding: 40px;
    border-radius: 16px;
    box-shadow: 0 10px 40px rgba(141, 110, 99, 0.15);
    width: 100%;
    max-width: 420px;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.login-card:hover {
    box-shadow: 0 15px 50px rgba(141, 110, 99, 0.2);
    transform: translateY(-5px);
}

.logo-section {
    text-align: center;
    margin-bottom: 30px;
}

.logo-icon {
    font-size: 48px;
    margin-bottom: 10px;
}

.login-card h2 {
    text-align: center;
    margin-bottom: 10px;
    color: var(--citrus-dark);
    font-weight: 700;
    font-size: 24px;
}

.subtitle {
    text-align: center;
    color: var(--citrus-gray-600);
    font-size: 14px;
    margin-bottom: 0;
}

.tab-buttons {
    display: flex;
    margin-bottom: 20px;
    border-radius: 10px;
    background: var(--citrus-gray-100);
    padding: 4px;
}

.tab-btn {
    flex: 1;
    padding: 12px;
    border: none;
    background: transparent;
    cursor: pointer;
    border-radius: 8px;
    font-weight: 500;
    transition: all 0.3s ease;
    color: var(--citrus-gray-600);
}

.tab-btn.active {
    background: var(--citrus-white);
    color: var(--citrus-primary);
    box-shadow: 0 2px 8px rgba(255, 167, 38, 0.2);
    font-weight: 600;
}

.tab-btn:hover:not(.active) {
    background: rgba(255, 255, 255, 0.7);
    color: var(--citrus-dark);
}

.form-container {
    margin-top: 20px;
}

.form-group {
    margin-bottom: 20px;
}

.form-group label {
    display: block;
    margin-bottom: 8px;
    font-weight: 600;
    color: var(--citrus-dark);
}

.form-group input {
    width: 100%;
    padding: 12px 16px;
    border: 2px solid var(--citrus-gray-300);
    border-radius: 8px;
    font-size: 14px;
    transition: all 0.3s ease;
    background: white;
}

.form-group input:focus {
    outline: none;
    border-color: var(--citrus-primary);
    box-shadow: 0 0 0 3px rgba(255, 167, 38, 0.1);
}

.btn {
    width: 100%;
    padding: 14px;
    margin-top: 10px;
    border: none;
    border-radius: 8px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
}

.btn-primary {
    background: linear-gradient(135deg, var(--citrus-primary) 0%, var(--citrus-accent) 100%);
    color: white;
}

.btn-primary:hover {
    background: linear-gradient(135deg, var(--citrus-accent) 0%, var(--citrus-primary) 100%);
    box-shadow: 0 4px 15px rgba(255, 167, 38, 0.3);
    transform: translateY(-2px);
}

.btn-success {
    background: linear-gradient(135deg, var(--citrus-success) 0%, #8BC34A 100%);
    color: white;
}

.btn-success:hover {
    background: linear-gradient(135deg, #8BC34A 0%, var(--citrus-success) 100%);
    box-shadow: 0 4px 15px rgba(104, 159, 56, 0.3);
    transform: translateY(-2px);
}

.message {
    margin-top: 20px;
    padding: 12px;
    border-radius: 8px;
    text-align: center;
    font-weight: 500;
}

.message.success {
    background-color: #E8F5E8;
    color: var(--citrus-success);
    border: 1px solid #C8E6C9;
}

.message.error {
    background-color: #FFEBEE;
    color: var(--citrus-error);
    border: 1px solid #FFCDD2;
}

@media (max-width: 480px) {
    .login-card {
        padding: 30px 20px;
    }
    
    .tab-btn {
        padding: 10px;
        font-size: 14px;
    }
}
</style>