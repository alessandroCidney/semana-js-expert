/*
 * For a detailed explanation regarding each configuration property, visit:
 * https://jestjs.io/docs/configuration
 */

export default {
  clearMocks: true,

  // Para limpeza dos Mocks
  restoreMocks: true,
  
  // collectCoverage: true,
  coverageDirectory: "coverage",
  coverageProvider: "v8",
  coverageReporters: [
    "text",
    "lcov"
  ],
  testEnvironment: "node",
  
  // Definindo a cobertura dos testes (porcentagem para cada item)
  coverageThreshold: {
    global: {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100
    }
  },

  // Não observar a pasta node_modules
  watchPathIgnorePatterns: [
    "node_modules"
  ],

  // Ignorar transformações no JEST no node_modules
  transformIgnorePatterns: [
    "node_modules"
  ],

  // De onde virá a coverage ("cobertura" dos testes)
  // Consideraremos qualquer arquivo JS, exceto arquivos index.js
  collectCoverageFrom: [
    "src/**/*.js", "!src/**/index.js"
  ]
};
