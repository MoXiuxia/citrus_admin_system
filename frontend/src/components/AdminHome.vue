<template>
    <div class="container">
        <header class="header">
            <div class="header-content">
                <div class="header-title">
                    <h1>陈皮库存管理系统</h1>
                    <p class="header-subtitle">新会陈皮 · 专业管理</p>
                </div>
                <button class="btn btn-danger" @click="logout">退出登录</button>
            </div>
        </header>

        <div class="tabs">
            <button 
                v-for="tab in tabs" 
                :key="tab.id"
                :class="['tab-btn', activeTab === tab.id ? 'active' : '']"
                @click="activeTab = tab.id"
            >
                {{ tab.name }}
            </button>
        </div>

        <!-- 库存状态页面 -->
        <div v-if="activeTab === 'stock'" class="tab-content">
            <div class="card">
                <div class="card-header">
                    <h2>陈皮库存状态</h2>
                    <p class="card-description">各年份陈皮库存总量 (0-150年)</p>
                </div>
                <div v-if="stockData.length === 0" class="empty-state">
                    <div class="empty-icon">📦</div>
                    <p class="empty-text">暂无库存数据</p>
                </div>
                <table v-else class="citrus-table">
                    <thead>
                        <tr>
                            <th>年份范围</th>
                            <th>库存克数</th>
                            <th>最后更新</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="item in stockData" :key="item.id">
                            <td>{{ item.year_range }}年</td>
                            <td><span class="weight-value">{{ item.stock_weight }}</span> 克</td>
                            <td>{{ formatDate(item.updated_at) }}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- 所有提交信息页面 -->
        <div v-if="activeTab === 'submissions'" class="tab-content">
            <div class="card">
                <div class="card-header">
                    <h2>所有用户提交信息</h2>
                    <p class="card-description">查看所有用户的陈皮提交记录 (0-150年)</p>
                </div>
                <div v-if="allSubmissions.length === 0" class="empty-state">
                    <div class="empty-icon">📝</div>
                    <p class="empty-text">暂无提交数据</p>
                </div>
                <div v-else class="table-container">
                    <table class="citrus-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>用户</th>
                                <th>AI识别结果</th>
                                <th>用户选择</th>
                                <th>克数</th>
                                <th>状态</th>
                                <th>提交时间</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="submission in allSubmissions" :key="submission.id">
                                <td>{{ submission.id }}</td>
                                <td>{{ submission.username }}</td>
                                <td>{{ submission.ai_year_result }}年</td>
                                <td>{{ submission.manual_year_selection }}年</td>
                                <td><span class="weight-value">{{ submission.weight }}</span> 克</td>
                                <td>
                                    <span :class="['status-badge', getStatusClass(submission.status)]">
                                        {{ getStatusText(submission.status) }}
                                    </span>
                                </td>
                                <td>{{ formatDate(submission.submitted_at) }}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        <!-- 待审核任务页面 -->
        <div v-if="activeTab === 'pending'" class="tab-content">
            <div class="card">
                <div class="card-header">
                    <h2>待审核任务</h2>
                    <p class="card-description">审核用户提交的陈皮信息 (0-150年)</p>
                </div>
                <div v-if="pendingSubmissions.length === 0" class="empty-state">
                    <div class="empty-icon">✅</div>
                    <p class="empty-text">暂无待审核任务</p>
                    <p class="empty-subtext">所有提交已审核完成</p>
                </div>
                <div v-else class="table-container">
                    <table class="citrus-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>用户</th>
                                <th>图片</th>
                                <th>AI识别结果</th>
                                <th>用户选择</th>
                                <th>克数</th>
                                <th>操作</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="submission in pendingSubmissions" :key="submission.id">
                                <td>{{ submission.id }}</td>
                                <td>{{ submission.username }}</td>
                                <td>
                                    <div class="image-cell">
                                        <img v-if="submission.image_url" 
                                             :src="'http://localhost:3000' + submission.image_url" 
                                             alt="陈皮图片" 
                                             class="submission-image">
                                        <span v-else class="no-image">无图片</span>
                                    </div>
                                </td>
                                <td>{{ submission.ai_year_result }}年</td>
                                <td>{{ submission.manual_year_selection }}年</td>
                                <td><span class="weight-value">{{ submission.weight }}</span> 克</td>
                                <td>
                                    <div class="action-buttons">
                                        <button class="btn btn-success btn-sm" @click="reviewSubmission(submission.id, 'approved')">
                                            通过
                                        </button>
                                        <button class="btn btn-danger btn-sm" @click="reviewSubmission(submission.id, 'rejected')">
                                            拒绝
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        <!-- 管理员管理页面 -->
        <div v-if="activeTab === 'admin-management'" class="tab-content">
            <div class="card">
                <div class="card-header">
                    <h2>添加管理员</h2>
                    <p class="card-description">创建新的管理员账户</p>
                </div>
                <form @submit.prevent="addAdmin">
                    <div class="form-group">
                        <label>管理员账号:</label>
                        <input type="text" v-model="newAdmin.username" placeholder="请输入新管理员账号" class="form-input">
                        <small class="form-hint">账号长度需在3-50个字符之间</small>
                    </div>
                    <div class="form-group">
                        <label>密码:</label>
                        <input type="password" v-model="newAdmin.password" placeholder="请输入密码" class="form-input">
                        <small class="form-hint">密码长度需至少6个字符</small>
                    </div>
                    <button type="submit" class="btn btn-primary">添加管理员</button>
                </form>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'AdminHome',
    data() {
        return {
            activeTab: 'stock',
            tabs: [
                { id: 'stock', name: '库存状态' },
                { id: 'submissions', name: '所有提交' },
                { id: 'pending', name: '待审核任务' },
                { id: 'admin-management', name: '管理员管理' }
            ],
            stockData: [],
            allSubmissions: [],
            pendingSubmissions: [],
            newAdmin: {
                username: '',
                password: ''
            }
        }
    },
    mounted() {
        this.loadStockData();
        this.loadAllSubmissions();
        this.loadPendingSubmissions();
    },
    methods: {
        async loadStockData() {
            try {
                const response = await fetch('http://localhost:3000/api/citrus/stock');
                const result = await response.json();
                if (result.success) {
                    this.stockData = result.data.stock;
                } else {
                    console.error('获取库存数据失败:', result.error);
                }
            } catch (error) {
                console.error('加载库存数据失败:', error);
            }
        },

        async loadAllSubmissions() {
            try {
                const response = await fetch('http://localhost:3000/api/citrus/submissions');
                const result = await response.json();
                if (result.success) {
                    this.allSubmissions = result.data.submissions;
                } else {
                    console.error('获取提交数据失败:', result.error);
                }
            } catch (error) {
                console.error('加载提交数据失败:', error);
            }
        },

        async loadPendingSubmissions() {
            try {
                const response = await fetch('http://localhost:3000/api/citrus/submissions/pending');
                const result = await response.json();
                if (result.success) {
                    this.pendingSubmissions = result.data.submissions;
                } else {
                    console.error('获取待审核数据失败:', result.error);
                }
            } catch (error) {
                console.error('加载待审核数据失败:', error);
            }
        },

        async reviewSubmission(submissionId, status) {
            try {
                const response = await fetch(`http://localhost:3000/api/citrus/submissions/${submissionId}/review`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ status })
                });

                const result = await response.json();
                if (result.success) {
                    this.showMessage('审核完成', 'success');
                    this.loadPendingSubmissions();
                    this.loadStockData();
                    this.loadAllSubmissions();
                } else {
                    this.showMessage('审核失败: ' + result.error, 'error');
                }
            } catch (error) {
                console.error('审核失败:', error);
                this.showMessage('审核失败，请稍后重试', 'error');
            }
        },

        async addAdmin() {
            if (!this.newAdmin.username || !this.newAdmin.password) {
                this.showMessage('请输入管理员账号和密码', 'error');
                return;
            }

            // 前端验证
            if (this.newAdmin.username.length < 3) {
                this.showMessage('管理员账号长度必须至少3个字符', 'error');
                return;
            }
            
            if (this.newAdmin.username.length > 50) {
                this.showMessage('管理员账号长度不能超过50个字符', 'error');
                return;
            }
            
            if (this.newAdmin.password.length < 6) {
                this.showMessage('密码长度必须至少6个字符', 'error');
                return;
            }

            try {
                const response = await fetch('http://localhost:3000/api/admin/add', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(this.newAdmin)
                });

                const result = await response.json();
                if (result.success) {
                    this.showMessage('管理员添加成功', 'success');
                    this.newAdmin = { username: '', password: '' };
                } else {
                    // 显示具体的后端错误信息
                    const errorMsg = result.error || result.message || '添加失败，请稍后重试';
                    this.showMessage(errorMsg, 'error');
                }
            } catch (error) {
                console.error('添加管理员失败:', error);
                this.showMessage('网络错误，请检查连接后重试', 'error');
            }
        },

        // 消息提示方法
        showMessage(message, type = 'info') {
            // 使用 alert 作为简单提示，但提供更详细的错误信息
            if (type === 'error') {
                alert('错误: ' + message);
            } else if (type === 'success') {
                alert('成功: ' + message);
            } else {
                alert('提示: ' + message);
            }
        },

        getStatusClass(status) {
            return {
                'pending': 'status-pending',
                'approved': 'status-approved',
                'rejected': 'status-rejected'
            }[status];
        },

        getStatusText(status) {
            const statusMap = {
                'pending': '待审核',
                'approved': '通过',
                'rejected': '拒绝'
            };
            return statusMap[status];
        },

        formatDate(dateString) {
            return new Date(dateString).toLocaleString();
        },

        logout() {
            localStorage.removeItem('admin');
            this.$router.push('/login');
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

.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
    min-height: 100vh;
    background: linear-gradient(135deg, var(--citrus-light) 0%, #FFECB3 100%);
}

.header {
    background: linear-gradient(135deg, var(--citrus-secondary) 0%, var(--citrus-dark) 100%);
    color: white;
    padding: 24px 30px;
    margin-bottom: 30px;
    border-radius: 16px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.header-title h1 {
    margin: 0;
    font-size: 28px;
    font-weight: 700;
}

.header-subtitle {
    margin: 5px 0 0;
    opacity: 0.9;
    font-size: 14px;
}

.tabs {
    display: flex;
    margin-bottom: 20px;
    border-radius: 12px;
    background: var(--citrus-white);
    padding: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.tab-btn {
    flex: 1;
    padding: 12px 20px;
    border: none;
    background: transparent;
    cursor: pointer;
    border-radius: 8px;
    font-weight: 500;
    transition: all 0.3s ease;
    color: var(--citrus-gray-600);
}

.tab-btn.active {
    background: var(--citrus-primary);
    color: white;
    box-shadow: 0 2px 8px rgba(255, 167, 38, 0.3);
    font-weight: 600;
}

.tab-btn:hover:not(.active) {
    background: rgba(255, 167, 38, 0.1);
    color: var(--citrus-primary);
}

.tab-content {
    margin-top: 20px;
}

.card {
    background: var(--citrus-white);
    border-radius: 16px;
    padding: 30px;
    box-shadow: 0 4px 20px rgba(141, 110, 99, 0.1);
    border: 1px solid var(--citrus-gray-200);
    margin-bottom: 20px;
}

.card-header {
    margin-bottom: 25px;
    text-align: center;
}

.card-header h2 {
    margin: 0 0 8px;
    color: var(--citrus-dark);
    font-size: 24px;
    font-weight: 600;
}

.card-description {
    color: var(--citrus-gray-600);
    margin: 0;
    font-size: 14px;
}

.citrus-table {
    width: 100%;
    border-collapse: collapse;
    background: white;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.citrus-table th {
    background: linear-gradient(135deg, var(--citrus-secondary) 0%, var(--citrus-dark) 100%);
    color: white;
    padding: 16px;
    text-align: left;
    font-weight: 600;
    font-size: 14px;
}

.citrus-table td {
    padding: 16px;
    border-bottom: 1px solid var(--citrus-gray-200);
    font-size: 14px;
}

.citrus-table tr:last-child td {
    border-bottom: none;
}

.citrus-table tr:hover {
    background-color: var(--citrus-light);
}

.weight-value {
    font-weight: 600;
    color: var(--citrus-dark);
}

.status-badge {
    padding: 6px 12px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.status-pending {
    background: #FFF3E0;
    color: var(--citrus-warning);
    border: 1px solid #FFE0B2;
}

.status-approved {
    background: #E8F5E8;
    color: var(--citrus-success);
    border: 1px solid #C8E6C9;
}

.status-rejected {
    background: #FFEBEE;
    color: var(--citrus-error);
    border: 1px solid #FFCDD2;
}

.submission-image {
    width: 50px;
    height: 50px;
    object-fit: cover;
    border-radius: 8px;
    border: 2px solid var(--citrus-gray-200);
    transition: all 0.3s ease;
}

.submission-image:hover {
    transform: scale(1.1);
    border-color: var(--citrus-primary);
}

.image-cell {
    display: flex;
    justify-content: center;
}

.no-image {
    color: var(--citrus-gray-500);
    font-style: italic;
}

.action-buttons {
    display: flex;
    gap: 8px;
}

.btn {
    padding: 10px 16px;
    border: none;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    display: inline-flex;
    align-items: center;
    justify-content: center;
}

.btn-sm {
    padding: 8px 12px;
    font-size: 12px;
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

.btn-danger {
    background: linear-gradient(135deg, var(--citrus-error) 0%, #EF5350 100%);
    color: white;
}

.btn-danger:hover {
    background: linear-gradient(135deg, #EF5350 0%, var(--citrus-error) 100%);
    box-shadow: 0 4px 15px rgba(229, 57, 53, 0.3);
    transform: translateY(-2px);
}

.empty-state {
    text-align: center;
    padding: 60px 20px;
    color: var(--citrus-gray-500);
}

.empty-icon {
    font-size: 48px;
    margin-bottom: 16px;
    opacity: 0.5;
}

.empty-text {
    font-size: 16px;
    margin-bottom: 8px;
    font-weight: 500;
}

.empty-subtext {
    font-size: 14px;
    opacity: 0.7;
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

.form-input {
    width: 100%;
    padding: 12px 16px;
    border: 2px solid var(--citrus-gray-300);
    border-radius: 8px;
    font-size: 14px;
    transition: all 0.3s ease;
    background: white;
}

.form-input:focus {
    outline: none;
    border-color: var(--citrus-primary);
    box-shadow: 0 0 0 3px rgba(255, 167, 38, 0.1);
}

.form-hint {
    color: var(--citrus-gray-500);
    font-size: 12px;
    margin-top: 4px;
    display: block;
}

.table-container {
    overflow-x: auto;
}

@media (max-width: 768px) {
    .container {
        padding: 15px;
    }
    
    .header-content {
        flex-direction: column;
        gap: 15px;
        text-align: center;
    }
    
    .tabs {
        flex-direction: column;
    }
    
    .tab-btn {
        margin-bottom: 8px;
    }
    
    .card {
        padding: 20px;
    }
    
    .citrus-table {
        font-size: 12px;
    }
    
    .citrus-table th,
    .citrus-table td {
        padding: 12px 8px;
    }
    
    .action-buttons {
        flex-direction: column;
        gap: 5px;
    }
}
</style>