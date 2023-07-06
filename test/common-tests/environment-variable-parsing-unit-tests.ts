import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';

interface Options<ConfigUnderTest> {
  configDirectlyFromEnvironmentVariables?: {
    configPropertyName: keyof ConfigUnderTest;
    environmentVariableName: string;
  }[];
  configParsedAsIntFromEnvironmentVariablesWithDefault?: {
    configPropertyName: keyof ConfigUnderTest;
    environmentVariableName: string;
    defaultConfigValue: number;
  }[];
  configModifiedFromEnvironmentVariables?: {
    configPropertyName: keyof ConfigUnderTest;
    environmentVariableNames: string[];
    getExpectedResult: (environmentVariableValues: string[]) => string;
  }[];
  getConfig: () => ConfigUnderTest;
}

export const withEnvironmentVariableParsingUnitTests = <ConfigUnderTest>({
  configDirectlyFromEnvironmentVariables,
  configParsedAsIntFromEnvironmentVariablesWithDefault,
  configModifiedFromEnvironmentVariables,
  getConfig,
}: Options<ConfigUnderTest>): void => {
  const valueGenerator = new RandomValueGenerator();

  let originalProcessEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    originalProcessEnv = process.env;
  });

  afterEach(() => {
    process.env = originalProcessEnv;
  });

  if (configDirectlyFromEnvironmentVariables) {
    describe.each(configDirectlyFromEnvironmentVariables)('$configPropertyName', ({ configPropertyName, environmentVariableName }) => {
      it(`is the env variable ${environmentVariableName}`, () => {
        const environmentVariableValue = valueGenerator.string();
        process.env = {
          [environmentVariableName]: environmentVariableValue,
        };

        const { [configPropertyName]: configPropertyValue } = getConfig();

        expect(configPropertyValue).toBe(environmentVariableValue);
      });
    });
  }

  if (configParsedAsIntFromEnvironmentVariablesWithDefault) {
    describe.each(configParsedAsIntFromEnvironmentVariablesWithDefault)(
      '$configPropertyName',
      ({ configPropertyName, environmentVariableName, defaultConfigValue }) => {
        it(`is the env variable ${environmentVariableName} parsed as a number if ${environmentVariableName} is specified`, () => {
          const expectedConfigValue = valueGenerator.nonnegativeInteger();
          const environmentVariableValue = expectedConfigValue.toString();
          process.env = {
            [environmentVariableName]: environmentVariableValue,
          };

          const { [configPropertyName]: configPropertyValue } = getConfig();

          expect(configPropertyValue).toBe(expectedConfigValue);
        });

        it(`is the default value ${defaultConfigValue} if ${environmentVariableName} is not specified`, () => {
          process.env = {};

          const { [configPropertyName]: configPropertyValue } = getConfig();

          expect(configPropertyValue).toBe(defaultConfigValue);
        });

        it(`is the default value ${defaultConfigValue} if ${environmentVariableName} is not parseable as an integer`, () => {
          const environmentVariableValue = 'abc';
          process.env = {
            [environmentVariableName]: environmentVariableValue,
          };

          const { [configPropertyName]: configPropertyValue } = getConfig();

          expect(configPropertyValue).toBe(defaultConfigValue);
        });
      },
    );
  }

  if (configModifiedFromEnvironmentVariables)
    describe.each(configModifiedFromEnvironmentVariables)('$configPropertyName', ({ configPropertyName, environmentVariableNames, getExpectedResult }) => {
      it(`transforms the env vars ${environmentVariableNames.join(', ')} to the expected config value for ${configPropertyName.toString()}`, () => {
        const environmentVariableValues = [];
        environmentVariableNames.forEach((environmentVariableName) => {
          const environmentVariableValue = valueGenerator.string();

          process.env = { ...process.env, [environmentVariableName]: environmentVariableValue };

          environmentVariableValues.push(environmentVariableValue);
        });

        const expectedConfigValue = getExpectedResult(environmentVariableValues);
        const { [configPropertyName]: configPropertyValue } = getConfig();

        expect(configPropertyValue).toBe(expectedConfigValue);
      });
    });
};
