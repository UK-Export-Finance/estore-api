import { withEnvironmentVariableParsingUnitTests } from '@ukef-test/common-tests/environment-variable-parsing-unit-tests';

import custodianConfig, { CustodianConfig } from './custodian.config';

describe('custodianConfig', () => {
  const configDirectlyFromEnvironmentVariables: { configPropertyName: keyof CustodianConfig; environmentVariableName: string }[] = [
    {
      configPropertyName: 'baseUrl',
      environmentVariableName: 'CUSTODIAN_BASE_URL',
    },
    {
      configPropertyName: 'apiKeyHeaderName',
      environmentVariableName: 'CUSTODIAN_API_KEY_HEADER_NAME',
    },
    {
      configPropertyName: 'apiKeyHeaderValue',
      environmentVariableName: 'CUSTODIAN_API_KEY_HEADER_VALUE',
    },
    {
      configPropertyName: 'facilityTemplateId',
      environmentVariableName: 'CUSTODIAN_FACILITY_TEMPLATE_ID',
    },
    {
      configPropertyName: 'facilityTypeGuid',
      environmentVariableName: 'CUSTODIAN_FACILITY_TYPE_GUID',
    },
  ];

  const configParsedAsIntFromEnvironmentVariablesWithDefault: {
    configPropertyName: keyof CustodianConfig;
    environmentVariableName: string;
    defaultConfigValue: number;
  }[] = [
    {
      configPropertyName: 'maxRedirects',
      environmentVariableName: 'CUSTODIAN_MAX_REDIRECTS',
      defaultConfigValue: 5,
    },
    {
      configPropertyName: 'timeout',
      environmentVariableName: 'CUSTODIAN_TIMEOUT',
      defaultConfigValue: 30000,
    },
  ];

  withEnvironmentVariableParsingUnitTests({
    configDirectlyFromEnvironmentVariables,
    configParsedAsIntFromEnvironmentVariablesWithDefault,
    getConfig: () => custodianConfig(),
  });
});
