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

  SHAREPOINT_MAIN_SITE_NAME: valueGenerator.string(),
  SHAREPOINT_TFIS_SITE_NAME: valueGenerator.string(),
  SHAREPOINT_TFIS_LIST_ID: valueGenerator.string(),

  APIM_MDM_BASE_URL: valueGenerator.httpsUrl(),
  APIM_MDM_API_KEY_HEADER_NAME: valueGenerator.word(),
  APIM_MDM_API_KEY_HEADER_VALUE: valueGenerator.string(),
  APIM_MDM_MAX_REDIRECTS: 0,
  APIM_MDM_TIMEOUT: 1000,
});

export const getEnvironmentVariablesForProcessEnv = (): NodeJS.ProcessEnv => ({
  ...ENVIRONMENT_VARIABLES,
  APIM_MDM_MAX_REDIRECTS: ENVIRONMENT_VARIABLES.APIM_MDM_MAX_REDIRECTS.toString(),
  APIM_MDM_TIMEOUT: ENVIRONMENT_VARIABLES.APIM_MDM_TIMEOUT.toString(),
});
