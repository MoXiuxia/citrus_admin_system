const { defineConfig } = require('cypress')

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    specPattern: 'tests/e2e/**/*.test.js',
    supportFile: 'tests/support/e2e.js',
    fixturesFolder: 'tests/fixtures',
    viewportWidth: 1280,
    viewportHeight: 720,
    setupNodeEvents(on, config) {
      // 实现节点事件监听器
    }
  }
})