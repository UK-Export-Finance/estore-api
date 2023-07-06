import { withEnvironmentVariableParsingUnitTests } from '@ukef-test/common-tests/environment-variable-parsing-unit-tests';

import sharepointConfig, { SharepointConfig } from './sharepoint.config';

describe('sharepointConfig', () => {
  const configDirectlyFromEnvironmentVariables: { configPropertyName: keyof SharepointConfig; environmentVariableName: string }[] = [
    {
      configPropertyName: 'tfisFacilityHiddenListTermStoreId',
      environmentVariableName: 'SHAREPOINT_TFIS_FACILITY_HIDDEN_LIST_TERM_STORE_ID',
    },
    {
      configPropertyName: 'tfisFacilityListId',
      environmentVariableName: 'SHAREPOINT_TFIS_FACILITY_LIST_ID',
    },
    {
      configPropertyName: 'tfisDealListId',
      environmentVariableName: 'SHAREPOINT_TFIS_DEAL_LIST_ID',
    },
    {
      configPropertyName: 'tfisCaseSitesListId',
      environmentVariableName: 'SHAREPOINT_TFIS_CASE_SITES_LIST_ID',
    },
    {
      configPropertyName: 'taxonomyHiddenListTermStoreListId',
      environmentVariableName: 'SHAREPOINT_TAXONOMY_HIDDEN_LIST_TERM_STORE_LIST_ID',
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
    {
      configPropertyName: 'scSiteFullUrl',
      environmentVariableNames: ['SHAREPOINT_MAIN_SITE_NAME', 'SHAREPOINT_SC_SITE_NAME'],
      getExpectedResult: (environmentVariableValues: string[]) =>
        `https://${environmentVariableValues[0]}.sharepoint.com/sites/${environmentVariableValues[1]}`,
    },

    {
      configPropertyName: 'scSiteFullUrl',
      environmentVariableNames: ['SHAREPOINT_MAIN_SITE_NAME', 'SHAREPOINT_SC_SITE_NAME'],
      getExpectedResult: (environmentVariableValues: string[]) =>
        `https://${environmentVariableValues[0]}.sharepoint.com/sites/${environmentVariableValues[1]}`,
    },
  ];

  withEnvironmentVariableParsingUnitTests({
    configDirectlyFromEnvironmentVariables,
    configModifiedFromEnvironmentVariables,
    getConfig: () => sharepointConfig(),
  });
});
