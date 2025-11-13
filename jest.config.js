const { defaults: tsjPreset } = require("ts-jest/presets")

const thirdPartyIgnorePatterns = [
  "((jest-)?react-native|@react-native(-community)?)",
  "expo(nent)?",
  "@expo(nent)?/.*",
  "@expo-google-fonts/.*",
  "react-navigation",
  "@react-navigation/.*",
  "@unimodules/.*",
  "unimodules",
  "sentry-expo",
  "native-base",
  "react-native-svg",
  "react-clone-referenced-element",
  "react-native-code-push",
]

/** @type {import('@jest/types').Config.ProjectConfig} */
module.exports = {
  ...tsjPreset,
  preset: "react-native",
  transformIgnorePatterns: [
    `<rootDir>/node_modules/(?!${thirdPartyIgnorePatterns.join("|")})`,
    "jest-runner",
  ],
  testPathIgnorePatterns: ["<rootDir>/node_modules/", "<rootDir>/.maestro/", "@react-native"],
  setupFiles: ["<rootDir>/test/setup.ts"],
  testEnvironment: "node",
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/app/$1",
    "^app/(.*)$": "<rootDir>/app/$1",
  },
  collectCoverageFrom: [
    "app/**/*.{ts,tsx}",
    "!app/**/*.d.ts",
    "!app/**/index.ts",
    "!app/**/*.stories.{ts,tsx}",
    "!app/**/__tests__/**",
    "!app/**/test/**",
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
  transform: {
    "^.+\\.test.tsx?$": [
      "ts-jest",
      {
        tsconfig: "<rootDir>/test/test-tsconfig.json",
      },
    ],
  },
}
