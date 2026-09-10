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

    coverageThreshold: {
        global: {statements: 100, branches: 100, functions: 100, lines: 100}
    },

    clearMocks: true

};
