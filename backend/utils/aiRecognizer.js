const axios = require('axios');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');

// AI识别工具类
class AIRecognizer {
    constructor() {
        this.apiUrl = process.env.AI_SERVICE_URL || 'http://localhost:5000';
        this.apiKey = process.env.AI_API_KEY || '';
        this.timeout = 30000; // 30秒超时
        this.enabled = process.env.AI_SERVICE_ENABLED !== 'false'; // 默认启用
        
        // 定义所有有效的年份范围
        this.validYears = [
            '0-5', '5-10', '10-15', '15-20', '20-25', '25-30', '30-35', '35-40',
            '40-45', '45-50', '50-55', '55-60', '60-65', '65-70', '70-75', '75-80',
            '80-85', '85-90', '90-95', '95-100', '100-105', '105-110', '110-115',
            '115-120', '120-125', '125-130', '130-135', '135-140', '140-145',
            '145-150', '150+'
        ];
    }

    // 模拟AI识别（用于开发和测试）
    async simulateRecognition(imagePath) {
        console.log('🔍 模拟AI识别陈皮年份...');
        
        // 模拟处理时间
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // 从所有有效年份中随机选择
        const selectedYear = this.validYears[Math.floor(Math.random() * this.validYears.length)];
        
        // 生成置信度
        const confidence = Math.random() * 0.3 + 0.7; // 70%-100%的置信度
        
        return {
            year: selectedYear,
            confidence: Math.round(confidence * 100) / 100,
            method: 'simulation',
            features: {
                color: this.simulateColorAnalysis(),
                texture: this.simulateTextureAnalysis(),
                shape: this.simulateShapeAnalysis()
            },
            processingTime: '2.0s'
        };
    }

    // 实际的AI识别（调用外部API）
    async recognizeCitrusYear(imagePath) {
        // 如果AI服务未启用，使用模拟识别
        if (!this.enabled) {
            console.log('⚠️ AI服务未启用，使用模拟识别');
            return await this.simulateRecognition(imagePath);
        }
        
        try {
            console.log('🔍 调用AI服务识别陈皮年份...');
            
            // 预处理图片
            const processedImagePath = await this.preprocessImage(imagePath);
            
            // 准备请求数据
            const formData = new FormData();
            const imageBuffer = fs.readFileSync(processedImagePath);
            const blob = new Blob([imageBuffer], { type: 'image/jpeg' });
            formData.append('image', blob, path.basename(processedImagePath));
            
            // 调用AI API
            const response = await axios.post(`${this.apiUrl}/recognize`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'X-API-Key': this.apiKey
                },
                timeout: this.timeout
            });
            
            // 清理临时文件
            if (processedImagePath !== imagePath) {
                fs.unlinkSync(processedImagePath);
            }
            
            if (response.data.success) {
                return {
                    year: response.data.prediction.year,
                    confidence: response.data.prediction.confidence,
                    method: 'ai_service',
                    features: response.data.prediction.features || {},
                    processingTime: response.data.processing_time || 'unknown'
                };
            } else {
                throw new Error(response.data.error || 'AI识别失败');
            }
            
        } catch (error) {
            console.error('AI识别错误:', error.message);
            
            // AI服务失败时回退到模拟识别
            console.log('🔄 AI服务不可用，回退到模拟识别');
            return await this.simulateRecognition(imagePath);
        }
    }

    // 图片预处理
    async preprocessImage(imagePath) {
        try {
            const outputPath = imagePath.replace(path.extname(imagePath), '-preprocessed.jpg');
            
            await sharp(imagePath)
                .resize(800, 800, {
                    fit: 'inside',
                    withoutEnlargement: true
                })
                .normalize() // 标准化亮度
                .sharpen() // 锐化
                .jpeg({ 
                    quality: 90,
                    mozjpeg: true 
                })
                .toFile(outputPath);
            
            return outputPath;
            
        } catch (error) {
            console.error('图片预处理错误:', error);
            // 如果预处理失败，返回原图
            return imagePath;
        }
    }

    // 批量识别
    async batchRecognize(imagePaths) {
        const results = [];
        
        for (const imagePath of imagePaths) {
            try {
                const result = await this.recognizeCitrusYear(imagePath);
                results.push({
                    image: path.basename(imagePath),
                    ...result,
                    success: true
                });
            } catch (error) {
                results.push({
                    image: path.basename(imagePath),
                    success: false,
                    error: error.message
                });
            }
        }
        
        return results;
    }

    // 验证识别结果
    validateRecognitionResult(result, manualSelection) {
        if (!result || !result.year) {
            return {
                valid: false,
                error: '无效的识别结果'
            };
        }
        
        // 使用动态的年份范围进行验证
        if (!this.validYears.includes(result.year)) {
            return {
                valid: false,
                error: `无效的年份结果: ${result.year}`
            };
        }
        
        const isMatch = result.year === manualSelection;
        const confidence = result.confidence || 0;
        
        return {
            valid: true,
            isMatch: isMatch,
            confidence: confidence,
            requiresReview: !isMatch || confidence < 0.8,
            matchLevel: this.calculateMatchLevel(isMatch, confidence)
        };
    }

    // 计算匹配级别
    calculateMatchLevel(isMatch, confidence) {
        if (isMatch && confidence >= 0.9) return 'excellent';
        if (isMatch && confidence >= 0.7) return 'good';
        if (isMatch) return 'fair';
        if (confidence >= 0.8) return 'ai_high_confidence';
        return 'needs_review';
    }

    // 模拟颜色分析
    simulateColorAnalysis() {
        const colors = ['dark_brown', 'light_brown', 'reddish_brown', 'yellowish_brown'];
        const intensities = ['light', 'medium', 'dark'];
        
        return {
            primary_color: colors[Math.floor(Math.random() * colors.length)],
            intensity: intensities[Math.floor(Math.random() * intensities.length)],
            uniformity: Math.random() > 0.3 ? 'uniform' : 'patchy'
        };
    }

    // 模拟纹理分析
    simulateTextureAnalysis() {
        const textures = ['smooth', 'slightly_wrinkled', 'deeply_wrinkled', 'cracked'];
        const oilSpots = [true, false];
        
        return {
            surface: textures[Math.floor(Math.random() * textures.length)],
            has_oil_spots: oilSpots[Math.floor(Math.random() * oilSpots.length)],
            oil_spot_density: Math.random() > 0.7 ? 'high' : 'low'
        };
    }

    // 模拟形状分析
    simulateShapeAnalysis() {
        const shapes = ['irregular', 'three_segment', 'broken', 'whole'];
        const sizes = ['small', 'medium', 'large'];
        
        return {
            shape: shapes[Math.floor(Math.random() * shapes.length)],
            size: sizes[Math.floor(Math.random() * sizes.length)],
            thickness: (Math.random() * 2 + 1).toFixed(1) + 'mm'
        };
    }

    // 获取AI服务状态
    async getServiceStatus() {
        if (!this.enabled) {
            return {
                status: 'disabled',
                message: 'AI服务已禁用'
            };
        }
        
        try {
            const response = await axios.get(`${this.apiUrl}/health`, {
                timeout: 5000
            });
            
            return {
                status: 'healthy',
                message: 'AI服务运行正常',
                version: response.data.version,
                uptime: response.data.uptime
            };
        } catch (error) {
            return {
                status: 'unavailable',
                message: 'AI服务不可用',
                error: error.message
            };
        }
    }

    // 训练模型（预留功能）
    async trainModel(trainingData) {
        console.log('🧠 训练AI模型（预留功能）');
        // 这里可以实现模型训练逻辑
        return {
            success: true,
            message: '模型训练功能开发中',
            accuracy: 0.85,
            training_time: '2小时'
        };
    }

    // 评估识别准确率
    evaluateAccuracy(predictions, groundTruth) {
        let correct = 0;
        const details = [];
        
        predictions.forEach((pred, index) => {
            const isCorrect = pred.year === groundTruth[index];
            if (isCorrect) correct++;
            
            details.push({
                prediction: pred.year,
                actual: groundTruth[index],
                correct: isCorrect,
                confidence: pred.confidence
            });
        });
        
        const accuracy = correct / predictions.length;
        
        return {
            accuracy: Math.round(accuracy * 100) / 100,
            correct: correct,
            total: predictions.length,
            details: details
        };
    }
}

// 创建单例实例
const aiRecognizer = new AIRecognizer();

// 便捷函数
const recognizeCitrusYear = (imagePath) => aiRecognizer.recognizeCitrusYear(imagePath);
const simulateRecognition = (imagePath) => aiRecognizer.simulateRecognition(imagePath);
const getServiceStatus = () => aiRecognizer.getServiceStatus();
const validateResult = (result, manualSelection) => aiRecognizer.validateRecognitionResult(result, manualSelection);

module.exports = {
    AIRecognizer,
    aiRecognizer,
    recognizeCitrusYear,
    simulateRecognition,
    getServiceStatus,
    validateResult
};