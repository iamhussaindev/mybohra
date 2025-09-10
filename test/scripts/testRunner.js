#!/usr/bin/env node

const { execSync } = require("child_process")
const path = require("path")

// Test configuration
const testConfig = {
  // Test patterns
  patterns: {
    unit: "test/**/*.test.ts",
    integration: "test/**/*.test.tsx",
    components: "test/components/**/*.test.tsx",
    hooks: "test/hooks/**/*.test.tsx",
    models: "test/models/**/*.test.ts",
    helpers: "test/helpers/**/*.test.ts",
    utils: "test/utils/**/*.test.ts",
  },

  // Coverage thresholds
  coverage: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },

  // Test environments
  environments: {
    unit: "node",
    integration: "jsdom",
    components: "jsdom",
  },
}

// Available test commands
const commands = {
  // Run all tests
  all: () => runTests(""),

  // Run specific test types
  unit: () => runTests(testConfig.patterns.unit),
  integration: () => runTests(testConfig.patterns.integration),
  components: () => runTests(testConfig.patterns.components),
  hooks: () => runTests(testConfig.patterns.hooks),
  models: () => runTests(testConfig.patterns.models),
  helpers: () => runTests(testConfig.patterns.helpers),
  utils: () => runTests(testConfig.patterns.utils),

  // Run with coverage
  coverage: () => runTests("", { coverage: true }),
  "coverage:unit": () => runTests(testConfig.patterns.unit, { coverage: true }),
  "coverage:integration": () => runTests(testConfig.patterns.integration, { coverage: true }),

  // Run in watch mode
  watch: () => runTests("", { watch: true }),
  "watch:unit": () => runTests(testConfig.patterns.unit, { watch: true }),
  "watch:components": () => runTests(testConfig.patterns.components, { watch: true }),

  // Run with verbose output
  verbose: () => runTests("", { verbose: true }),

  // Run with specific test name pattern
  grep: (pattern) => runTests("", { grep: pattern }),

  // Run tests in parallel
  parallel: () => runTests("", { maxWorkers: "50%" }),

  // Run tests with specific timeout
  timeout: (ms) => runTests("", { timeout: ms }),

  // Run tests with specific environment
  env: (env) => runTests("", { testEnvironment: env }),

  // Run tests with specific reporter
  reporter: (reporter) => runTests("", { reporter }),

  // Run tests with specific config
  config: (configPath) => runTests("", { config: configPath }),

  // Run tests with specific setup
  setup: (setupPath) => runTests("", { setupFilesAfterEnv: setupPath }),

  // Run tests with specific testPathPattern
  pattern: (pattern) => runTests(pattern),

  // Run tests with specific testNamePattern
  name: (name) => runTests("", { testNamePattern: name }),

  // Run tests with specific testPathIgnorePatterns
  ignore: (patterns) => runTests("", { testPathIgnorePatterns: patterns }),

  // Run tests with specific transformIgnorePatterns
  transformIgnore: (patterns) => runTests("", { transformIgnorePatterns: patterns }),

  // Run tests with specific moduleNameMapping
  moduleNameMapping: (mapping) => runTests("", { moduleNameMapping: mapping }),

  // Run tests with specific collectCoverageFrom
  collectCoverageFrom: (patterns) => runTests("", { collectCoverageFrom: patterns }),

  // Run tests with specific coverageThreshold
  coverageThreshold: (threshold) => runTests("", { coverageThreshold: threshold }),

  // Run tests with specific coverageReporters
  coverageReporters: (reporters) => runTests("", { coverageReporters: reporters }),

  // Run tests with specific coverageDirectory
  coverageDirectory: (dir) => runTests("", { coverageDirectory: dir }),

  // Run tests with specific coveragePathIgnorePatterns
  coveragePathIgnorePatterns: (patterns) => runTests("", { coveragePathIgnorePatterns: patterns }),

  // Run tests with specific coverageCollector
  coverageCollector: (collector) => runTests("", { coverageCollector: collector }),

  // Run tests with specific coverageProvider
  coverageProvider: (provider) => runTests("", { coverageProvider: provider }),

  // Run tests with specific coverageThreshold
  coverageThreshold: (threshold) => runTests("", { coverageThreshold: threshold }),
}

// Helper function to run tests
function runTests(pattern, options = {}) {
  const jestArgs = []

  // Add pattern if provided
  if (pattern) {
    jestArgs.push(pattern)
  }

  // Add options
  if (options.coverage) {
    jestArgs.push("--coverage")
  }

  if (options.watch) {
    jestArgs.push("--watch")
  }

  if (options.verbose) {
    jestArgs.push("--verbose")
  }

  if (options.grep) {
    jestArgs.push("--testNamePattern", options.grep)
  }

  if (options.maxWorkers) {
    jestArgs.push("--maxWorkers", options.maxWorkers)
  }

  if (options.timeout) {
    jestArgs.push("--testTimeout", options.timeout)
  }

  if (options.testEnvironment) {
    jestArgs.push("--testEnvironment", options.testEnvironment)
  }

  if (options.reporter) {
    jestArgs.push("--reporters", options.reporter)
  }

  if (options.config) {
    jestArgs.push("--config", options.config)
  }

  if (options.setupFilesAfterEnv) {
    jestArgs.push("--setupFilesAfterEnv", options.setupFilesAfterEnv)
  }

  if (options.testNamePattern) {
    jestArgs.push("--testNamePattern", options.testNamePattern)
  }

  if (options.testPathIgnorePatterns) {
    jestArgs.push("--testPathIgnorePatterns", options.testPathIgnorePatterns)
  }

  if (options.transformIgnorePatterns) {
    jestArgs.push("--transformIgnorePatterns", options.transformIgnorePatterns)
  }

  if (options.moduleNameMapping) {
    jestArgs.push("--moduleNameMapping", options.moduleNameMapping)
  }

  if (options.collectCoverageFrom) {
    jestArgs.push("--collectCoverageFrom", options.collectCoverageFrom)
  }

  if (options.coverageThreshold) {
    jestArgs.push("--coverageThreshold", options.coverageThreshold)
  }

  if (options.coverageReporters) {
    jestArgs.push("--coverageReporters", options.coverageReporters)
  }

  if (options.coverageDirectory) {
    jestArgs.push("--coverageDirectory", options.coverageDirectory)
  }

  if (options.coveragePathIgnorePatterns) {
    jestArgs.push("--coveragePathIgnorePatterns", options.coveragePathIgnorePatterns)
  }

  if (options.coverageCollector) {
    jestArgs.push("--coverageCollector", options.coverageCollector)
  }

  if (options.coverageProvider) {
    jestArgs.push("--coverageProvider", options.coverageProvider)
  }

  // Run jest
  const command = `npx jest ${jestArgs.join(" ")}`
  console.log(`Running: ${command}`)

  try {
    execSync(command, { stdio: "inherit" })
  } catch (error) {
    console.error("Test execution failed:", error.message)
    process.exit(1)
  }
}

// CLI interface
function main() {
  const args = process.argv.slice(2)
  const command = args[0]
  const params = args.slice(1)

  if (!command || !commands[command]) {
    console.log("Available commands:")
    Object.keys(commands).forEach((cmd) => {
      console.log(`  ${cmd}`)
    })
    process.exit(1)
  }

  try {
    commands[command](...params)
  } catch (error) {
    console.error(`Error running command '${command}':`, error.message)
    process.exit(1)
  }
}

// Export for programmatic use
module.exports = {
  commands,
  runTests,
  testConfig,
}

// Run CLI if called directly
if (require.main === module) {
  main()
}
