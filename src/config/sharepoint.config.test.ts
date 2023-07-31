import { withEnvironmentVariableParsingUnitTests } from '@ukef-test/common-tests/environment-variable-parsing-unit-tests';

import sharepointConfig, { SharepointConfig } from './sharepoint.config';

describe('sharepointConfig', () => {
  const configDirectlyFromEnvironmentVariables: { configPropertyName: keyof SharepointConfig; environmentVariableName: string }[] = [
    {
      configPropertyName: 'baseUrl',
      environmentVariableName: 'SHAREPOINT_BASE_URL',
    },
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
    {
      configPropertyName: 'scCaseSitesListId',
      environmentVariableName: 'SHAREPOINT_SC_CASE_SITES_LIST_ID',
    },
    {
      configPropertyName: 'ecmsDocumentContentTypeId',
      environmentVariableName: 'SHAREPOINT_ECMS_DOCUMENT_CONTENT_TYPE_ID',
    },
    {
      configPropertyName: 'estoreDocumentTypeIdFieldName',
      environmentVariableName: 'SHAREPOINT_ESTORE_DOCUMENT_TYPE_ID_FIELD_NAME',
    },
    {
      configPropertyName: 'estoreDocumentTypeIdApplication',
      environmentVariableName: 'SHAREPOINT_ESTORE_DOCUMENT_TYPE_ID_APPLICATION',
    },
    {
      configPropertyName: 'estoreDocumentTypeIdFinancialStatement',
      environmentVariableName: 'SHAREPOINT_ESTORE_DOCUMENT_TYPE_ID_FINANCIAL_STATEMENT',
    },
    {
      configPropertyName: 'estoreDocumentTypeIdBusinessInformation',
      environmentVariableName: 'SHAREPOINT_ESTORE_DOCUMENT_TYPE_ID_BUSINESS_INFORMATION',
    },
  ];

  const configModifiedFromEnvironmentVariables: {
    configPropertyName: keyof SharepointConfig;
    environmentVariableNames: string[];
    getExpectedResult: (environmentVariableValues: string[]) => string;
  }[] = [
    {
      configPropertyName: 'ukefSharepointName',
      environmentVariableNames: ['SHAREPOINT_MAIN_SITE_NAME'],
      getExpectedResult: (environmentVariableValues: string[]) => `${environmentVariableValues[0]}.sharepoint.com`,
    },
    {
      configPropertyName: 'tfisSharepointUrl',
      environmentVariableNames: ['SHAREPOINT_MAIN_SITE_NAME', 'SHAREPOINT_TFIS_SITE_NAME'],
      getExpectedResult: (environmentVariableValues: string[]) =>
        `sites/${environmentVariableValues[0]}.sharepoint.com:/sites/${environmentVariableValues[1]}:`,
    },
    {
      configPropertyName: 'scSharepointUrl',
      environmentVariableNames: ['SHAREPOINT_MAIN_SITE_NAME', 'SHAREPOINT_SC_SITE_NAME'],
      getExpectedResult: (environmentVariableValues: string[]) =>
        `sites/${environmentVariableValues[0]}.sharepoint.com:/sites/${environmentVariableValues[1]}:`,
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
