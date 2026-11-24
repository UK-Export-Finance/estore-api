import { withEnvironmentVariableParsingUnitTests } from '@ukef-test/common-tests/environment-variable-parsing-unit-tests';

import { DtfsStorageConfig, DtfsStorageConfigType } from './dtfs-storage.config';

describe('DtfsStorageConfig', () => {
  const configDirectlyFromEnvironmentVariables: { configPropertyName: keyof DtfsStorageConfigType; environmentVariableName: string }[] = [
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
    configPropertyName: keyof DtfsStorageConfigType;
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
    getConfig: () => DtfsStorageConfig(),
  });
});
