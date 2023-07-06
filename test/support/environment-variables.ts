import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';

const valueGenerator = new RandomValueGenerator();

export const ENVIRONMENT_VARIABLES = Object.freeze({
  NODE_ENV: 'test',
  TZ: 'Europe/London',
  LOG_LEVEL: 'debug',

  SWAGGER_USER: valueGenerator.string(),
  SWAGGER_PASSWORD: valueGenerator.string(),

  API_KEY: valueGenerator.string(),

  GRAPH_BASE_URL: valueGenerator.httpsUrl(),
  GRAPH_AUTHENTICATION_TENANT_ID: valueGenerator.string(),
  GRAPH_AUTHENTICATION_CLIENT_ID: valueGenerator.string(),
  GRAPH_AUTHENTICATION_CLIENT_SECRET: valueGenerator.string(),

  SHAREPOINT_MAIN_SITE_NAME: valueGenerator.word(),
  SHAREPOINT_TFIS_SITE_NAME: valueGenerator.word(),
  SHAREPOINT_SC_SITE_NAME: valueGenerator.word(),
  SHAREPOINT_TFIS_TERM_STORE: valueGenerator.word(),
  SHAREPOINT_TFIS_FACILITY_LIST_ID: valueGenerator.word(),
  SHAREPOINT_TFIS_FACILITY_HIDDEN_LIST_TERM_STORE_ID: valueGenerator.word(),
  SHAREPOINT_TFIS_DEAL_LIST_ID: valueGenerator.word(),
  SHAREPOINT_TFIS_CASE_SITES_LIST_ID: valueGenerator.word(),
  SHAREPOINT_TAXONOMY_HIDDEN_LIST_TERM_STORE_LIST_ID: valueGenerator.word(),

  APIM_MDM_URL: valueGenerator.httpsUrl(),
  APIM_MDM_KEY: valueGenerator.word(),
  APIM_MDM_VALUE: valueGenerator.string(),
  APIM_MDM_MAX_REDIRECTS: 0,
  APIM_MDM_TIMEOUT: 1000,

  DTFS_STORAGE_ACCOUNT_NAME: valueGenerator.word(),
  DTFS_STORAGE_ACCOUNT_KEY: valueGenerator.word(),
  DTFS_STORAGE_FILE_SHARE_NAME: valueGenerator.word(),
  DTFS_STORAGE_EXAMPLE_FILE_NAME: valueGenerator.word(),
  DTFS_STORAGE_EXAMPLE_FILE_LOCATION_PATH: valueGenerator.word(),

  CUSTODIAN_BASE_URL: valueGenerator.httpsUrl(),
  CUSTODIAN_API_KEY_HEADER_NAME: valueGenerator.word(),
  CUSTODIAN_API_KEY_HEADER_VALUE: valueGenerator.string(),
  CUSTODIAN_MAX_REDIRECTS: 0,
  CUSTODIAN_TIMEOUT: 1000,
  CUSTODIAN_DEAL_TEMPLATE_ID: valueGenerator.word(),
  CUSTODIAN_DEAL_TYPE_GUID: valueGenerator.guid(),
  CUSTODIAN_FACILITY_TEMPLATE_ID: valueGenerator.word(),
  CUSTODIAN_FACILITY_TYPE_GUID: valueGenerator.guid(),
});

export const getEnvironmentVariablesForProcessEnv = (): NodeJS.ProcessEnv => ({
  ...ENVIRONMENT_VARIABLES,
  APIM_MDM_MAX_REDIRECTS: ENVIRONMENT_VARIABLES.APIM_MDM_MAX_REDIRECTS.toString(),
  APIM_MDM_TIMEOUT: ENVIRONMENT_VARIABLES.APIM_MDM_TIMEOUT.toString(),
  CUSTODIAN_MAX_REDIRECTS: ENVIRONMENT_VARIABLES.CUSTODIAN_MAX_REDIRECTS.toString(),
  CUSTODIAN_TIMEOUT: ENVIRONMENT_VARIABLES.CUSTODIAN_TIMEOUT.toString(),
});

const delayToExceedTimeoutByInMilliseconds = 1;

export const TIME_EXCEEDING_CUSTODIAN_TIMEOUT = ENVIRONMENT_VARIABLES.CUSTODIAN_TIMEOUT + delayToExceedTimeoutByInMilliseconds;
