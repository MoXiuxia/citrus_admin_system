<template>
    <footer class="app-footer">
        <div class="footer-container">
            <!-- 主要 footer 内容 -->
            <div class="footer-main">
                <div class="footer-section">
                    <div class="footer-logo">
                        <span class="logo-icon">🍊</span>
                        <span class="logo-text">陈皮信息管理系统</span>
                    </div>
                    <p class="footer-description">
                        专业的陈皮信息管理平台，提供智能识别、库存管理、审核流程等完整解决方案。
                    </p>
                    <div class="social-links">
                        <a href="#" class="social-link" title="GitHub">
                            <span class="social-icon">📱</span>
                        </a>
                        <a href="#" class="social-link" title="文档">
                            <span class="social-icon">📚</span>
                        </a>
                        <a href="#" class="social-link" title="联系我们">
                            <span class="social-icon">📧</span>
                        </a>
                    </div>
                </div>

                <div class="footer-section">
                    <h4 class="section-title">快速链接</h4>
                    <ul class="footer-links">
                        <li><router-link to="/user" class="footer-link">信息提交</router-link></li>
                        <li><router-link to="/admin" class="footer-link">管理后台</router-link></li>
                        <li><a href="#" class="footer-link">使用指南</a></li>
                        <li><a href="#" class="footer-link">常见问题</a></li>
                    </ul>
                </div>

                <div class="footer-section">
                    <h4 class="section-title">系统信息</h4>
                    <ul class="footer-links">
                        <li><a href="#" class="footer-link">关于我们</a></li>
                        <li><a href="#" class="footer-link">版本信息</a></li>
                        <li><a href="#" class="footer-link">更新日志</a></li>
                        <li><a href="#" class="footer-link">服务状态</a></li>
                    </ul>
                </div>

                <div class="footer-section">
                    <h4 class="section-title">技术支持</h4>
                    <div class="contact-info">
                        <div class="contact-item">
                            <span class="contact-icon">📞</span>
                            <span>400-123-4567</span>
                        </div>
                        <div class="contact-item">
                            <span class="contact-icon">📧</span>
                            <span>support@citrus.com</span>
                        </div>
                        <div class="contact-item">
                            <span class="contact-icon">🕒</span>
                            <span>周一至周五 9:00-18:00</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Footer 底部 -->
            <div class="footer-bottom">
                <div class="footer-copyright">
                    <p>&copy; 2024 陈皮信息管理系统. 保留所有权利.</p>
                </div>
                <div class="footer-links-bottom">
                    <a href="#" class="footer-link">隐私政策</a>
                    <a href="#" class="footer-link">服务条款</a>
                    <a href="#" class="footer-link">Cookie政策</a>
                </div>
            </div>
        </div>
    </footer>
</template>

<script>
export default {
    name: 'AppFooter',
    setup() {
        return {
            // 可以在这里添加响应式数据或方法
        }
    }
}
</script>

<style scoped>
.app-footer {
    background: #2c3e50;
    color: #ecf0f1;
    margin-top: auto;
}

.footer-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 40px 20px 20px;
}

.footer-main {
    display: grid;
    grid-template-columns: 2fr 1fr 1fr 1.5fr;
    gap: 40px;
    margin-bottom: 30px;
}

.footer-section {
    display: flex;
    flex-direction: column;
}

.footer-logo {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 16px;
}

.logo-icon {
    font-size: 24px;
}

.logo-text {
    font-size: 18px;
    font-weight: 600;
    color: white;
}

.footer-description {
    line-height: 1.6;
    margin-bottom: 20px;
    color: #bdc3c7;
    font-size: 14px;
}

.social-links {
    display: flex;
    gap: 12px;
}

.social-link {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    background: rgba(255,255,255,0.1);
    border-radius: 6px;
    transition: all 0.3s ease;
    text-decoration: none;
}

.social-link:hover {
    background: #3498db;
    transform: translateY(-2px);
}

.social-icon {
    font-size: 16px;
}

.section-title {
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 16px;
    color: white;
}

.footer-links {
    list-style: none;
    padding: 0;
    margin: 0;
}

.footer-links li {
    margin-bottom: 8px;
}

.footer-link {
    color: #bdc3c7;
    text-decoration: none;
    font-size: 14px;
    transition: color 0.3s ease;
}

.footer-link:hover {
    color: #3498db;
}

.contact-info {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.contact-item {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 14px;
    color: #bdc3c7;
}

.contact-icon {
    font-size: 16px;
    width: 20px;
    text-align: center;
}

.footer-bottom {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-top: 20px;
    border-top: 1px solid #34495e;
}

.footer-copyright p {
    margin: 0;
    font-size: 14px;
    color: #95a5a6;
}

.footer-links-bottom {
    display: flex;
    gap: 20px;
}

@media (max-width: 1024px) {
    .footer-main {
        grid-template-columns: 1fr 1fr;
        gap: 30px;
    }
}

@media (max-width: 768px) {
    .footer-container {
        padding: 30px 16px 20px;
    }
    
    .footer-main {
        grid-template-columns: 1fr;
        gap: 30px;
    }
    
    .footer-bottom {
        flex-direction: column;
        gap: 16px;
        text-align: center;
    }
    
    .footer-links-bottom {
        justify-content: center;
    }
}

@media (max-width: 480px) {
    .footer-links-bottom {
        flex-direction: column;
        gap: 8px;
    }
}
</style>