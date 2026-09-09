module.exports = {
    testEnvironment: 'node',

    testMath: [
        '<rootDir>/test/**/*.test.js'
    ],

    collectCoverageFrom: [
        'src/**/*.js'
    ],

    coverageDirectory: '<rootDir>/../reports/coverage/backend',

    coverageReports: [
        'text',
        'html',
        'lcov',
        'json-summary'
    ],

    clearMocks: true

};