import { withEnvironmentVariableParsingUnitTests } from '@ukef-test/common-tests/environment-variable-parsing-unit-tests';

import appConfig, { AppConfig } from './app.config';
import { InvalidConfigException } from './invalid-config.exception';

describe('appConfig', () => {
  let originalProcessEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    originalProcessEnv = process.env;
  });

  afterEach(() => {
    process.env = originalProcessEnv;
  });

  describe('parsing LOG_LEVEL', () => {
    it('throws an InvalidConfigException if LOG_LEVEL is specified but is not a valid log level', () => {
      replaceEnvironmentVariables({
        LOG_LEVEL: 'not-a-real-log-level',
      });

      const gettingTheAppConfig = () => appConfig();

      expect(gettingTheAppConfig).toThrow(InvalidConfigException);
      expect(gettingTheAppConfig).toThrow(`LOG_LEVEL must be one of fatal,error,warn,info,debug,trace,silent or not specified.`);
    });

    it('uses info as the logLevel if LOG_LEVEL is not specified', () => {
      replaceEnvironmentVariables({});

      const config = appConfig();

      expect(config.logLevel).toBe('info');
    });

    it('uses info as the logLevel if LOG_LEVEL is empty', () => {
      replaceEnvironmentVariables({
        LOG_LEVEL: '',
      });

      const config = appConfig();

      expect(config.logLevel).toBe('info');
    });

    it.each([
      {
        LOG_LEVEL: 'fatal',
      },
      {
        LOG_LEVEL: 'error',
      },
      {
        LOG_LEVEL: 'warn',
      },
      {
        LOG_LEVEL: 'info',
      },
      {
        LOG_LEVEL: 'debug',
      },
      {
        LOG_LEVEL: 'trace',
      },
      {
        LOG_LEVEL: 'silent',
      },
    ])('uses LOG_LEVEL as the logLevel if LOG_LEVEL is valid ($LOG_LEVEL)', ({ LOG_LEVEL }) => {
      replaceEnvironmentVariables({
        LOG_LEVEL,
      });

      const config = appConfig();

      expect(config.logLevel).toBe(LOG_LEVEL);
    });
  });

  describe('parsing HTTP_VERSIONING_ENABLE', () => {
    it('uses false as the versioning.enable if HTTP_VERSIONING_ENABLE is not specified', () => {
      replaceEnvironmentVariables({});

      const config = appConfig();

      expect(config.versioning.enable).toBe(false);
    });

    it.each([
      {
        HTTP_VERSIONING_ENABLE: 'TRUE',
      },
      {
        HTTP_VERSIONING_ENABLE: 'True',
      },
      {
        HTTP_VERSIONING_ENABLE: 'True',
      },
      {
        HTTP_VERSIONING_ENABLE: 'FALSE',
      },
      {
        HTTP_VERSIONING_ENABLE: 'False',
      },
      {
        HTTP_VERSIONING_ENABLE: 'false',
      },
    ])('uses HTTP_VERSIONING_ENABLE as the versioning.enable if HTTP_VERSIONING_ENABLE is valid ($HTTP_VERSIONING_ENABLE)', ({ HTTP_VERSIONING_ENABLE }) => {
      replaceEnvironmentVariables({
        HTTP_VERSIONING_ENABLE,
      });

      const config = appConfig();

      expect(config.versioning.enable).toBe(HTTP_VERSIONING_ENABLE === 'TRUE' || HTTP_VERSIONING_ENABLE === 'True' || HTTP_VERSIONING_ENABLE === 'True');
    });
  });

  describe('parsing HTTP_VERSION', () => {
    it('uses 1 as the versioning.version if HTTP_VERSION is not specified', () => {
      replaceEnvironmentVariables({});
      const config = appConfig();

      expect(config.versioning.version).toBe('1');
    });

    it('uses HTTP_VERSION as the versioning.version if HTTP_VERSION is present', () => {
      replaceEnvironmentVariables({
        HTTP_VERSION: '2',
      });

      const config = appConfig();

      expect(config.versioning.version).toBe('2');
    });
  });

  const configDirectlyFromEnvironmentVariables: { configPropertyName: keyof AppConfig; environmentVariableName: string; defaultConfigValue?: string }[] = [
    {
      configPropertyName: 'name',
      environmentVariableName: 'APP_NAME',
      defaultConfigValue: 'estore',
    },
    {
      configPropertyName: 'env',
      environmentVariableName: 'NODE_ENV',
      defaultConfigValue: 'development',
    },
    { configPropertyName: 'apiKey', environmentVariableName: 'API_KEY' },
  ];

  const configParsedAsIntFromEnvironmentVariablesWithDefault: {
    configPropertyName: keyof AppConfig;
    environmentVariableName: string;
    defaultConfigValue: number;
  }[] = [
    {
      configPropertyName: 'port',
      environmentVariableName: 'HTTP_PORT',
      defaultConfigValue: 3001,
    },
  ];

  const configParsedAsBooleanFromEnvironmentVariablesWithDefault: {
    configPropertyName: keyof AppConfig;
    environmentVariableName: string;
    defaultConfigValue: boolean;
  }[] = [{ configPropertyName: 'singleLineLogFormat', environmentVariableName: 'SINGLE_LINE_LOG_FORMAT', defaultConfigValue: false }];

  withEnvironmentVariableParsingUnitTests({
    configDirectlyFromEnvironmentVariables,
    configParsedAsIntFromEnvironmentVariablesWithDefault,
    configParsedAsBooleanFromEnvironmentVariablesWithDefault,
    getConfig: () => appConfig(),
  });
  const replaceEnvironmentVariables = (newEnvVariables: Record<string, string>): void => {
    process.env = newEnvVariables;
  };

  const configParsedBooleanFromEnvironmentVariablesWithDefault: {
    configPropertyName: keyof AppConfig;
    environmentVariableName: string;
    defaultConfigValue: boolean;
  }[] = [
    {
      configPropertyName: 'singleLineLogFormat',
      environmentVariableName: 'SINGLE_LINE_LOG_FORMAT',
      defaultConfigValue: true,
    },
  ];

  withEnvironmentVariableParsingUnitTests({
    configParsedBooleanFromEnvironmentVariablesWithDefault,
    getConfig: () => appConfig(),
  });
});
