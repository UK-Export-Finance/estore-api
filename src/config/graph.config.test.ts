import { withEnvironmentVariableParsingUnitTests } from '@ukef-test/common-tests/environment-variable-parsing-unit-tests';

import { GraphConfig, GraphConfigType } from './graph.config';

describe('GraphConfig', () => {
  const configDirectlyFromEnvironmentVariables: { configPropertyName: keyof GraphConfigType; environmentVariableName: string }[] = [
    {
      configPropertyName: 'clientId',
      environmentVariableName: 'GRAPH_AUTHENTICATION_CLIENT_ID',
    },
    {
      configPropertyName: 'clientSecret',
      environmentVariableName: 'GRAPH_AUTHENTICATION_CLIENT_SECRET',
    },
    {
      configPropertyName: 'tenantId',
      environmentVariableName: 'GRAPH_AUTHENTICATION_TENANT_ID',
    },
  ];

  const configModifiedFromEnvironmentVariables: {
    configPropertyName: keyof GraphConfigType;
    environmentVariableNames: string[];
    getExpectedResult: (environmentVariableValues: string[]) => string;
  }[] = [
    {
      configPropertyName: 'scope',
      environmentVariableNames: ['GRAPH_BASE_URL'],
      getExpectedResult: (environmentVariableValues: string[]) => `openid offline_access ${environmentVariableValues[0]}/.default`,
    },
  ];

  withEnvironmentVariableParsingUnitTests({
    configDirectlyFromEnvironmentVariables,
    configModifiedFromEnvironmentVariables,
    getConfig: () => GraphConfig(),
  });
});
