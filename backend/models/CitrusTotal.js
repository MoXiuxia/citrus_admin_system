const { getPool } = require('../config/database');

class CitrusTotal {
    // 获取所有年份库存
    static async findAll() {
        const pool = getPool();
        
        const [stockData] = await pool.promise().query(
            'SELECT * FROM citrus_total ORDER BY year_range'
        );
        
        return stockData.map(item => this.mapStock(item));
    }

    // 根据年份范围获取库存
    static async findByYearRange(yearRange) {
        const pool = getPool();
        
        const [stockData] = await pool.promise().query(
            'SELECT * FROM citrus_total WHERE year_range = ?',
            [yearRange]
        );
        
        if (stockData.length === 0) {
            return null;
        }
        
        return this.mapStock(stockData[0]);
    }

    // 更新库存
    static async updateStock(yearRange, weight) {
        const pool = getPool();
        
        // 检查年份范围是否存在
        const existingStock = await this.findByYearRange(yearRange);
        if (!existingStock) {
            throw new Error('无效的年份范围');
        }
        
        await pool.promise().query(
            'UPDATE citrus_total SET stock_weight = stock_weight + ? WHERE year_range = ?',
            [parseFloat(weight), yearRange]
        );
        
        return await this.findByYearRange(yearRange);
    }

    // 设置库存
    static async setStock(yearRange, weight) {
        const pool = getPool();
        
        // 检查年份范围是否存在
        const existingStock = await this.findByYearRange(yearRange);
        if (!existingStock) {
            throw new Error('无效的年份范围');
        }
        
        await pool.promise().query(
            'UPDATE citrus_total SET stock_weight = ? WHERE year_range = ?',
            [parseFloat(weight), yearRange]
        );
        
        return await this.findByYearRange(yearRange);
    }

    // 获取库存统计
    static async getStats() {
        const pool = getPool();
        
        const [totalResult] = await pool.promise().query(
            'SELECT SUM(stock_weight) as total_stock FROM citrus_total'
        );
        
        const [yearDistribution] = await pool.promise().query(
            'SELECT year_range, stock_weight FROM citrus_total ORDER BY year_range'
        );
        
        return {
            totalStock: totalResult[0].total_stock || 0,
            yearDistribution: yearDistribution.map(item => this.mapStock(item))
        };
    }

    // 重置所有库存
    static async resetAllStocks() {
        const pool = getPool();
        
        await pool.promise().query(
            'UPDATE citrus_total SET stock_weight = 0'
        );
        
        return await this.findAll();
    }

    // 映射库存数据
    static mapStock(stock) {
        return {
            id: stock.id,
            yearRange: stock.year_range,
            stockWeight: parseFloat(stock.stock_weight),
            createdAt: stock.created_at,
            updatedAt: stock.updated_at
        };
    }
}

module.exports = CitrusTotal;