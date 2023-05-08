import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';

const valueGenerator = new RandomValueGenerator();

export const ENVIRONMENT_VARIABLES = Object.freeze({
  NODE_ENV: 'test',
  LOG_LEVEL: 'debug',

  SWAGGER_USER: valueGenerator.string(),
  SWAGGER_PASSWORD: valueGenerator.string(),
  API_KEY: valueGenerator.string(),
});

export const getEnvironmentVariablesForProcessEnv = (): NodeJS.ProcessEnv => ({
  ...ENVIRONMENT_VARIABLES,
});
