const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    baseUrl: process.env.FRONTEND_BASE_URL || 'http://localhost:3000',
    supportFile: 'cypress/support/e2e.js',
    specPattern: 'cypress/e2e/**/*.cy.js'
  },
  reporter: 'junit',
  reporterOptions: {
    mochaFile: '../reports/e2e-[hash].xml',
    toConsole: true
  },
  viewportWidth: 1280,
  viewportHeight: 720,
  video: false,
  screenshotOnRunFailure: true
});
