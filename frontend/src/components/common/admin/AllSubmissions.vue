<template>
    <div class="all-submissions">
        <div class="page-header">
            <h2>所有提交记录</h2>
            <div class="header-actions">
                <button class="btn btn-primary" @click="exportData">
                    <span class="btn-icon">📊</span>
                    导出数据
                </button>
                <button class="btn btn-success" @click="refreshData">
                    <span class="btn-icon">🔄</span>
                    刷新
                </button>
            </div>
        </div>

        <!-- 统计信息 -->
        <div class="stats-overview">
            <div class="stat-item">
                <div class="stat-value">{{ totalSubmissions }}</div>
                <div class="stat-label">总提交数</div>
            </div>
            <div class="stat-item">
                <div class="stat-value">{{ approvedSubmissions }}</div>
                <div class="stat-label">已通过</div>
            </div>
            <div class="stat-item">
                <div class="stat-value">{{ pendingSubmissions }}</div>
                <div class="stat-label">待审核</div>
            </div>
            <div class="stat-item">
                <div class="stat-value">{{ rejectedSubmissions }}</div>
                <div class="stat-label">已拒绝</div>
            </div>
        </div>

        <!-- 筛选和搜索 -->
        <div class="filters-section">
            <div class="filter-row">
                <div class="filter-group">
                    <label>状态筛选:</label>
                    <select v-model="filters.status" class="filter-select">
                        <option value="">全部状态</option>
                        <option value="pending">待审核</option>
                        <option value="approved">已通过</option>
                        <option value="rejected">已拒绝</option>
                    </select>
                </div>
                <div class="filter-group">
                    <label>年份筛选:</label>
                    <select v-model="filters.year" class="filter-select">
                        <option value="">全部年份</option>
                        <option value="0-10">0-10年</option>
                        <option value="10-20">10-20年</option>
                        <option value="20-30">20-30年</option>
                        <option value="30+">30年以上</option>
                    </select>
                </div>
                <div class="filter-group">
                    <label>时间范围:</label>
                    <select v-model="filters.dateRange" class="filter-select">
                        <option value="">全部时间</option>
                        <option value="today">今天</option>
                        <option value="week">本周</option>
                        <option value="month">本月</option>
                        <option value="quarter">本季度</option>
                    </select>
                </div>
            </div>
            <div class="filter-row">
                <div class="search-group">
                    <input 
                        type="text" 
                        v-model="filters.search"
                        placeholder="搜索用户名或ID..."
                        class="search-input"
                    >
                    <span class="search-icon">🔍</span>
                </div>
                <div class="filter-actions">
                    <button class="btn btn-outline" @click="resetFilters">
                        重置
                    </button>
                    <button class="btn btn-primary" @click="applyFilters">
                        应用筛选
                    </button>
                </div>
            </div>
        </div>

        <!-- 数据表格 -->
        <div class="table-section">
            <div class="card">
                <div class="table-container">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>用户</th>
                                <th>图片</th>
                                <th>AI识别</th>
                                <th>用户选择</th>
                                <th>重量(克)</th>
                                <th>状态</th>
                                <th>提交时间</th>
                                <th>审核时间</th>
                                <th>操作</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="submission in paginatedSubmissions" :key="submission.id">
                                <td class="id-cell">#{{ submission.id }}</td>
                                <td class="user-cell">
                                    <span class="username">{{ submission.username }}</span>
                                </td>
                                <td class="image-cell">
                                    <div 
                                        class="image-thumbnail"
                                        @click="showImage(submission.imageUrl)"
                                        :class="{ 'no-image': !submission.imageUrl }"
                                    >
                                        <img 
                                            v-if="submission.imageUrl" 
                                            :src="submission.imageUrl" 
                                            :alt="'Submission ' + submission.id"
                                        >
                                        <span v-else class="no-image-text">无图片</span>
                                    </div>
                                </td>
                                <td class="ai-cell">
                                    <span class="year-badge">{{ submission.aiYearResult }}年</span>
                                </td>
                                <td class="manual-cell">
                                    <span class="year-badge">{{ submission.manualYearSelection }}年</span>
                                </td>
                                <td class="weight-cell">
                                    <strong>{{ submission.weight }}</strong>
                                </td>
                                <td class="status-cell">
                                    <span class="status-badge" :class="submission.status">
                                        {{ getStatusText(submission.status) }}
                                    </span>
                                </td>
                                <td class="date-cell">
                                    {{ formatDate(submission.submittedAt) }}
                                </td>
                                <td class="date-cell">
                                    {{ submission.reviewedAt ? formatDate(submission.reviewedAt) : '-' }}
                                </td>
                                <td class="actions-cell">
                                    <div class="action-buttons">
                                        <button 
                                            class="btn btn-sm btn-outline"
                                            @click="viewDetails(submission)"
                                            title="查看详情"
                                        >
                                            <span class="btn-icon">👁️</span>
                                        </button>
                                        <button 
                                            v-if="submission.status === 'pending'"
                                            class="btn btn-sm btn-success"
                                            @click="approveSubmission(submission.id)"
                                            title="通过"
                                        >
                                            <span class="btn-icon">✅</span>
                                        </button>
                                        <button 
                                            v-if="submission.status === 'pending'"
                                            class="btn btn-sm btn-danger"
                                            @click="rejectSubmission(submission.id)"
                                            title="拒绝"
                                        >
                                            <span class="btn-icon">❌</span>
                                        </button>
                                        <button 
                                            class="btn btn-sm btn-outline"
                                            @click="deleteSubmission(submission.id)"
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
                <div class="empty-state" v-if="filteredSubmissions.length === 0">
                    <div class="empty-icon">📭</div>
                    <h3>暂无提交记录</h3>
                    <p>没有找到匹配的提交记录</p>
                </div>
            </div>
        </div>

        <!-- 分页 -->
        <div class="pagination" v-if="filteredSubmissions.length > 0">
            <div class="pagination-info">
                显示 {{ startIndex }}-{{ endIndex }} 条，共 {{ filteredSubmissions.length }} 条记录
            </div>
            <div class="pagination-controls">
                <button 
                    class="pagination-btn"
                    :disabled="currentPage === 1"
                    @click="prevPage"
                >
                    上一页
                </button>
                <div class="page-numbers">
                    <button
                        v-for="page in visiblePages"
                        :key="page"
                        :class="['page-btn', { active: page === currentPage }]"
                        @click="goToPage(page)"
                    >
                        {{ page }}
                    </button>
                </div>
                <button 
                    class="pagination-btn"
                    :disabled="currentPage === totalPages"
                    @click="nextPage"
                >
                    下一页
                </button>
            </div>
            <div class="page-size-selector">
                <label>每页显示:</label>
                <select v-model="pageSize" class="page-size-select">
                    <option value="10">10条</option>
                    <option value="20">20条</option>
                    <option value="50">50条</option>
                </select>
            </div>
        </div>

        <!-- 详情模态框 -->
        <AppModal 
            v-model:show="showDetailModal"
            title="提交详情"
            size="large"
        >
            <template #content>
                <div class="submission-details" v-if="selectedSubmission">
                    <div class="detail-grid">
                        <div class="detail-column">
                            <div class="detail-section">
                                <h4>基本信息</h4>
                                <div class="detail-item">
                                    <label>提交ID:</label>
                                    <span>#{{ selectedSubmission.id }}</span>
                                </div>
                                <div class="detail-item">
                                    <label>用户名:</label>
                                    <span>{{ selectedSubmission.username }}</span>
                                </div>
                                <div class="detail-item">
                                    <label>提交时间:</label>
                                    <span>{{ formatDate(selectedSubmission.submittedAt) }}</span>
                                </div>
                                <div class="detail-item">
                                    <label>当前状态:</label>
                                    <span :class="['status-text', selectedSubmission.status]">
                                        {{ getStatusText(selectedSubmission.status) }}
                                    </span>
                                </div>
                            </div>
                            
                            <div class="detail-section">
                                <h4>年份信息</h4>
                                <div class="detail-item">
                                    <label>AI识别结果:</label>
                                    <span class="year-result">{{ selectedSubmission.aiYearResult }}年</span>
                                </div>
                                <div class="detail-item">
                                    <label>用户选择:</label>
                                    <span class="year-result">{{ selectedSubmission.manualYearSelection }}年</span>
                                </div>
                                <div class="detail-item">
                                    <label>匹配状态:</label>
                                    <span :class="['match-status', getMatchStatusClass(selectedSubmission)]">
                                        {{ getMatchStatusText(selectedSubmission) }}
                                    </span>
                                </div>
                            </div>
                        </div>
                        
                        <div class="detail-column">
                            <div class="detail-section">
                                <h4>重量信息</h4>
                                <div class="detail-item">
                                    <label>陈皮重量:</label>
                                    <span class="weight-value">{{ selectedSubmission.weight }}克</span>
                                </div>
                            </div>
                            
                            <div class="detail-section" v-if="selectedSubmission.reviewedAt">
                                <h4>审核信息</h4>
                                <div class="detail-item">
                                    <label>审核时间:</label>
                                    <span>{{ formatDate(selectedSubmission.reviewedAt) }}</span>
                                </div>
                                <div class="detail-item">
                                    <label>审核结果:</label>
                                    <span :class="['status-text', selectedSubmission.status]">
                                        {{ getStatusText(selectedSubmission.status) }}
                                    </span>
                                </div>
                            </div>
                            
                            <div class="detail-section">
                                <h4>图片信息</h4>
                                <div class="image-preview-large">
                                    <img 
                                        v-if="selectedSubmission.imageUrl" 
                                        :src="selectedSubmission.imageUrl" 
                                        alt="陈皮图片"
                                        class="detail-image"
                                        @click="showImage(selectedSubmission.imageUrl)"
                                    >
                                    <div v-else class="no-image-large">
                                        <span class="no-image-icon">🖼️</span>
                                        <p>无上传图片</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </template>
        </AppModal>

        <!-- 图片查看模态框 -->
        <AppModal 
            v-model:show="showImageModal"
            title="陈皮图片"
            size="medium"
        >
            <template #content>
                <div class="image-modal-content">
                    <img 
                        v-if="selectedImage" 
                        :src="selectedImage" 
                        alt="陈皮图片"
                        class="modal-image"
                    >
                </div>
            </template>
        </AppModal>

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
import { ref, computed, onMounted, watch } from 'vue'
import AppModal from '../common/Modal.vue'

export default {
    name: 'AllSubmissions',
    components: {
        AppModal
    },
    setup() {
        // 响应式数据
        const submissions = ref([])
        const loading = ref(false)
        const showDetailModal = ref(false)
        const showImageModal = ref(false)
        const selectedSubmission = ref(null)
        const selectedImage = ref('')
        const currentPage = ref(1)
        const pageSize = ref(10)

        const filters = ref({
            status: '',
            year: '',
            dateRange: '',
            search: ''
        })

        // 计算属性
        const filteredSubmissions = computed(() => {
            let filtered = [...submissions.value]

            // 状态筛选
            if (filters.value.status) {
                filtered = filtered.filter(s => s.status === filters.value.status)
            }

            // 年份筛选
            if (filters.value.year) {
                filtered = filtered.filter(s => s.manualYearSelection === filters.value.year)
            }

            // 时间范围筛选
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

                filtered = filtered.filter(s => new Date(s.submittedAt) >= startDate)
            }

            // 搜索筛选
            if (filters.value.search) {
                const searchTerm = filters.value.search.toLowerCase()
                filtered = filtered.filter(s => 
                    s.username.toLowerCase().includes(searchTerm) ||
                    s.id.toString().includes(searchTerm)
                )
            }

            return filtered
        })

        const paginatedSubmissions = computed(() => {
            const start = (currentPage.value - 1) * pageSize.value
            const end = start + pageSize.value
            return filteredSubmissions.value.slice(start, end)
        })

        const totalSubmissions = computed(() => submissions.value.length)
        const approvedSubmissions = computed(() => submissions.value.filter(s => s.status === 'approved').length)
        const pendingSubmissions = computed(() => submissions.value.filter(s => s.status === 'pending').length)
        const rejectedSubmissions = computed(() => submissions.value.filter(s => s.status === 'rejected').length)

        const totalPages = computed(() => Math.ceil(filteredSubmissions.value.length / pageSize.value))
        const startIndex = computed(() => (currentPage.value - 1) * pageSize.value + 1)
        const endIndex = computed(() => Math.min(currentPage.value * pageSize.value, filteredSubmissions.value.length))

        const visiblePages = computed(() => {
            const pages = []
            const maxVisible = 5
            let start = Math.max(1, currentPage.value - Math.floor(maxVisible / 2))
            let end = Math.min(totalPages.value, start + maxVisible - 1)
            
            if (end - start + 1 < maxVisible) {
                start = Math.max(1, end - maxVisible + 1)
            }
            
            for (let i = start; i <= end; i++) {
                pages.push(i)
            }
            
            return pages
        })

        // 方法
        const loadSubmissions = async () => {
            loading.value = true
            try {
                // 模拟API调用
                await new Promise(resolve => setTimeout(resolve, 2000))
                
                // 模拟数据
                submissions.value = [
                    {
                        id: 1,
                        username: 'user1',
                        imageUrl: '/api/placeholder/200',
                        aiYearResult: '10-20',
                        manualYearSelection: '10-20',
                        weight: 150.5,
                        status: 'approved',
                        submittedAt: new Date('2024-01-15T10:30:00'),
                        reviewedAt: new Date('2024-01-15T11:00:00')
                    },
                    {
                        id: 2,
                        username: 'user2',
                        imageUrl: '/api/placeholder/200',
                        aiYearResult: '20-30',
                        manualYearSelection: '10-20',
                        weight: 200.0,
                        status: 'pending',
                        submittedAt: new Date('2024-01-14T14:20:00'),
                        reviewedAt: null
                    },
                    {
                        id: 3,
                        username: 'user3',
                        imageUrl: null,
                        aiYearResult: '0-10',
                        manualYearSelection: '0-10',
                        weight: 100.0,
                        status: 'approved',
                        submittedAt: new Date('2024-01-13T09:15:00'),
                        reviewedAt: new Date('2024-01-13T10:00:00')
                    },
                    {
                        id: 4,
                        username: 'user4',
                        imageUrl: '/api/placeholder/200',
                        aiYearResult: '30+',
                        manualYearSelection: '20-30',
                        weight: 180.0,
                        status: 'rejected',
                        submittedAt: new Date('2024-01-12T16:45:00'),
                        reviewedAt: new Date('2024-01-12T17:30:00')
                    }
                ]
            } catch (error) {
                console.error('加载提交数据失败:', error)
            } finally {
                loading.value = false
            }
        }

        const applyFilters = () => {
            currentPage.value = 1
        }

        const resetFilters = () => {
            filters.value = {
                status: '',
                year: '',
                dateRange: '',
                search: ''
            }
            currentPage.value = 1
        }

        const refreshData = () => {
            loadSubmissions()
        }

        const exportData = () => {
            // 导出数据逻辑
            console.log('导出提交数据')
        }

        const viewDetails = (submission) => {
            selectedSubmission.value = submission
            showDetailModal.value = true
        }

        const showImage = (imageUrl) => {
            if (imageUrl) {
                selectedImage.value = imageUrl
                showImageModal.value = true
            }
        }

        const approveSubmission = async (submissionId) => {
            try {
                // 模拟API调用
                await new Promise(resolve => setTimeout(resolve, 500))
                
                const submission = submissions.value.find(s => s.id === submissionId)
                if (submission) {
                    submission.status = 'approved'
                    submission.reviewedAt = new Date()
                }
            } catch (error) {
                console.error('通过提交失败:', error)
            }
        }

        const rejectSubmission = async (submissionId) => {
            try {
                // 模拟API调用
                await new Promise(resolve => setTimeout(resolve, 500))
                
                const submission = submissions.value.find(s => s.id === submissionId)
                if (submission) {
                    submission.status = 'rejected'
                    submission.reviewedAt = new Date()
                }
            } catch (error) {
                console.error('拒绝提交失败:', error)
            }
        }

        const deleteSubmission = async (submissionId) => {
            if (confirm('确定要删除这条提交记录吗？此操作不可恢复。')) {
                try {
                    // 模拟API调用
                    await new Promise(resolve => setTimeout(resolve, 500))
                    
                    submissions.value = submissions.value.filter(s => s.id !== submissionId)
                } catch (error) {
                    console.error('删除提交失败:', error)
                }
            }
        }

        const getStatusText = (status) => {
            const statusMap = {
                pending: '待审核',
                approved: '已通过',
                rejected: '已拒绝'
            }
            return statusMap[status] || status
        }

        const getMatchStatusClass = (submission) => {
            return submission.aiYearResult === submission.manualYearSelection ? 'match' : 'mismatch'
        }

        const getMatchStatusText = (submission) => {
            return submission.aiYearResult === submission.manualYearSelection ? '匹配' : '不匹配'
        }

        const formatDate = (date) => {
            return new Date(date).toLocaleString('zh-CN')
        }

        const prevPage = () => {
            if (currentPage.value > 1) {
                currentPage.value--
            }
        }

        const nextPage = () => {
            if (currentPage.value < totalPages.value) {
                currentPage.value++
            }
        }

        const goToPage = (page) => {
            currentPage.value = page
        }

        // 监听器
        watch(pageSize, () => {
            currentPage.value = 1
        })

        // 生命周期
        onMounted(() => {
            loadSubmissions()
        })

        return {
            submissions,
            loading,
            showDetailModal,
            showImageModal,
            selectedSubmission,
            selectedImage,
            currentPage,
            pageSize,
            filters,
            filteredSubmissions,
            paginatedSubmissions,
            totalSubmissions,
            approvedSubmissions,
            pendingSubmissions,
            rejectedSubmissions,
            totalPages,
            startIndex,
            endIndex,
            visiblePages,
            loadSubmissions,
            applyFilters,
            resetFilters,
            refreshData,
            exportData,
            viewDetails,
            showImage,
            approveSubmission,
            rejectSubmission,
            deleteSubmission,
            getStatusText,
            getMatchStatusClass,
            getMatchStatusText,
            formatDate,
            prevPage,
            nextPage,
            goToPage
        }
    }
}
</script>

<style scoped>
.all-submissions {
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

.header-actions {
    display: flex;
    gap: 12px;
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

.btn-success {
    background: #28a745;
    color: white;
}

.btn-success:hover {
    background: #1e7e34;
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

.stats-overview {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
    margin-bottom: 24px;
}

.stat-item {
    background: white;
    border-radius: 8px;
    padding: 20px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    text-align: center;
}

.stat-value {
    font-size: 32px;
    font-weight: 600;
    color: #007bff;
    margin-bottom: 8px;
}

.stat-label {
    font-size: 14px;
    color: #6c757d;
}

.filters-section {
    background: white;
    border-radius: 8px;
    padding: 20px;
    margin-bottom: 24px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.filter-row {
    display: flex;
    gap: 20px;
    align-items: end;
    margin-bottom: 16px;
}

.filter-row:last-child {
    margin-bottom: 0;
}

.filter-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.filter-group label {
    font-size: 14px;
    font-weight: 500;
    color: #333;
}

.filter-select {
    padding: 8px 12px;
    border: 1px solid #dee2e6;
    border-radius: 6px;
    font-size: 14px;
    min-width: 150px;
}

.search-group {
    position: relative;
    flex: 1;
}

.search-input {
    padding: 8px 12px 8px 36px;
    border: 1px solid #dee2e6;
    border-radius: 6px;
    font-size: 14px;
    width: 100%;
}

.search-icon {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    color: #6c757d;
}

.filter-actions {
    display: flex;
    gap: 12px;
}

.table-section {
    margin-bottom: 24px;
}

.card {
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    overflow: hidden;
}

.table-container {
    overflow-x: auto;
}

.data-table {
    width: 100%;
    border-collapse: collapse;
}

.data-table th,
.data-table td {
    padding: 12px 16px;
    text-align: left;
    border-bottom: 1px solid #e9ecef;
    white-space: nowrap;
}

.data-table th {
    background: #f8f9fa;
    font-weight: 600;
    color: #333;
    position: sticky;
    top: 0;
}

.id-cell {
    font-weight: 600;
    color: #6c757d;
}

.user-cell .username {
    font-weight: 500;
    color: #333;
}

.image-thumbnail {
    width: 40px;
    height: 40px;
    border: 1px solid #e9ecef;
    border-radius: 4px;
    overflow: hidden;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f8f9fa;
}

.image-thumbnail img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.image-thumbnail.no-image {
    background: #f8f9fa;
}

.no-image-text {
    font-size: 10px;
    color: #6c757d;
}

.year-badge {
    background: #e3f2fd;
    color: #1976d2;
    padding: 4px 8px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 500;
}

.weight-cell {
    font-weight: 600;
    color: #333;
}

.status-badge {
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 500;
}

.status-badge.pending {
    background: #fff3cd;
    color: #856404;
}

.status-badge.approved {
    background: #d4edda;
    color: #155724;
}

.status-badge.rejected {
    background: #f8d7da;
    color: #721c24;
}

.date-cell {
    color: #6c757d;
    font-size: 14px;
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

.pagination {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px;
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.pagination-info {
    color: #6c757d;
    font-size: 14px;
}

.pagination-controls {
    display: flex;
    align-items: center;
    gap: 8px;
}

.pagination-btn {
    padding: 8px 16px;
    border: 1px solid #dee2e6;
    background: white;
    border-radius: 6px;
    cursor: pointer;
    font-size: 14px;
}

.pagination-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.pagination-btn:hover:not(:disabled) {
    background: #f8f9fa;
}

.page-numbers {
    display: flex;
    gap: 4px;
}

.page-btn {
    padding: 8px 12px;
    border: 1px solid #dee2e6;
    background: white;
    border-radius: 6px;
    cursor: pointer;
    font-size: 14px;
    min-width: 40px;
}

.page-btn.active {
    background: #007bff;
    color: white;
    border-color: #007bff;
}

.page-btn:hover:not(.active) {
    background: #f8f9fa;
}

.page-size-selector {
    display: flex;
    align-items: center;
    gap: 8px;
}

.page-size-selector label {
    font-size: 14px;
    color: #6c757d;
}

.page-size-select {
    padding: 6px 8px;
    border: 1px solid #dee2e6;
    border-radius: 4px;
    font-size: 14px;
}

.submission-details {
    padding: 20px 0;
}

.detail-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 24px;
}

.detail-section {
    margin-bottom: 24px;
}

.detail-section h4 {
    margin: 0 0 16px 0;
    color: #333;
    font-size: 16px;
    border-bottom: 1px solid #e9ecef;
    padding-bottom: 8px;
}

.detail-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 0;
    border-bottom: 1px solid #f8f9fa;
}

.detail-item label {
    font-weight: 500;
    color: #6c757d;
    font-size: 14px;
}

.detail-item span {
    font-weight: 500;
    color: #333;
}

.status-text.pending {
    color: #856404;
}

.status-text.approved {
    color: #155724;
}

.status-text.rejected {
    color: #721c24;
}

.year-result {
    font-weight: 600;
    color: #1976d2;
}

.weight-value {
    font-weight: 600;
    color: #28a745;
    font-size: 16px;
}

.match-status {
    padding: 4px 8px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 500;
}

.match-status.match {
    background: #d4edda;
    color: #155724;
}

.match-status.mismatch {
    background: #f8d7da;
    color: #721c24;
}

.image-preview-large {
    display: flex;
    justify-content: center;
    margin-top: 16px;
}

.detail-image {
    max-width: 200px;
    max-height: 200px;
    border-radius: 8px;
    cursor: pointer;
    border: 1px solid #e9ecef;
}

.no-image-large {
    text-align: center;
    padding: 40px 20px;
    color: #6c757d;
    border: 1px dashed #e9ecef;
    border-radius: 8px;
    width: 100%;
}

.no-image-icon {
    font-size: 48px;
    margin-bottom: 16px;
    display: block;
}

.image-modal-content {
    display: flex;
    justify-content: center;
    padding: 20px 0;
}

.modal-image {
    max-width: 100%;
    max-height: 400px;
    border-radius: 8px;
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

@media (max-width: 1024px) {
    .detail-grid {
        grid-template-columns: 1fr;
    }
}

@media (max-width: 768px) {
    .all-submissions {
        padding: 16px;
    }
    
    .page-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 16px;
    }
    
    .stats-overview {
        grid-template-columns: repeat(2, 1fr);
    }
    
    .filter-row {
        flex-direction: column;
        align-items: stretch;
        gap: 16px;
    }
    
    .filter-actions {
        justify-content: flex-end;
    }
    
    .pagination {
        flex-direction: column;
        gap: 16px;
        align-items: stretch;
    }
    
    .pagination-controls {
        justify-content: center;
    }
    
    .page-size-selector {
        justify-content: center;
    }
    
    .data-table {
        font-size: 12px;
    }
    
    .data-table th,
    .data-table td {
        padding: 8px 12px;
    }
}

@media (max-width: 480px) {
    .stats-overview {
        grid-template-columns: 1fr;
    }
    
    .header-actions {
        width: 100%;
        justify-content: space-between;
    }
    
    .page-numbers {
        display: none;
    }
}
</style>