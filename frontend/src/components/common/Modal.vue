<template>
    <transition name="modal">
        <div class="modal-overlay" v-if="show" @click.self="close">
            <div class="modal-container" :class="[size, type]">
                <!-- 头部 -->
                <div class="modal-header" v-if="title || $slots.header">
                    <div class="modal-title">
                        <slot name="header">
                            <span class="title-icon" v-if="icon">{{ icon }}</span>
                            <h3>{{ title }}</h3>
                        </slot>
                    </div>
                    <button class="modal-close" @click="close" v-if="closable">
                        <span class="close-icon">✕</span>
                    </button>
                </div>

                <!-- 内容 -->
                <div class="modal-content">
                    <slot name="content">
                        <div class="modal-body">
                            <p>{{ content }}</p>
                        </div>
                    </slot>
                </div>

                <!-- 底部 -->
                <div class="modal-footer" v-if="showFooter || $slots.footer">
                    <slot name="footer">
                        <div class="footer-actions">
                            <button 
                                class="btn btn-secondary" 
                                @click="close"
                                v-if="showCancel"
                            >
                                {{ cancelText }}
                            </button>
                            <button 
                                class="btn btn-primary" 
                                @click="confirm"
                                :disabled="confirmDisabled"
                            >
                                {{ confirmText }}
                            </button>
                        </div>
                    </slot>
                </div>
            </div>
        </div>
    </transition>
</template>

<script>
import { ref, watch, onMounted, onUnmounted } from 'vue'

export default {
    name: 'AppModal',
    props: {
        show: {
            type: Boolean,
            default: false
        },
        title: {
            type: String,
            default: ''
        },
        content: {
            type: String,
            default: ''
        },
        icon: {
            type: String,
            default: ''
        },
        size: {
            type: String,
            default: 'medium',
            validator: (value) => ['small', 'medium', 'large', 'xlarge'].includes(value)
        },
        type: {
            type: String,
            default: 'default',
            validator: (value) => ['default', 'info', 'success', 'warning', 'error'].includes(value)
        },
        closable: {
            type: Boolean,
            default: true
        },
        showCancel: {
            type: Boolean,
            default: true
        },
        showFooter: {
            type: Boolean,
            default: true
        },
        cancelText: {
            type: String,
            default: '取消'
        },
        confirmText: {
            type: String,
            default: '确定'
        },
        confirmDisabled: {
            type: Boolean,
            default: false
        },
        closeOnOverlay: {
            type: Boolean,
            default: true
        },
        closeOnEsc: {
            type: Boolean,
            default: true
        }
    },
    emits: ['update:show', 'close', 'confirm'],
    setup(props, { emit }) {
        // 响应式数据
        const isVisible = ref(props.show)

        // 监听show属性变化
        watch(() => props.show, (newVal) => {
            isVisible.value = newVal
            if (newVal) {
                document.body.style.overflow = 'hidden'
            } else {
                document.body.style.overflow = ''
            }
        })

        // 方法
        const close = () => {
            if (props.closable) {
                emit('update:show', false)
                emit('close')
            }
        }

        const confirm = () => {
            emit('confirm')
        }

        // 键盘事件处理
        const handleKeydown = (event) => {
            if (props.closeOnEsc && event.keyCode === 27) {
                close()
            }
        }

        // 生命周期
        onMounted(() => {
            if (props.closeOnEsc) {
                document.addEventListener('keydown', handleKeydown)
            }
        })

        onUnmounted(() => {
            document.removeEventListener('keydown', handleKeydown)
            document.body.style.overflow = ''
        })

        return {
            isVisible,
            close,
            confirm
        }
    }
}
</script>

<style scoped>
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2000;
    padding: 20px;
}

.modal-container {
    background: white;
    border-radius: 12px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
    max-width: 95vw;
    max-height: 95vh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    animation: modal-appear 0.3s ease-out;
}

/* 模态框尺寸 */
.modal-container.small {
    width: 400px;
}

.modal-container.medium {
    width: 500px;
}

.modal-container.large {
    width: 700px;
}

.modal-container.xlarge {
    width: 900px;
}

/* 模态框类型 */
.modal-container.info .modal-header {
    border-bottom-color: #17a2b8;
}

.modal-container.success .modal-header {
    border-bottom-color: #28a745;
}

.modal-container.warning .modal-header {
    border-bottom-color: #ffc107;
}

.modal-container.error .modal-header {
    border-bottom-color: #dc3545;
}

.modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px 24px;
    border-bottom: 1px solid #e9ecef;
    background: #f8f9fa;
}

.modal-title {
    display: flex;
    align-items: center;
    gap: 12px;
    flex: 1;
}

.title-icon {
    font-size: 20px;
}

.modal-title h3 {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    color: #333;
}

.modal-close {
    background: none;
    border: none;
    font-size: 20px;
    cursor: pointer;
    padding: 4px;
    border-radius: 4px;
    color: #6c757d;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
}

.modal-close:hover {
    background: #e9ecef;
    color: #333;
}

.modal-content {
    flex: 1;
    overflow-y: auto;
    max-height: calc(95vh - 140px);
}

.modal-body {
    padding: 24px;
}

.modal-body p {
    margin: 0;
    line-height: 1.6;
    color: #333;
}

.modal-footer {
    padding: 20px 24px;
    border-top: 1px solid #e9ecef;
    background: #f8f9fa;
}

.footer-actions {
    display: flex;
    gap: 12px;
    justify-content: flex-end;
}

.btn {
    padding: 10px 20px;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    transition: all 0.3s ease;
    min-width: 80px;
}

.btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.btn-secondary {
    background: #6c757d;
    color: white;
}

.btn-secondary:hover:not(:disabled) {
    background: #5a6268;
}

.btn-primary {
    background: #007bff;
    color: white;
}

.btn-primary:hover:not(:disabled) {
    background: #0056b3;
}

/* 动画效果 */
.modal-enter-active,
.modal-leave-active {
    transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
    opacity: 0;
}

.modal-enter-active .modal-container,
.modal-leave-active .modal-container {
    transition: transform 0.3s ease;
}

.modal-enter-from .modal-container,
.modal-leave-to .modal-container {
    transform: scale(0.9) translateY(-20px);
}

@keyframes modal-appear {
    from {
        opacity: 0;
        transform: scale(0.9) translateY(-20px);
    }
    to {
        opacity: 1;
        transform: scale(1) translateY(0);
    }
}

/* 响应式设计 */
@media (max-width: 768px) {
    .modal-overlay {
        padding: 16px;
    }
    
    .modal-container.small,
    .modal-container.medium,
    .modal-container.large,
    .modal-container.xlarge {
        width: 100%;
        max-width: 100%;
    }
    
    .modal-header {
        padding: 16px 20px;
    }
    
    .modal-body {
        padding: 20px;
    }
    
    .modal-footer {
        padding: 16px 20px;
    }
    
    .footer-actions {
        flex-direction: column;
    }
    
    .btn {
        min-width: auto;
        flex: 1;
    }
}

@media (max-width: 480px) {
    .modal-header {
        padding: 12px 16px;
    }
    
    .modal-body {
        padding: 16px;
    }
    
    .modal-footer {
        padding: 12px 16px;
    }
    
    .modal-title h3 {
        font-size: 16px;
    }
}
</style>