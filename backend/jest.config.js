module.exports = {
    testEnvironment: 'node',
    verbose: true,
    // Set a timeout for tests
    testTimeout: 10000,
    // Automatically clear mock calls and instances between every test
    clearMocks: true,
    // The directory where Jest should output its coverage files
    coverageDirectory: "coverage",
    // Collect coverage from specific directories
    collectCoverageFrom: [
        "controllers/**/*.js",
        "middlewares/**/*.js",
        "!**/node_modules/**"
    ],
    // Handle setup files
    setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
    // Force Jest to exit after all tests complete
    forceExit: true,
    // Indicates whether each individual test should be reported during the run
    verbose: true,
}; 