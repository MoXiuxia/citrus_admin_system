module.exports = {
    testEnvironment: 'jsdom',
    setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
    moduleNameMapping: {
      '^@/(.*)$': '<rootDir>/src/$1'
    },
    transform: {
      '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
      '^.+\\.vue$': '@vue/vue3-jest'
    },
    testMatch: [
      '**/tests/unit/**/*.test.js',
      '**/tests/integration/**/*.test.js'
    ],
    collectCoverageFrom: [
      'src/**/*.{js,vue}',
      '!src/main.js'
    ]
  }