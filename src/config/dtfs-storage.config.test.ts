import { withEnvironmentVariableParsingUnitTests } from '@ukef-test/common-tests/environment-variable-parsing-unit-tests';

import dtfsStorageConfig, { DtfsStorageConfig } from './dtfs-storage.config';

describe('dtfsStorageConfig', () => {
  const configDirectlyFromEnvironmentVariables: { configPropertyName: keyof DtfsStorageConfig; environmentVariableName: string }[] = [
    {
      configPropertyName: 'accountName',
      environmentVariableName: 'DTFS_STORAGE_ACCOUNT_NAME',
    },
    {
      configPropertyName: 'accountKey',
      environmentVariableName: 'DTFS_STORAGE_ACCOUNT_KEY',
    },
    {
      configPropertyName: 'dealDocumentsFolderPath',
      environmentVariableName: 'DTFS_STORAGE_DEAL_DOCUMENTS_FOLDER_PATH',
    },
  ];

  const configModifiedFromEnvironmentVariables: {
    configPropertyName: keyof DtfsStorageConfig;
    environmentVariableNames: string[];
    getExpectedResult: (environmentVariableValues: string[]) => string;
  }[] = [
    {
      configPropertyName: 'baseUrl',
      environmentVariableNames: ['DTFS_STORAGE_ACCOUNT_NAME'],
      getExpectedResult: (environmentVariableValues: string[]) => `https://${environmentVariableValues[0]}.file.core.windows.net`,
    },
  ];

  withEnvironmentVariableParsingUnitTests({
    configDirectlyFromEnvironmentVariables,
    configModifiedFromEnvironmentVariables,
    getConfig: () => dtfsStorageConfig(),
  });
});
