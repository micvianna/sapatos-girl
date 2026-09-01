const { defineConfig } = require('cypress');

module.exports = defineConfig({
  expose: {
    API_BASE_URL: process.env.CYPRESS_API_BASE_URL || 'http://localhost:5000'
  },
  e2e: {
    baseUrl: process.env.FRONTEND_BASE_URL || 'http://localhost:3000',
    supportFile: 'cypress/support/e2e.js',
    specPattern: 'cypress/e2e/**/*.cy.js'
  },
  reporter: 'cypress-multi-reporters',
  reporterOptions: {
    configFile: 'reporter-config.json'
  },
  viewportWidth: 1280,
  viewportHeight: 720,
  video: false,
  screenshotOnRunFailure: true
});
