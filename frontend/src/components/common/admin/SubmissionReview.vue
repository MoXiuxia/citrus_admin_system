<template>
    <div class="submission-review">
        <div class="page-header">
            <h2>提交审核</h2>
            <div class="header-stats">
                <span class="stat-badge pending">
                    <span class="stat-count">{{ pendingCount }}</span>
                    待审核
                </span>
                <span class="stat-badge total">
                    <span class="stat-count">{{ totalCount }}</span>
                    总提交
                </span>
            </div>
        </div>

        <!-- 筛选工具栏 -->
        <div class="filter-toolbar">
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
                <label>用户筛选:</label>
                <input 
                    type="text" 
                    v-model="filters.username"
                    placeholder="搜索用户名..."
                    class="filter-input"
                >
            </div>
            <div class="filter-actions">
                <button class="btn btn-outline" @click="resetFilters">
                    <span class="btn-icon">🔄</span>
                    重置
                </button>
                <button class="btn btn-primary" @click="applyFilters">
                    <span class="btn-icon">🔍</span>
                    应用筛选
                </button>
            </div>
        </div>

        <!-- 批量操作 -->
        <div class="batch-actions" v-if="selectedSubmissions.length > 0">
            <div class="batch-info">
                <span>已选择 {{ selectedSubmissions.length }} 个提交</span>
            </div>
            <div class="batch-buttons">
                <button class="btn btn-success" @click="batchApprove">
                    <span class="btn-icon">✅</span>
                    批量通过
                </button>
                <button class="btn btn-danger" @click="batchReject">
                    <span class="btn-icon">❌</span>
                    批量拒绝
                </button>
            </div>
        </div>

        <!-- 提交列表 -->
        <div class="submissions-list">
            <div 
                v-for="submission in filteredSubmissions" 
                :key="submission.id"
                :class="['submission-card', { selected: isSelected(submission.id) }]"
            >
                <div class="card-header">
                    <div class="submission-meta">
                        <span class="user-badge">{{ submission.username }}</span>
                        <span class="date">{{ formatDate(submission.submittedAt) }}</span>
                    </div>
                    <div class="card-actions">
                        <label class="checkbox-wrapper">
                            <input 
                                type="checkbox" 
                                :checked="isSelected(submission.id)"
                                @change="toggleSelection(submission.id)"
                            >
                            <span class="checkmark"></span>
                        </label>
                    </div>
                </div>

                <div class="card-content">
                    <!-- 图片预览 -->
                    <div class="image-section">
                        <div class="image-preview" @click="showImage(submission)">
                            <img 
                                v-if="submission.imageUrl" 
                                :src="submission.imageUrl" 
                                :alt="'陈皮图片-' + submission.id"
                                class="preview-image"
                            >
                            <div v-else class="no-image">
                                <span class="no-image-icon">🖼️</span>
                                <p>无图片</p>
                            </div>
                        </div>
                    </div>

                    <!-- 提交信息 -->
                    <div class="info-section">
                        <div class="info-grid">
                            <div class="info-item">
                                <label>AI识别结果:</label>
                                <span class="ai-result">{{ submission.aiYearResult }}年</span>
                            </div>
                            <div class="info-item">
                                <label>用户选择:</label>
                                <span class="user-selection">{{ submission.manualYearSelection }}年</span>
                            </div>
                            <div class="info-item">
                                <label>重量:</label>
                                <span class="weight">{{ submission.weight }}克</span>
                            </div>
                            <div class="info-item">
                                <label>匹配状态:</label>
                                <span 
                                    class="match-status"
                                    :class="getMatchStatusClass(submission)"
                                >
                                    {{ getMatchStatusText(submission) }}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 操作按钮 -->
                <div class="card-footer">
                    <div class="action-buttons">
                        <button 
                            class="btn btn-success btn-sm"
                            @click="approveSubmission(submission.id)"
                            :disabled="submission.status !== 'pending'"
                        >
                            <span class="btn-icon">✅</span>
                            通过
                        </button>
                        <button 
                            class="btn btn-danger btn-sm"
                            @click="rejectSubmission(submission.id)"
                            :disabled="submission.status !== 'pending'"
                        >
                            <span class="btn-icon">❌</span>
                            拒绝
                        </button>
                        <button 
                            class="btn btn-outline btn-sm"
                            @click="viewDetails(submission)"
                        >
                            <span class="btn-icon">👁️</span>
                            详情
                        </button>
                    </div>
                    <div class="status-badge" :class="submission.status">
                        {{ getStatusText(submission.status) }}
                    </div>
                </div>
            </div>
        </div>

        <!-- 空状态 -->
        <div class="empty-state" v-if="filteredSubmissions.length === 0">
            <div class="empty-icon">📭</div>
            <h3>暂无待审核的提交</h3>
            <p>所有提交都已审核完成</p>
        </div>

        <!-- 分页 -->
        <div class="pagination" v-if="filteredSubmissions.length > 0">
            <button 
                class="pagination-btn"
                :disabled="currentPage === 1"
                @click="prevPage"
            >
                上一页
            </button>
            <span class="pagination-info">
                第 {{ currentPage }} 页，共 {{ totalPages }} 页
            </span>
            <button 
                class="pagination-btn"
                :disabled="currentPage === totalPages"
                @click="nextPage"
            >
                下一页
            </button>
        </div>

        <!-- 图片查看模态框 -->
        <AppModal 
            v-model:show="showImageModal"
            title="陈皮图片"
            size="large"
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

        <!-- 详情模态框 -->
        <AppModal 
            v-model:show="showDetailModal"
            title="提交详情"
            size="medium"
        >
            <template #content>
                <div class="detail-content" v-if="selectedSubmission">
                    <div class="detail-section">
                        <h4>用户信息</h4>
                        <div class="detail-grid">
                            <div class="detail-item">
                                <label>用户名:</label>
                                <span>{{ selectedSubmission.username }}</span>
                            </div>
                            <div class="detail-item">
                                <label>提交时间:</label>
                                <span>{{ formatDate(selectedSubmission.submittedAt) }}</span>
                            </div>
                        </div>
                    </div>
                    <div class="detail-section">
                        <h4>陈皮信息</h4>
                        <div class="detail-grid">
                            <div class="detail-item">
                                <label>AI识别年份:</label>
                                <span>{{ selectedSubmission.aiYearResult }}年</span>
                            </div>
                            <div class="detail-item">
                                <label>用户选择年份:</label>
                                <span>{{ selectedSubmission.manualYearSelection }}年</span>
                            </div>
                            <div class="detail-item">
                                <label>重量:</label>
                                <span>{{ selectedSubmission.weight }}克</span>
                            </div>
                            <div class="detail-item">
                                <label>当前状态:</label>
                                <span :class="['status-text', selectedSubmission.status]">
                                    {{ getStatusText(selectedSubmission.status) }}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div class="detail-section" v-if="selectedSubmission.reviewedAt">
                        <h4>审核信息</h4>
                        <div class="detail-grid">
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
                    </div>
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
import { ref, computed, onMounted } from 'vue'
import AppModal from '../common/Modal.vue'

export default {
    name: 'SubmissionReview',
    components: {
        AppModal
    },
    setup() {
        // 响应式数据
        const submissions = ref([])
        const loading = ref(false)
        const selectedSubmissions = ref([])
        const showImageModal = ref(false)
        const showDetailModal = ref(false)
        const selectedImage = ref('')
        const selectedSubmission = ref(null)
        const currentPage = ref(1)
        const pageSize = 10

        const filters = ref({
            year: '',
            username: ''
        })

        // 计算属性
        const filteredSubmissions = computed(() => {
            let filtered = submissions.value
            
            // 年份筛选
            if (filters.value.year) {
                filtered = filtered.filter(s => s.manualYearSelection === filters.value.year)
            }
            
            // 用户名筛选
            if (filters.value.username) {
                filtered = filtered.filter(s => 
                    s.username.toLowerCase().includes(filters.value.username.toLowerCase())
                )
            }
            
            // 分页
            const start = (currentPage.value - 1) * pageSize
            const end = start + pageSize
            return filtered.slice(start, end)
        })

        const pendingCount = computed(() => {
            return submissions.value.filter(s => s.status === 'pending').length
        })

        const totalCount = computed(() => {
            return submissions.value.length
        })

        const totalPages = computed(() => {
            return Math.ceil(submissions.value.length / pageSize)
        })

        // 方法
        const loadSubmissions = async () => {
            loading.value = true
            try {
                // 模拟API调用
                await new Promise(resolve => setTimeout(resolve, 1500))
                
                // 模拟数据
                submissions.value = [
                    {
                        id: 1,
                        username: 'user1',
                        imageUrl: '/api/placeholder/200',
                        aiYearResult: '10-20',
                        manualYearSelection: '10-20',
                        weight: 150.5,
                        status: 'pending',
                        submittedAt: new Date('2024-01-15T10:30:00'),
                        reviewedAt: null
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
            // 筛选逻辑已经在计算属性中处理
        }

        const resetFilters = () => {
            filters.value = {
                year: '',
                username: ''
            }
            currentPage.value = 1
        }

        const toggleSelection = (submissionId) => {
            const index = selectedSubmissions.value.indexOf(submissionId)
            if (index > -1) {
                selectedSubmissions.value.splice(index, 1)
            } else {
                selectedSubmissions.value.push(submissionId)
            }
        }

        const isSelected = (submissionId) => {
            return selectedSubmissions.value.includes(submissionId)
        }

        const batchApprove = async () => {
            if (selectedSubmissions.value.length === 0) return
            
            try {
                // 模拟批量通过API调用
                await new Promise(resolve => setTimeout(resolve, 1000))
                
                submissions.value = submissions.value.map(s => {
                    if (selectedSubmissions.value.includes(s.id)) {
                        return { ...s, status: 'approved', reviewedAt: new Date() }
                    }
                    return s
                })
                
                selectedSubmissions.value = []
            } catch (error) {
                console.error('批量通过失败:', error)
            }
        }

        const batchReject = async () => {
            if (selectedSubmissions.value.length === 0) return
            
            try {
                // 模拟批量拒绝API调用
                await new Promise(resolve => setTimeout(resolve, 1000))
                
                submissions.value = submissions.value.map(s => {
                    if (selectedSubmissions.value.includes(s.id)) {
                        return { ...s, status: 'rejected', reviewedAt: new Date() }
                    }
                    return s
                })
                
                selectedSubmissions.value = []
            } catch (error) {
                console.error('批量拒绝失败:', error)
            }
        }

        const approveSubmission = async (submissionId) => {
            try {
                // 模拟通过API调用
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
                // 模拟拒绝API调用
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

        const showImage = (submission) => {
            if (submission.imageUrl) {
                selectedImage.value = submission.imageUrl
                showImageModal.value = true
            }
        }

        const viewDetails = (submission) => {
            selectedSubmission.value = submission
            showDetailModal.value = true
        }

        const getMatchStatusClass = (submission) => {
            if (submission.aiYearResult === submission.manualYearSelection) {
                return 'match'
            } else {
                return 'mismatch'
            }
        }

        const getMatchStatusText = (submission) => {
            return submission.aiYearResult === submission.manualYearSelection ? '匹配' : '不匹配'
        }

        const getStatusText = (status) => {
            const statusMap = {
                pending: '待审核',
                approved: '已通过',
                rejected: '已拒绝'
            }
            return statusMap[status] || status
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

        // 生命周期
        onMounted(() => {
            loadSubmissions()
        })

        return {
            submissions,
            loading,
            selectedSubmissions,
            showImageModal,
            showDetailModal,
            selectedImage,
            selectedSubmission,
            currentPage,
            filters,
            filteredSubmissions,
            pendingCount,
            totalCount,
            totalPages,
            applyFilters,
            resetFilters,
            toggleSelection,
            isSelected,
            batchApprove,
            batchReject,
            approveSubmission,
            rejectSubmission,
            showImage,
            viewDetails,
            getMatchStatusClass,
            getMatchStatusText,
            getStatusText,
            formatDate,
            prevPage,
            nextPage
        }
    }
}
</script>

<style scoped>
.submission-review {
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

.header-stats {
    display: flex;
    gap: 16px;
}

.stat-badge {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    border-radius: 20px;
    font-size: 14px;
    font-weight: 500;
}

.stat-badge.pending {
    background: #fff3cd;
    color: #856404;
}

.stat-badge.total {
    background: #d1ecf1;
    color: #0c5460;
}

.stat-count {
    font-weight: 600;
    font-size: 16px;
}

.filter-toolbar {
    background: white;
    border-radius: 8px;
    padding: 20px;
    margin-bottom: 24px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    display: flex;
    gap: 20px;
    align-items: end;
    flex-wrap: wrap;
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

.filter-select,
.filter-input {
    padding: 8px 12px;
    border: 1px solid #dee2e6;
    border-radius: 6px;
    font-size: 14px;
    min-width: 150px;
}

.filter-actions {
    display: flex;
    gap: 12px;
    margin-left: auto;
}

.batch-actions {
    background: #e3f2fd;
    border: 1px solid #bbdefb;
    border-radius: 8px;
    padding: 16px 20px;
    margin-bottom: 24px;
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.batch-info {
    font-weight: 500;
    color: #1976d2;
}

.batch-buttons {
    display: flex;
    gap: 12px;
}

.submissions-list {
    display: grid;
    gap: 16px;
}

.submission-card {
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    overflow: hidden;
    transition: all 0.3s ease;
    border: 2px solid transparent;
}

.submission-card:hover {
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.submission-card.selected {
    border-color: #007bff;
    background: #f8f9fa;
}

.card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 20px;
    border-bottom: 1px solid #e9ecef;
    background: #f8f9fa;
}

.submission-meta {
    display: flex;
    align-items: center;
    gap: 12px;
}

.user-badge {
    background: #007bff;
    color: white;
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 500;
}

.date {
    font-size: 14px;
    color: #6c757d;
}

.card-actions {
    display: flex;
    align-items: center;
}

.checkbox-wrapper {
    display: flex;
    align-items: center;
    cursor: pointer;
}

.checkbox-wrapper input {
    display: none;
}

.checkmark {
    width: 20px;
    height: 20px;
    border: 2px solid #dee2e6;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
}

.checkbox-wrapper input:checked + .checkmark {
    background: #007bff;
    border-color: #007bff;
}

.checkbox-wrapper input:checked + .checkmark::after {
    content: '✓';
    color: white;
    font-size: 12px;
    font-weight: bold;
}

.card-content {
    display: grid;
    grid-template-columns: 1fr 2fr;
    gap: 20px;
    padding: 20px;
}

.image-section {
    display: flex;
    justify-content: center;
}

.image-preview {
    width: 120px;
    height: 120px;
    border: 1px solid #e9ecef;
    border-radius: 8px;
    overflow: hidden;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f8f9fa;
}

.preview-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.no-image {
    text-align: center;
    color: #6c757d;
}

.no-image-icon {
    font-size: 24px;
    display: block;
    margin-bottom: 8px;
}

.info-section {
    display: flex;
    align-items: center;
}

.info-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    width: 100%;
}

.info-item {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.info-item label {
    font-size: 12px;
    color: #6c757d;
    font-weight: 500;
}

.ai-result,
.user-selection,
.weight {
    font-weight: 600;
    color: #333;
}

.match-status {
    font-size: 12px;
    font-weight: 500;
    padding: 2px 8px;
    border-radius: 12px;
    display: inline-block;
}

.match-status.match {
    background: #d4edda;
    color: #155724;
}

.match-status.mismatch {
    background: #f8d7da;
    color: #721c24;
}

.card-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 20px;
    border-top: 1px solid #e9ecef;
    background: #f8f9fa;
}

.action-buttons {
    display: flex;
    gap: 8px;
}

.btn {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 12px;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    transition: all 0.3s ease;
}

.btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.btn-success {
    background: #28a745;
    color: white;
}

.btn-success:hover:not(:disabled) {
    background: #1e7e34;
}

.btn-danger {
    background: #dc3545;
    color: white;
}

.btn-danger:hover:not(:disabled) {
    background: #c82333;
}

.btn-outline {
    background: transparent;
    border: 1px solid #dee2e6;
    color: #6c757d;
}

.btn-outline:hover:not(:disabled) {
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
    justify-content: center;
    gap: 16px;
    margin-top: 24px;
    padding: 20px;
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

.pagination-info {
    color: #6c757d;
    font-size: 14px;
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

.detail-content {
    padding: 20px 0;
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

.detail-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
}

.detail-item {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.detail-item label {
    font-size: 12px;
    color: #6c757d;
    font-weight: 500;
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
    .submission-review {
        padding: 16px;
    }
    
    .page-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 16px;
    }
    
    .filter-toolbar {
        flex-direction: column;
        align-items: stretch;
    }
    
    .filter-actions {
        margin-left: 0;
        justify-content: flex-end;
    }
    
    .batch-actions {
        flex-direction: column;
        gap: 16px;
        align-items: flex-start;
    }
    
    .card-content {
        grid-template-columns: 1fr;
        gap: 16px;
    }
    
    .info-grid {
        grid-template-columns: 1fr;
    }
    
    .card-footer {
        flex-direction: column;
        gap: 16px;
        align-items: flex-start;
    }
    
    .action-buttons {
        width: 100%;
        justify-content: space-between;
    }
    
    .detail-grid {
        grid-template-columns: 1fr;
    }
}
</style>