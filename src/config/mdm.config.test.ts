import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';

import mdmConfig, { MdmConfig } from './mdm.config';

describe('mdmConfig', () => {
  const valueGenerator = new RandomValueGenerator();

  let originalProcessEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    originalProcessEnv = process.env;
  });

  afterEach(() => {
    process.env = originalProcessEnv;
  });

  const configDirectlyFromEnvironmentVariables: { configPropertyName: keyof MdmConfig; environmentVariableName: string }[] = [
    {
      configPropertyName: 'baseUrl',
      environmentVariableName: 'MDM_BASE_URL',
    },
    {
      configPropertyName: 'apiKeyHeaderName',
      environmentVariableName: 'MDM_API_KEY_HEADER_NAME',
    },
    {
      configPropertyName: 'apiKeyHeaderValue',
      environmentVariableName: 'MDM_API_KEY_HEADER_VALUE',
    },
  ];

  describe.each(configDirectlyFromEnvironmentVariables)('$configPropertyName', ({ configPropertyName, environmentVariableName }) => {
    it(`is ${environmentVariableName}`, () => {
      const environmentVariableValue = valueGenerator.string();
      process.env = {
        [environmentVariableName]: environmentVariableValue,
      };

      const { [configPropertyName]: configPropertyValue } = mdmConfig();

      expect(configPropertyValue).toBe(environmentVariableValue);
    });
  });

  const configParsedAsIntFromEnvironmentVariablesWithDefault: {
    configPropertyName: keyof MdmConfig;
    environmentVariableName: string;
    defaultConfigValue: number;
  }[] = [
    {
      configPropertyName: 'maxRedirects',
      environmentVariableName: 'MDM_MAX_REDIRECTS',
      defaultConfigValue: 5,
    },
    {
      configPropertyName: 'timeout',
      environmentVariableName: 'MDM_TIMEOUT',
      defaultConfigValue: 30000,
    },
  ];

  describe.each(configParsedAsIntFromEnvironmentVariablesWithDefault)(
    '$configPropertyName',
    ({ configPropertyName, environmentVariableName, defaultConfigValue }) => {
      it(`is ${environmentVariableName} parsed as a number if ${environmentVariableName} is specified`, () => {
        const expectedConfigValue = valueGenerator.nonnegativeInteger();
        const environmentVariableValue = expectedConfigValue.toString();
        process.env = {
          [environmentVariableName]: environmentVariableValue,
        };

        const { [configPropertyName]: configPropertyValue } = mdmConfig();

        expect(configPropertyValue).toBe(expectedConfigValue);
      });

      it(`is ${defaultConfigValue} if ${environmentVariableName} is not specified`, () => {
        process.env = {};

        const { [configPropertyName]: configPropertyValue } = mdmConfig();

        expect(configPropertyValue).toBe(defaultConfigValue);
      });

      it(`is ${defaultConfigValue} if ${environmentVariableName} is not parseable as an integer`, () => {
        const environmentVariableValue = 'abc';
        process.env = {
          [environmentVariableName]: environmentVariableValue,
        };

        const { [configPropertyName]: configPropertyValue } = mdmConfig();

        expect(configPropertyValue).toBe(defaultConfigValue);
      });
    },
  );
});
