<template>
    <div class="stock-management">
        <div class="page-header">
            <h2>陈皮库存管理</h2>
            <div class="header-actions">
                <button class="btn btn-primary" @click="refreshData">
                    <span class="btn-icon">🔄</span>
                    刷新数据
                </button>
                <button class="btn btn-success" @click="exportData">
                    <span class="btn-icon">📊</span>
                    导出报表
                </button>
            </div>
        </div>

        <!-- 统计卡片 -->
        <div class="stats-cards">
            <div class="stat-card total">
                <div class="stat-icon">📦</div>
                <div class="stat-content">
                    <div class="stat-value">{{ totalStock }}克</div>
                    <div class="stat-label">总库存</div>
                </div>
            </div>
            <div class="stat-card average">
                <div class="stat-icon">⚖️</div>
                <div class="stat-content">
                    <div class="stat-value">{{ averageStock }}克</div>
                    <div class="stat-label">平均库存</div>
                </div>
            </div>
            <div class="stat-card recent">
                <div class="stat-icon">📈</div>
                <div class="stat-content">
                    <div class="stat-value">{{ recentChange }}</div>
                    <div class="stat-label">近期变化</div>
                </div>
            </div>
        </div>

        <!-- 库存表格 -->
        <div class="card">
            <div class="card-header">
                <h3>各年份库存详情</h3>
                <div class="table-actions">
                    <div class="search-box">
                        <input 
                            type="text" 
                            v-model="searchTerm"
                            placeholder="搜索年份..."
                            class="search-input"
                        >
                        <span class="search-icon">🔍</span>
                    </div>
                </div>
            </div>
            <div class="table-container">
                <table class="table">
                    <thead>
                        <tr>
                            <th>年份范围</th>
                            <th>当前库存</th>
                            <th>占比</th>
                            <th>最后更新</th>
                            <th>操作</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="item in sortedStock" :key="item.id">
                            <td class="year-range">
                                <span class="year-badge">{{ item.yearRange }}</span>
                            </td>
                            <td class="stock-weight">
                                <strong>{{ item.stockWeight }}克</strong>
                            </td>
                            <td class="stock-percentage">
                                <div class="percentage-bar">
                                    <div 
                                        class="bar-fill" 
                                        :style="{ width: item.percentage + '%' }"
                                        :class="getPercentageClass(item.percentage)"
                                    ></div>
                                    <span class="percentage-text">{{ item.percentage }}%</span>
                                </div>
                            </td>
                            <td class="update-time">
                                {{ formatDate(item.updatedAt) }}
                            </td>
                            <td class="actions">
                                <button 
                                    class="btn btn-sm btn-outline"
                                    @click="editStock(item)"
                                    title="编辑库存"
                                >
                                    <span class="btn-icon">✏️</span>
                                </button>
                                <button 
                                    class="btn btn-sm btn-outline"
                                    @click="showHistory(item)"
                                    title="查看历史"
                                >
                                    <span class="btn-icon">📊</span>
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- 库存图表 -->
        <div class="chart-section">
            <div class="card">
                <div class="card-header">
                    <h3>库存分布图表</h3>
                    <div class="chart-controls">
                        <select v-model="chartType" class="chart-select">
                            <option value="pie">饼图</option>
                            <option value="bar">柱状图</option>
                            <option value="line">折线图</option>
                        </select>
                    </div>
                </div>
                <div class="chart-container">
                    <div class="chart-placeholder">
                        <div class="placeholder-icon">📊</div>
                        <p>库存分布图表</p>
                        <small>这里可以集成图表库如Chart.js或ECharts</small>
                    </div>
                </div>
            </div>
        </div>

        <!-- 编辑库存模态框 -->
        <AppModal 
            v-model:show="showEditModal"
            title="编辑库存"
            icon="✏️"
            size="small"
            @confirm="updateStock"
            :confirm-disabled="!editedStock.stockWeight"
        >
            <template #content>
                <div class="edit-form">
                    <div class="form-group">
                        <label>年份范围:</label>
                        <input 
                            type="text" 
                            v-model="editedStock.yearRange" 
                            disabled
                            class="form-input"
                        >
                    </div>
                    <div class="form-group">
                        <label>库存克数:</label>
                        <input 
                            type="number" 
                            v-model="editedStock.stockWeight"
                            step="0.1"
                            min="0"
                            class="form-input"
                            placeholder="请输入库存克数"
                        >
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
    name: 'StockManagement',
    components: {
        AppModal
    },
    setup() {
        // 响应式数据
        const stockData = ref([])
        const loading = ref(false)
        const searchTerm = ref('')
        const chartType = ref('pie')
        const showEditModal = ref(false)
        const editedStock = ref({
            id: null,
            yearRange: '',
            stockWeight: 0
        })

        // 修正后的年份范围排序函数
        const sortYearRanges = (items) => {
            return [...items].sort((a, b) => {
                // 处理特殊值 "150+" - 放在最后
                if (a.yearRange === '150+') return 1
                if (b.yearRange === '150+') return -1
                
                // 提取年份范围的起始年份
                const getStartYear = (yearRange) => {
                    const parts = yearRange.split('-')
                    return parseInt(parts[0])
                }
                
                const startA = getStartYear(a.yearRange)
                const startB = getStartYear(b.yearRange)
                
                return startA - startB
            })
        }

        // 计算属性
        const filteredStock = computed(() => {
            if (!searchTerm.value) return stockData.value
            
            return stockData.value.filter(item => 
                item.yearRange.toLowerCase().includes(searchTerm.value.toLowerCase())
            )
        })

        // 修正：使用排序函数对过滤后的数据进行排序
        const sortedStock = computed(() => {
            return sortYearRanges(filteredStock.value)
        })

        const totalStock = computed(() => {
            return stockData.value.reduce((total, item) => total + item.stockWeight, 0)
        })

        const averageStock = computed(() => {
            return stockData.value.length > 0 
                ? Math.round(totalStock.value / stockData.value.length) 
                : 0
        })

        const recentChange = computed(() => {
            // 模拟近期变化
            return '+5.2%'
        })

        // 方法
        const loadStockData = async () => {
            loading.value = true
            try {
                // 模拟API调用
                await new Promise(resolve => setTimeout(resolve, 1000))
                
                // 模拟数据 - 使用扩展后的年份范围
                const yearRanges = [
                    '0-5', '5-10', '10-15', '15-20', '20-25', '25-30', '30-35', '35-40',
                    '40-45', '45-50', '50-55', '55-60', '60-65', '65-70', '70-75', '75-80',
                    '80-85', '85-90', '90-95', '95-100', '100-105', '105-110', '110-115',
                    '115-120', '120-125', '125-130', '130-135', '135-140', '140-145',
                    '145-150', '150+'
                ]
                
                // 生成模拟数据
                const mockData = yearRanges.map((range, index) => {
                    // 为不同年份范围生成不同的库存值，使其看起来更真实
                    let stockWeight = 0
                    if (range === '0-5') stockWeight = 2000
                    else if (range === '5-10') stockWeight = 1800
                    else if (range === '10-15') stockWeight = 1500
                    else if (range === '15-20') stockWeight = 1200
                    else if (range === '20-25') stockWeight = 900
                    else if (range === '25-30') stockWeight = 700
                    else if (range === '30-35') stockWeight = 500
                    else if (range === '35-40') stockWeight = 300
                    else if (range === '40-45') stockWeight = 200
                    else if (range === '45-50') stockWeight = 150
                    else if (range === '50-55') stockWeight = 100
                    else if (range === '55-60') stockWeight = 80
                    else if (range === '60-65') stockWeight = 60
                    else if (range === '65-70') stockWeight = 40
                    else if (range === '70-75') stockWeight = 30
                    else if (range === '75-80') stockWeight = 20
                    else if (range === '80-85') stockWeight = 15
                    else if (range === '85-90') stockWeight = 10
                    else if (range === '90-95') stockWeight = 8
                    else if (range === '95-100') stockWeight = 5
                    else stockWeight = Math.floor(Math.random() * 5) + 1 // 100年以上的少量库存
                    
                    return {
                        id: index + 1,
                        yearRange: range,
                        stockWeight: stockWeight,
                        percentage: 0, // 稍后计算
                        updatedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) // 随机日期
                    }
                })
                
                // 计算总库存和百分比
                const total = mockData.reduce((sum, item) => sum + item.stockWeight, 0)
                mockData.forEach(item => {
                    item.percentage = total > 0 ? Math.round((item.stockWeight / total) * 100) : 0
                })
                
                // 修正：在赋值前先对数据进行排序
                stockData.value = sortYearRanges(mockData)
            } catch (error) {
                console.error('加载库存数据失败:', error)
            } finally {
                loading.value = false
            }
        }

        const refreshData = () => {
            loadStockData()
        }

        const exportData = () => {
            // 导出数据逻辑
            console.log('导出库存数据')
        }

        const editStock = (stock) => {
            editedStock.value = { ...stock }
            showEditModal.value = true
        }

        const updateStock = async () => {
            try {
                // 模拟API调用更新库存
                await new Promise(resolve => setTimeout(resolve, 500))
                
                const index = stockData.value.findIndex(item => item.id === editedStock.value.id)
                if (index !== -1) {
                    stockData.value[index] = { ...editedStock.value }
                    // 重新计算百分比
                    recalculatePercentages()
                    // 修正：更新后重新排序
                    stockData.value = sortYearRanges(stockData.value)
                }
                
                showEditModal.value = false
            } catch (error) {
                console.error('更新库存失败:', error)
            }
        }

        const showHistory = (stock) => {
            console.log('查看库存历史:', stock)
            // 这里可以实现查看库存历史的功能
        }

        const recalculatePercentages = () => {
            const total = totalStock.value
            stockData.value.forEach(item => {
                item.percentage = total > 0 ? Math.round((item.stockWeight / total) * 100) : 0
            })
        }

        const getPercentageClass = (percentage) => {
            if (percentage > 30) return 'high'
            if (percentage > 15) return 'medium'
            return 'low'
        }

        const formatDate = (date) => {
            return new Date(date).toLocaleDateString('zh-CN')
        }

        // 生命周期
        onMounted(() => {
            loadStockData()
        })

        return {
            stockData,
            loading,
            searchTerm,
            chartType,
            showEditModal,
            editedStock,
            filteredStock,
            sortedStock,
            totalStock,
            averageStock,
            recentChange,
            refreshData,
            exportData,
            editStock,
            updateStock,
            showHistory,
            getPercentageClass,
            formatDate
        }
    }
}
</script>

<style scoped>
.stock-management {
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
    padding: 6px 12px;
    font-size: 12px;
}

.btn-icon {
    font-size: 14px;
}

.stats-cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 16px;
    margin-bottom: 24px;
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

.card {
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    margin-bottom: 24px;
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

.table-actions {
    display: flex;
    gap: 12px;
}

.search-box {
    position: relative;
}

.search-input {
    padding: 8px 12px 8px 36px;
    border: 1px solid #dee2e6;
    border-radius: 6px;
    font-size: 14px;
    width: 200px;
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

.table {
    width: 100%;
    border-collapse: collapse;
}

.table th,
.table td {
    padding: 16px;
    text-align: left;
    border-bottom: 1px solid #e9ecef;
}

.table th {
    background: #f8f9fa;
    font-weight: 600;
    color: #333;
}

.year-badge {
    background: #e3f2fd;
    color: #1976d2;
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 500;
}

.stock-weight {
    font-size: 16px;
    color: #333;
}

.percentage-bar {
    background: #f8f9fa;
    border-radius: 10px;
    height: 20px;
    position: relative;
    overflow: hidden;
}

.bar-fill {
    height: 100%;
    border-radius: 10px;
    transition: width 0.3s ease;
}

.bar-fill.high {
    background: #28a745;
}

.bar-fill.medium {
    background: #ffc107;
}

.bar-fill.low {
    background: #dc3545;
}

.percentage-text {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 12px;
    font-weight: 600;
    color: #333;
}

.update-time {
    color: #6c757d;
    font-size: 14px;
}

.actions {
    display: flex;
    gap: 8px;
}

.chart-section {
    margin-top: 24px;
}

.chart-controls {
    display: flex;
    gap: 12px;
}

.chart-select {
    padding: 8px 12px;
    border: 1px solid #dee2e6;
    border-radius: 6px;
    font-size: 14px;
}

.chart-container {
    padding: 24px;
    min-height: 300px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.chart-placeholder {
    text-align: center;
    color: #6c757d;
}

.placeholder-icon {
    font-size: 48px;
    margin-bottom: 16px;
}

.edit-form {
    padding: 20px 0;
}

.form-group {
    margin-bottom: 16px;
}

.form-group label {
    display: block;
    margin-bottom: 8px;
    font-weight: 500;
    color: #333;
}

.form-input {
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
    .stock-management {
        padding: 16px;
    }
    
    .page-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 16px;
    }
    
    .header-actions {
        width: 100%;
        justify-content: flex-end;
    }
    
    .stats-cards {
        grid-template-columns: 1fr;
    }
    
    .card-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 16px;
    }
    
    .table-actions {
        width: 100%;
    }
    
    .search-input {
        width: 100%;
    }
    
    .actions {
        flex-direction: column;
    }
}
</style>