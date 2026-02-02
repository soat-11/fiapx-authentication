import type { Config } from 'jest';

const config: Config = {
  // Informa ao Jest para usar o ts-jest para arquivos .ts
  preset: 'ts-jest',
  
  // Define o ambiente de execução (Node.js para Lambdas)
  testEnvironment: 'node',

  // Localização dos arquivos de teste
  roots: ['<rootDir>/src'],

  // Padrão de nomeação dos arquivos de teste
  testMatch: [
    '**/tests/**/*.spec.ts',
    '**/tests/**/*.test.ts'
  ],

  // Coleta de cobertura (Essencial para o requisito de Qualidade de Software do PDF [cite: 14, 38])
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/infra/'
  ],

  // Limpa mocks automaticamente entre cada teste
  clearMocks: true,

  // Configuração para lidar com módulos ES se necessário
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: 'tsconfig.json',
    }],
  },
};

export default config;