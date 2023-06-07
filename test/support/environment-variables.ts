import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';

const valueGenerator = new RandomValueGenerator();

export const ENVIRONMENT_VARIABLES = Object.freeze({
  NODE_ENV: 'test',
  LOG_LEVEL: 'debug',

  SWAGGER_USER: valueGenerator.string(),
  SWAGGER_PASSWORD: valueGenerator.string(),
  API_KEY: valueGenerator.string(),

  GRAPH_BASE_URL: valueGenerator.httpsUrl(),

  GRAPH_AUTHENTICATION_TENANT_ID: valueGenerator.string(),
  GRAPH_AUTHENTICATION_CLIENT_ID: valueGenerator.string(),
  GRAPH_AUTHENTICATION_CLIENT_SECRET: valueGenerator.string(),
  GRAPH_AUTHENTICATION_AUTHORITY_BASE_URL: valueGenerator.httpsUrl(),
});

export const getEnvironmentVariablesForProcessEnv = (): NodeJS.ProcessEnv => ({
  ...ENVIRONMENT_VARIABLES,
});
