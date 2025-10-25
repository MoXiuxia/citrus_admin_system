<template>
    <div class="container">
        <header class="header">
            <div class="header-content">
                <div class="header-title">
                    <h1>陈皮信息提交</h1>
                    <p class="header-subtitle">提交您的陈皮信息，获取专业评估</p>
                </div>
                <div class="user-info">
                    <span class="welcome-text">欢迎，{{ user.username }}</span>
                    <button class="btn btn-danger" @click="logout">退出登录</button>
                </div>
            </div>
        </header>

        <div class="card">
            <div class="card-header">
                <h2>提交陈皮信息</h2>
                <p class="card-description">上传陈皮图片并填写相关信息</p>
            </div>
            <form @submit.prevent="submitForm">
                <div class="form-group">
                    <label>陈皮图片上传:</label>
                    <div class="upload-area" @click="triggerFileInput" :class="{ 'has-image': imagePreview }">
                        <input type="file" ref="fileInput" @change="handleImageUpload" accept="image/*" hidden>
                        <div v-if="!imagePreview" class="upload-placeholder">
                            <div class="upload-icon">📷</div>
                            <p>点击上传陈皮图片</p>
                            <span class="upload-hint">支持 JPG、PNG 格式</span>
                        </div>
                        <div v-else class="image-preview">
                            <img :src="imagePreview" alt="预览图片">
                            <button type="button" class="remove-image" @click.stop="removeImage">×</button>
                        </div>
                    </div>
                </div>

                <div class="form-group">
                    <label>AI识别年份结果:</label>
                    <div class="result-display">
                        <input type="text" v-model="aiYearResult" readonly placeholder="上传图片后自动识别">
                        <div class="result-icon" v-if="aiYearResult">🔍</div>
                    </div>
                </div>

                <div class="form-group">
                    <label>手动选择年份:</label>
                    <select v-model="manualYearSelection" class="form-select">
                        <option value="">请选择年份</option>
                        <option v-for="yearRange in yearRanges" :key="yearRange.value" :value="yearRange.value">
                            {{ yearRange.label }}
                        </option>
                    </select>
                </div>

                <div class="form-group">
                    <label>陈皮克数:</label>
                    <div class="input-with-unit">
                        <input type="number" v-model="weight" placeholder="请输入陈皮重量" step="0.1" min="0">
                        <span class="unit">克</span>
                    </div>
                </div>

                <button type="submit" class="btn btn-primary submit-btn" :disabled="!canSubmit || submitting">
                    <span v-if="submitting" class="loading-text">
                        <span class="spinner"></span>
                        提交中...
                    </span>
                    <span v-else-if="!canSubmit">请填写完整信息</span>
                    <span v-else>提交陈皮信息</span>
                </button>
            </form>
        </div>

        <div v-if="showSuccessModal" class="modal-overlay">
            <div class="modal">
                <div class="modal-header">
                    <h3>提交成功!</h3>
                </div>
                <div class="modal-body">
                    <div class="success-icon">✓</div>
                    <p>您的陈皮信息已成功提交</p>
                    <div class="submission-details">
                        <div class="detail-item">
                            <span class="detail-label">AI识别结果:</span>
                            <span class="detail-value">{{ lastSubmission.aiYearResult }}年</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">审核状态:</span>
                            <span class="status-badge" :class="lastSubmission.status === 'approved' ? 'status-approved' : 'status-pending'">
                                {{ lastSubmission.status === 'approved' ? '通过' : '待审核' }}
                            </span>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-primary" @click="showSuccessModal = false">确定</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'UserHome',
    data() {
        return {
            imageFile: null,
            imagePreview: null,
            aiYearResult: '',
            manualYearSelection: '',
            weight: '',
            showSuccessModal: false,
            lastSubmission: {},
            submitting: false,
            // 陈皮年份范围从0年扩展到150年
            yearRanges: [
                { value: '0-5', label: '0-5年' },
                { value: '5-10', label: '5-10年' },
                { value: '10-15', label: '10-15年' },
                { value: '15-20', label: '15-20年' },
                { value: '20-25', label: '20-25年' },
                { value: '25-30', label: '25-30年' },
                { value: '30-35', label: '30-35年' },
                { value: '35-40', label: '35-40年' },
                { value: '40-45', label: '40-45年' },
                { value: '45-50', label: '45-50年' },
                { value: '50-55', label: '50-55年' },
                { value: '55-60', label: '55-60年' },
                { value: '60-65', label: '60-65年' },
                { value: '65-70', label: '65-70年' },
                { value: '70-75', label: '70-75年' },
                { value: '75-80', label: '75-80年' },
                { value: '80-85', label: '80-85年' },
                { value: '85-90', label: '85-90年' },
                { value: '90-95', label: '90-95年' },
                { value: '95-100', label: '95-100年' },
                { value: '100-105', label: '100-105年' },
                { value: '105-110', label: '105-110年' },
                { value: '110-115', label: '110-115年' },
                { value: '115-120', label: '115-120年' },
                { value: '120-125', label: '120-125年' },
                { value: '125-130', label: '125-130年' },
                { value: '130-135', label: '130-135年' },
                { value: '135-140', label: '135-140年' },
                { value: '140-145', label: '140-145年' },
                { value: '145-150', label: '145-150年' },
                { value: '150+', label: '150年以上' }
            ]
        }
    },
    computed: {
        user() {
            const userData = localStorage.getItem('user');
            if (!userData) {
                console.error('用户信息不存在，请重新登录');
                this.$router.push('/login');
                return {};
            }
            
            try {
                const user = JSON.parse(userData);
                console.log('当前用户信息:', user);
                if (!user || !user.id) {
                    console.error('用户ID不存在');
                    this.$router.push('/login');
                    return {};
                }
                return user;
            } catch (error) {
                console.error('解析用户信息失败:', error);
                this.$router.push('/login');
                return {};
            }
        },
        canSubmit() {
            return this.imageFile && this.manualYearSelection && this.weight > 0 && !this.submitting;
        }
    },
    mounted() {
        // 检查用户登录状态
        if (!this.user.id) {
            console.error('用户未登录，跳转到登录页');
            this.$router.push('/login');
            return;
        }
        console.log('用户ID:', this.user.id);
    },
    methods: {
        triggerFileInput() {
            this.$refs.fileInput.click();
        },
        
        handleImageUpload(event) {
            const file = event.target.files[0];
            if (file) {
                this.imageFile = file;
                this.imagePreview = URL.createObjectURL(file);
                // 模拟AI识别 - 从新的年份范围中随机选择
                setTimeout(() => {
                    const randomIndex = Math.floor(Math.random() * this.yearRanges.length);
                    this.aiYearResult = this.yearRanges[randomIndex].value;
                }, 1000);
            }
        },
        
        removeImage() {
            this.imageFile = null;
            this.imagePreview = null;
            this.aiYearResult = '';
            this.$refs.fileInput.value = '';
        },

        async submitForm() {
            if (!this.canSubmit) {
                alert('请填写完整信息');
                return;
            }

            // 再次检查用户ID
            if (!this.user.id) {
                alert('用户信息无效，请重新登录');
                this.$router.push('/login');
                return;
            }

            const formData = new FormData();
            formData.append('image', this.imageFile);
            formData.append('userId', this.user.id.toString()); // 确保是字符串
            formData.append('manualYear', this.manualYearSelection);
            formData.append('weight', this.weight);

            this.submitting = true;

            try {
                console.log('开始提交陈皮信息...', {
                    userId: this.user.id,
                    manualYear: this.manualYearSelection,
                    weight: this.weight
                });

                const response = await fetch('/api/citrus/submit', {
                    method: 'POST',
                    body: formData
                });

                const data = await response.json();
                console.log('提交响应:', data);

                if (response.ok && data.success) {
                    this.lastSubmission = {
                        aiYearResult: data.data.aiYearResult,
                        status: data.data.status
                    };
                    this.showSuccessModal = true;
                    this.resetForm();
                } else {
                    alert('提交失败: ' + (data.error || '未知错误'));
                }
            } catch (error) {
                console.error('提交错误:', error);
                alert('提交失败，请稍后重试');
            } finally {
                this.submitting = false;
            }
        },

        resetForm() {
            this.imageFile = null;
            this.imagePreview = null;
            this.aiYearResult = '';
            this.manualYearSelection = '';
            this.weight = '';
        },

        logout() {
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            this.$router.push('/login');
        }
    }
}
</script>

<style scoped>
/* 保持原有的样式不变，只添加新的样式 */
.user-info {
    display: flex;
    align-items: center;
    gap: 15px;
}

.welcome-text {
    color: rgba(255, 255, 255, 0.9);
    font-size: 14px;
}

.loading-text {
    display: flex;
    align-items: center;
    gap: 8px;
}

.spinner {
    width: 16px;
    height: 16px;
    border: 2px solid transparent;
    border-top: 2px solid currentColor;
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

/* 其他样式保持不变 */
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
    max-width: 800px;
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

.form-group {
    margin-bottom: 25px;
}

.form-group label {
    display: block;
    margin-bottom: 8px;
    font-weight: 600;
    color: var(--citrus-dark);
}

.upload-area {
    border: 2px dashed var(--citrus-gray-300);
    border-radius: 12px;
    padding: 30px;
    text-align: center;
    cursor: pointer;
    transition: all 0.3s ease;
    background: var(--citrus-gray-100);
}

.upload-area:hover {
    border-color: var(--citrus-primary);
    background: rgba(255, 167, 38, 0.05);
}

.upload-area.has-image {
    border-style: solid;
    padding: 10px;
}

.upload-placeholder {
    color: var(--citrus-gray-500);
}

.upload-icon {
    font-size: 48px;
    margin-bottom: 10px;
}

.upload-hint {
    font-size: 12px;
    display: block;
    margin-top: 5px;
}

.image-preview {
    position: relative;
    display: inline-block;
}

.image-preview img {
    max-width: 200px;
    max-height: 200px;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.remove-image {
    position: absolute;
    top: -10px;
    right: -10px;
    background: var(--citrus-error);
    color: white;
    border: none;
    border-radius: 50%;
    width: 24px;
    height: 24px;
    font-size: 16px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
}

.result-display {
    position: relative;
}

.result-display input {
    padding-right: 40px;
}

.result-icon {
    position: absolute;
    right: 12px;
    top: 50%;
    transform: translateY(-50%);
    font-size: 18px;
}

.form-select {
    width: 100%;
    padding: 12px 16px;
    border: 2px solid var(--citrus-gray-300);
    border-radius: 8px;
    font-size: 14px;
    transition: all 0.3s ease;
    background: white;
    appearance: none;
    background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
    background-repeat: no-repeat;
    background-position: right 12px center;
    background-size: 16px;
}

.form-select:focus {
    outline: none;
    border-color: var(--citrus-primary);
    box-shadow: 0 0 0 3px rgba(255, 167, 38, 0.1);
}

.input-with-unit {
    position: relative;
}

.input-with-unit input {
    padding-right: 50px;
}

.unit {
    position: absolute;
    right: 16px;
    top: 50%;
    transform: translateY(-50%);
    color: var(--citrus-gray-500);
}

.btn {
    padding: 12px 24px;
    border: none;
    border-radius: 8px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    display: inline-flex;
    align-items: center;
    justify-content: center;
}

.btn-primary {
    background: linear-gradient(135deg, var(--citrus-primary) 0%, var(--citrus-accent) 100%);
    color: white;
}

.btn-primary:hover:not(:disabled) {
    background: linear-gradient(135deg, var(--citrus-accent) 0%, var(--citrus-primary) 100%);
    box-shadow: 0 4px 15px rgba(255, 167, 38, 0.3);
    transform: translateY(-2px);
}

.btn-primary:disabled {
    background: var(--citrus-gray-400);
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
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

.submit-btn {
    width: 100%;
    padding: 16px;
    margin-top: 10px;
    font-size: 16px;
}

.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
}

.modal {
    background: white;
    border-radius: 16px;
    width: 90%;
    max-width: 450px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
    overflow: hidden;
}

.modal-header {
    background: linear-gradient(135deg, var(--citrus-success) 0%, #8BC34A 100%);
    color: white;
    padding: 20px;
    text-align: center;
}

.modal-header h3 {
    margin: 0;
    font-size: 22px;
    font-weight: 600;
}

.modal-body {
    padding: 30px;
    text-align: center;
}

.success-icon {
    width: 60px;
    height: 60px;
    background: var(--citrus-success);
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 28px;
    font-weight: bold;
    margin: 0 auto 20px;
}

.submission-details {
    background: var(--citrus-gray-100);
    border-radius: 8px;
    padding: 15px;
    margin-top: 20px;
}

.detail-item {
    display: flex;
    justify-content: space-between;
    margin-bottom: 10px;
}

.detail-item:last-child {
    margin-bottom: 0;
}

.detail-label {
    color: var(--citrus-gray-600);
}

.detail-value {
    font-weight: 600;
    color: var(--citrus-dark);
}

.status-badge {
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 600;
}

.status-pending {
    background: #FFF3E0;
    color: var(--citrus-warning);
}

.status-approved {
    background: #E8F5E8;
    color: var(--citrus-success);
}

.modal-footer {
    padding: 20px;
    text-align: center;
    border-top: 1px solid var(--citrus-gray-200);
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
    
    .card {
        padding: 20px;
    }
    
    .upload-area {
        padding: 20px;
    }
    
    .user-info {
        flex-direction: column;
        gap: 10px;
    }
}
</style>