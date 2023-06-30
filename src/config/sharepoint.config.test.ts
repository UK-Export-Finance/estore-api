import { withEnvironmentVariableParsingUnitTests } from '@ukef-test/common-tests/environment-variable-parsing-unit-tests';

import sharepointConfig, { SharepointConfig } from './sharepoint.config';

describe('sharepointConfig', () => {
  const configDirectlyFromEnvironmentVariables: { configPropertyName: keyof SharepointConfig; environmentVariableName: string }[] = [
    {
      configPropertyName: 'tfisListId',
      environmentVariableName: 'SHAREPOINT_TFIS_LIST_ID',
    },
    {
      configPropertyName: 'tfisTermStoreId',
      environmentVariableName: 'SHAREPOINT_TFIS_TERM_STORE',
    },
    {
      configPropertyName: 'tfisFacilityListId',
      environmentVariableName: 'SHAREPOINT_TFIS_FACILITY_LIST_ID',
    },
  ];

  const configModifiedFromEnvironmentVariables: {
    configPropertyName: keyof SharepointConfig;
    environmentVariableNames: string[];
    getExpectedResult: (environmentVariableValues: string[]) => string;
  }[] = [
    {
      configPropertyName: 'tfisSharepointUrl',
      environmentVariableNames: ['SHAREPOINT_MAIN_SITE_NAME', 'SHAREPOINT_TFIS_SITE_NAME'],
      getExpectedResult: (environmentVariableValues: string[]) => `sites/${environmentVariableValues[0]}.sharepoint.com:/sites/${environmentVariableValues[1]}`,
    },
    {
      configPropertyName: 'scSharepointUrl',
      environmentVariableNames: ['SHAREPOINT_MAIN_SITE_NAME', 'SHAREPOINT_SC_SITE_NAME'],
      getExpectedResult: (environmentVariableValues: string[]) => `sites/${environmentVariableValues[0]}.sharepoint.com:/sites/${environmentVariableValues[1]}`,
    },
  ];

  withEnvironmentVariableParsingUnitTests({
    configDirectlyFromEnvironmentVariables,
    configModifiedFromEnvironmentVariables,
    getConfig: () => sharepointConfig(),
  });
});
