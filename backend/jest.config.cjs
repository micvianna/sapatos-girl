module.exports = {
    testEnvironment: 'node',

    testMatch: [
        '<rootDir>/test/**/*.test.js'
    ],

    collectCoverageFrom: [
        'src/**/*.js'
    ],

    coverageDirectory: '<rootDir>/../reports/coverage/backend',

    coverageReporters: [
        'text',
        'html',
        'lcov',
        'json-summary'
    ],

    clearMocks: true

};