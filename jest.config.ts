import { JestConfigWithTsJest } from 'ts-jest';

const tsJestConfig = {
  isolatedModules: true,
  module: 'ESNext',
  rootDir: '.',
};

const defaultSettings = {
  rootDir: 'test',
  testEnvironment: 'node',
  moduleFileExtensions: ['ts', 'js', 'json', 'node'],
  moduleNameMapper: {
    '@ukef/constants/(.*)': '<rootDir>/../src/constants/$1',
    '@ukef/config/(.*)': '<rootDir>/../src/config/$1',
    '@ukef/helpers/(.*)': '<rootDir>/../src/helpers/$1',
    '@ukef/modules/(.*)': '<rootDir>/../src/modules/$1',
    '@ukef/(.*)': '<rootDir>/../src/$1',
    '@ukef/auth/(.*)': '<rootDir>/../src/modules/auth/$1',
    '@ukef-test/(.*)': '<rootDir>../test/$1',
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
};

const config: JestConfigWithTsJest = {
  projects: [
    {
      displayName: 'Unit',
      setupFilesAfterEnv: ['../test/setup/mock-nestjs-axios.ts'],
      testMatch: ['**/*.test.ts'],
      preset: 'ts-jest/presets/default-esm',
      extensionsToTreatAsEsm: ['.ts'],
      transform: { '^.+\\.(ts|tsx)?$': ['ts-jest', { useESM: true, tsconfig: tsJestConfig as any }] },
      ...defaultSettings,
      rootDir: 'src',
    },
    {
      displayName: 'API',
      setupFilesAfterEnv: ['./setup/override-environment-variables.ts'],
      testMatch: ['**/*.api-test.ts'],
      preset: 'ts-jest/presets/default-esm',
      extensionsToTreatAsEsm: ['.ts'],
      transform: { '^.+\\.(ts|tsx)?$': ['ts-jest', { useESM: true, tsconfig: tsJestConfig as any }] },
      ...defaultSettings,
    },
  ],
  reporters: [['default', { summaryThreshold: 1 }]],
};

export default config;


