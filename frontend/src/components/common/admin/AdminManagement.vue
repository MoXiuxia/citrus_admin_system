<template>
    <div class="admin-management">
        <div class="page-header">
            <h2>管理员管理</h2>
            <button class="btn btn-primary" @click="showAddModal = true">
                <span class="btn-icon">➕</span>
                添加管理员
            </button>
        </div>

        <!-- 管理员列表 -->
        <div class="admins-list">
            <div class="card">
                <div class="card-header">
                    <h3>管理员账户列表</h3>
                    <div class="search-box">
                        <input 
                            type="text" 
                            v-model="searchTerm"
                            placeholder="搜索管理员..."
                            class="search-input"
                        >
                        <span class="search-icon">🔍</span>
                    </div>
                </div>
                <div class="table-container">
                    <table class="admins-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>用户名</th>
                                <th>创建时间</th>
                                <th>最后更新</th>
                                <th>状态</th>
                                <th>操作</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="admin in filteredAdmins" :key="admin.id">
                                <td class="id-cell">#{{ admin.id }}</td>
                                <td class="username-cell">
                                    <div class="user-info">
                                        <span class="avatar">{{ admin.username.charAt(0).toUpperCase() }}</span>
                                        <div class="user-details">
                                            <span class="name">{{ admin.username }}</span>
                                            <span class="role">管理员</span>
                                        </div>
                                    </div>
                                </td>
                                <td class="date-cell">{{ formatDate(admin.createdAt) }}</td>
                                <td class="date-cell">{{ formatDate(admin.updatedAt) }}</td>
                                <td class="status-cell">
                                    <span class="status-badge" :class="admin.status">
                                        {{ admin.status === 'active' ? '活跃' : '禁用' }}
                                    </span>
                                </td>
                                <td class="actions-cell">
                                    <div class="action-buttons">
                                        <button 
                                            class="btn btn-sm btn-outline"
                                            @click="editAdmin(admin)"
                                            title="编辑"
                                        >
                                            <span class="btn-icon">✏️</span>
                                        </button>
                                        <button 
                                            v-if="admin.id !== 1"
                                            class="btn btn-sm btn-outline"
                                            @click="resetPassword(admin)"
                                            title="重置密码"
                                        >
                                            <span class="btn-icon">🔑</span>
                                        </button>
                                        <button 
                                            v-if="admin.id !== 1"
                                            class="btn btn-sm btn-danger"
                                            @click="deleteAdmin(admin)"
                                            title="删除"
                                        >
                                            <span class="btn-icon">🗑️</span>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <!-- 空状态 -->
                <div class="empty-state" v-if="filteredAdmins.length === 0">
                    <div class="empty-icon">👥</div>
                    <h3>暂无管理员账户</h3>
                    <p>点击上方按钮添加新的管理员</p>
                </div>
            </div>
        </div>

        <!-- 添加管理员模态框 -->
        <AppModal 
            v-model:show="showAddModal"
            title="添加管理员"
            icon="➕"
            @confirm="addAdmin"
            :confirm-disabled="!newAdmin.username || !newAdmin.password"
        >
            <template #content>
                <div class="admin-form">
                    <div class="form-group">
                        <label>用户名:</label>
                        <input 
                            type="text" 
                            v-model="newAdmin.username"
                            placeholder="请输入管理员用户名"
                            class="form-input"
                        >
                    </div>
                    <div class="form-group">
                        <label>密码:</label>
                        <input 
                            type="password" 
                            v-model="newAdmin.password"
                            placeholder="请输入密码"
                            class="form-input"
                        >
                    </div>
                    <div class="form-group">
                        <label>确认密码:</label>
                        <input 
                            type="password" 
                            v-model="newAdmin.confirmPassword"
                            placeholder="请再次输入密码"
                            class="form-input"
                            :class="{ 'error': !passwordMatch }"
                        >
                        <div class="form-hint" v-if="!passwordMatch && newAdmin.confirmPassword">
                            密码不匹配
                        </div>
                    </div>
                </div>
            </template>
        </AppModal>

        <!-- 编辑管理员模态框 -->
        <AppModal 
            v-model:show="showEditModal"
            title="编辑管理员"
            icon="✏️"
            @confirm="updateAdmin"
        >
            <template #content>
                <div class="admin-form">
                    <div class="form-group">
                        <label>用户名:</label>
                        <input 
                            type="text" 
                            v-model="editingAdmin.username"
                            :disabled="editingAdmin.id === 1"
                            class="form-input"
                        >
                        <div class="form-hint" v-if="editingAdmin.id === 1">
                            默认管理员用户名不可修改
                        </div>
                    </div>
                    <div class="form-group">
                        <label>新密码:</label>
                        <input 
                            type="password" 
                            v-model="editingAdmin.newPassword"
                            placeholder="留空表示不修改密码"
                            class="form-input"
                        >
                    </div>
                    <div class="form-group">
                        <label>确认新密码:</label>
                        <input 
                            type="password" 
                            v-model="editingAdmin.confirmNewPassword"
                            placeholder="请再次输入新密码"
                            class="form-input"
                            :class="{ 'error': !editPasswordMatch }"
                        >
                        <div class="form-hint" v-if="!editPasswordMatch && editingAdmin.confirmNewPassword">
                            密码不匹配
                        </div>
                    </div>
                    <div class="form-group" v-if="editingAdmin.id !== 1">
                        <label>状态:</label>
                        <select v-model="editingAdmin.status" class="form-select">
                            <option value="active">活跃</option>
                            <option value="inactive">禁用</option>
                        </select>
                    </div>
                </div>
            </template>
        </AppModal>

        <!-- 重置密码模态框 -->
        <AppModal 
            v-model:show="showResetModal"
            title="重置密码"
            icon="🔑"
            @confirm="confirmResetPassword"
            :confirm-disabled="!resetPasswordData.newPassword"
        >
            <template #content>
                <div class="reset-form">
                    <div class="form-group">
                        <label>新密码:</label>
                        <input 
                            type="password" 
                            v-model="resetPasswordData.newPassword"
                            placeholder="请输入新密码"
                            class="form-input"
                        >
                    </div>
                    <div class="form-group">
                        <label>确认新密码:</label>
                        <input 
                            type="password" 
                            v-model="resetPasswordData.confirmPassword"
                            placeholder="请再次输入新密码"
                            class="form-input"
                            :class="{ 'error': !resetPasswordMatch }"
                        >
                        <div class="form-hint" v-if="!resetPasswordMatch && resetPasswordData.confirmPassword">
                            密码不匹配
                        </div>
                    </div>
                </div>
            </template>
        </AppModal>

        <!-- 操作统计 -->
        <div class="admin-stats">
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-icon">👥</div>
                    <div class="stat-content">
                        <div class="stat-value">{{ totalAdmins }}</div>
                        <div class="stat-label">总管理员数</div>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">✅</div>
                    <div class="stat-content">
                        <div class="stat-value">{{ activeAdmins }}</div>
                        <div class="stat-label">活跃管理员</div>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">📅</div>
                    <div class="stat-content">
                        <div class="stat-value">{{ recentAdmins }}</div>
                        <div class="stat-label">最近添加</div>
                    </div>
                </div>
            </div>
        </div>

        <!-- 加载状态 -->
        <div class="loading-overlay" v-if="loading">
            <div class="loading-spinner">
                <div class="spinner"></div>
                <p>加载中...</p>
            </div>
        </div>
    </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import AppModal from '../common/Modal.vue'

export default {
    name: 'AdminManagement',
    components: {
        AppModal
    },
    setup() {
        // 响应式数据
        const admins = ref([])
        const loading = ref(false)
        const searchTerm = ref('')
        const showAddModal = ref(false)
        const showEditModal = ref(false)
        const showResetModal = ref(false)

        const newAdmin = ref({
            username: '',
            password: '',
            confirmPassword: ''
        })

        const editingAdmin = ref({
            id: null,
            username: '',
            newPassword: '',
            confirmNewPassword: '',
            status: 'active'
        })

        const resetPasswordData = ref({
            adminId: null,
            newPassword: '',
            confirmPassword: ''
        })

        // 计算属性
        const filteredAdmins = computed(() => {
            if (!searchTerm.value) return admins.value
            
            return admins.value.filter(admin => 
                admin.username.toLowerCase().includes(searchTerm.value.toLowerCase())
            )
        })

        const passwordMatch = computed(() => {
            return newAdmin.value.password === newAdmin.value.confirmPassword
        })

        const editPasswordMatch = computed(() => {
            return editingAdmin.value.newPassword === editingAdmin.value.confirmNewPassword
        })

        const resetPasswordMatch = computed(() => {
            return resetPasswordData.value.newPassword === resetPasswordData.value.confirmPassword
        })

        const totalAdmins = computed(() => admins.value.length)
        const activeAdmins = computed(() => admins.value.filter(a => a.status === 'active').length)
        const recentAdmins = computed(() => {
            const oneMonthAgo = new Date()
            oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)
            return admins.value.filter(a => new Date(a.createdAt) > oneMonthAgo).length
        })

        // 方法
        const loadAdmins = async () => {
            loading.value = true
            try {
                // 模拟API调用
                await new Promise(resolve => setTimeout(resolve, 1000))
                
                // 模拟数据
                admins.value = [
                    {
                        id: 1,
                        username: 'admin',
                        createdAt: new Date('2024-01-01'),
                        updatedAt: new Date('2024-01-15'),
                        status: 'active'
                    },
                    {
                        id: 2,
                        username: 'manager1',
                        createdAt: new Date('2024-01-10'),
                        updatedAt: new Date('2024-01-12'),
                        status: 'active'
                    },
                    {
                        id: 3,
                        username: 'manager2',
                        createdAt: new Date('2024-01-05'),
                        updatedAt: new Date('2024-01-08'),
                        status: 'inactive'
                    }
                ]
            } catch (error) {
                console.error('加载管理员数据失败:', error)
            } finally {
                loading.value = false
            }
        }

        const addAdmin = async () => {
            if (!passwordMatch.value) {
                alert('密码不匹配')
                return
            }

            try {
                // 模拟API调用
                await new Promise(resolve => setTimeout(resolve, 500))
                
                const newAdminObj = {
                    id: Math.max(...admins.value.map(a => a.id)) + 1,
                    username: newAdmin.value.username,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    status: 'active'
                }
                
                admins.value.push(newAdminObj)
                showAddModal.value = false
                resetNewAdminForm()
            } catch (error) {
                console.error('添加管理员失败:', error)
            }
        }

        const editAdmin = (admin) => {
            editingAdmin.value = { ...admin, newPassword: '', confirmNewPassword: '' }
            showEditModal.value = true
        }

        const updateAdmin = async () => {
            if (editingAdmin.value.newPassword && !editPasswordMatch.value) {
                alert('新密码不匹配')
                return
            }

            try {
                // 模拟API调用
                await new Promise(resolve => setTimeout(resolve, 500))
                
                const index = admins.value.findIndex(a => a.id === editingAdmin.value.id)
                if (index !== -1) {
                    admins.value[index] = {
                        ...admins.value[index],
                        username: editingAdmin.value.username,
                        status: editingAdmin.value.status,
                        updatedAt: new Date()
                    }
                }
                
                showEditModal.value = false
            } catch (error) {
                console.error('更新管理员失败:', error)
            }
        }

        const resetPassword = (admin) => {
            resetPasswordData.value = {
                adminId: admin.id,
                newPassword: '',
                confirmPassword: ''
            }
            showResetModal.value = true
        }

        const confirmResetPassword = async () => {
            if (!resetPasswordMatch.value) {
                alert('密码不匹配')
                return
            }

            try {
                // 模拟API调用
                await new Promise(resolve => setTimeout(resolve, 500))
                
                const admin = admins.value.find(a => a.id === resetPasswordData.value.adminId)
                if (admin) {
                    admin.updatedAt = new Date()
                }
                
                showResetModal.value = false
                resetPasswordData.value = {
                    adminId: null,
                    newPassword: '',
                    confirmPassword: ''
                }
            } catch (error) {
                console.error('重置密码失败:', error)
            }
        }

        const deleteAdmin = (admin) => {
            if (admin.id === 1) {
                alert('不能删除默认管理员账户')
                return
            }

            if (confirm(`确定要删除管理员 "${admin.username}" 吗？此操作不可恢复。`)) {
                admins.value = admins.value.filter(a => a.id !== admin.id)
            }
        }

        const resetNewAdminForm = () => {
            newAdmin.value = {
                username: '',
                password: '',
                confirmPassword: ''
            }
        }

        const formatDate = (date) => {
            return new Date(date).toLocaleDateString('zh-CN')
        }

        // 生命周期
        onMounted(() => {
            loadAdmins()
        })

        return {
            admins,
            loading,
            searchTerm,
            showAddModal,
            showEditModal,
            showResetModal,
            newAdmin,
            editingAdmin,
            resetPasswordData,
            filteredAdmins,
            passwordMatch,
            editPasswordMatch,
            resetPasswordMatch,
            totalAdmins,
            activeAdmins,
            recentAdmins,
            loadAdmins,
            addAdmin,
            editAdmin,
            updateAdmin,
            resetPassword,
            confirmResetPassword,
            deleteAdmin,
            formatDate
        }
    }
}
</script>

<style scoped>
.admin-management {
    padding: 20px;
}

.page-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 24px;
}

.page-header h2 {
    margin: 0;
    color: #333;
    font-size: 24px;
}

.btn {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 16px;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    transition: all 0.3s ease;
}

.btn-primary {
    background: #007bff;
    color: white;
}

.btn-primary:hover {
    background: #0056b3;
}

.btn-danger {
    background: #dc3545;
    color: white;
}

.btn-danger:hover {
    background: #c82333;
}

.btn-outline {
    background: transparent;
    border: 1px solid #dee2e6;
    color: #6c757d;
}

.btn-outline:hover {
    background: #f8f9fa;
    border-color: #adb5bd;
}

.btn-sm {
    padding: 6px 10px;
    font-size: 12px;
}

.btn-icon {
    font-size: 12px;
}

.admins-list {
    margin-bottom: 24px;
}

.card {
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    overflow: hidden;
}

.card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px 24px;
    border-bottom: 1px solid #e9ecef;
}

.card-header h3 {
    margin: 0;
    font-size: 18px;
    color: #333;
}

.search-box {
    position: relative;
}

.search-input {
    padding: 8px 12px 8px 36px;
    border: 1px solid #dee2e6;
    border-radius: 6px;
    font-size: 14px;
    width: 250px;
}

.search-icon {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    color: #6c757d;
}

.table-container {
    overflow-x: auto;
}

.admins-table {
    width: 100%;
    border-collapse: collapse;
}

.admins-table th,
.admins-table td {
    padding: 16px;
    text-align: left;
    border-bottom: 1px solid #e9ecef;
}

.admins-table th {
    background: #f8f9fa;
    font-weight: 600;
    color: #333;
}

.id-cell {
    font-weight: 600;
    color: #6c757d;
}

.user-info {
    display: flex;
    align-items: center;
    gap: 12px;
}

.avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: #007bff;
    color: white;
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

.name {
    font-weight: 500;
    color: #333;
}

.role {
    font-size: 12px;
    color: #6c757d;
}

.date-cell {
    color: #6c757d;
    font-size: 14px;
}

.status-badge {
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 500;
}

.status-badge.active {
    background: #d4edda;
    color: #155724;
}

.status-badge.inactive {
    background: #f8d7da;
    color: #721c24;
}

.actions-cell {
    width: 1%;
    white-space: nowrap;
}

.action-buttons {
    display: flex;
    gap: 4px;
}

.empty-state {
    text-align: center;
    padding: 60px 20px;
    color: #6c757d;
}

.empty-icon {
    font-size: 64px;
    margin-bottom: 16px;
    display: block;
}

.empty-state h3 {
    margin: 0 0 8px 0;
    color: #333;
}

.admin-form,
.reset-form {
    padding: 20px 0;
}

.form-group {
    margin-bottom: 20px;
}

.form-group label {
    display: block;
    margin-bottom: 8px;
    font-weight: 500;
    color: #333;
}

.form-input,
.form-select {
    width: 100%;
    padding: 10px 12px;
    border: 1px solid #dee2e6;
    border-radius: 6px;
    font-size: 14px;
}

.form-input:disabled {
    background: #f8f9fa;
    color: #6c757d;
}

.form-input.error {
    border-color: #dc3545;
}

.form-hint {
    font-size: 12px;
    color: #dc3545;
    margin-top: 4px;
}

.admin-stats {
    margin-top: 24px;
}

.stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 16px;
}

.stat-card {
    background: white;
    border-radius: 8px;
    padding: 20px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    display: flex;
    align-items: center;
    gap: 16px;
}

.stat-icon {
    font-size: 32px;
    width: 60px;
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f8f9fa;
    border-radius: 8px;
}

.stat-content {
    flex: 1;
}

.stat-value {
    font-size: 24px;
    font-weight: 600;
    color: #333;
    margin-bottom: 4px;
}

.stat-label {
    font-size: 14px;
    color: #6c757d;
}

.loading-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(255,255,255,0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
}

.loading-spinner {
    text-align: center;
}

.spinner {
    width: 40px;
    height: 40px;
    border: 4px solid #f3f3f3;
    border-top: 4px solid #007bff;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto 16px;
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

@media (max-width: 768px) {
    .admin-management {
        padding: 16px;
    }
    
    .page-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 16px;
    }
    
    .card-header {
        flex-direction: column;
        align-items: stretch;
        gap: 16px;
    }
    
    .search-input {
        width: 100%;
    }
    
    .admins-table {
        font-size: 12px;
    }
    
    .admins-table th,
    .admins-table td {
        padding: 12px 8px;
    }
    
    .user-info {
        flex-direction: column;
        align-items: flex-start;
        gap: 8px;
    }
    
    .action-buttons {
        flex-direction: column;
    }
    
    .stats-grid {
        grid-template-columns: 1fr;
    }
}
</style>