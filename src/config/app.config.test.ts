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

  describe('parsing SINGLE_LINE_LOG_FORMAT', () => {
    it('sets singleLineLogFormat to true if SINGLE_LINE_LOG_FORMAT is true', () => {
      replaceEnvironmentVariables({
        SINGLE_LINE_LOG_FORMAT: 'true',
      });

  const configParsedAsBooleanFromEnvironmentVariablesWithDefault: {
    configPropertyName: keyof AppConfig;
    environmentVariableName: string;
    defaultConfigValue: boolean;
  }[] = [{ configPropertyName: 'singleLineLogFormat', environmentVariableName: 'SINGLE_LINE_LOG_FORMAT', defaultConfigValue: false }];

      expect(config.redactLogs).toBe(true);
    });

    it('sets redactLogs to false if REDACT_LOGS is false', () => {
      replaceEnvironmentVariables({
        REDACT_LOGS: 'false',
      });

      const config = appConfig();

      expect(config.redactLogs).toBe(false);
    });

    it('sets redactLogs to true if REDACT_LOGS is not specified', () => {
      replaceEnvironmentVariables({});

      const config = appConfig();

      expect(config.redactLogs).toBe(true);
    });

    it('sets redactLogs to true if REDACT_LOGS is the empty string', () => {
      replaceEnvironmentVariables({
        REDACT_LOGS: '',
      });

      const config = appConfig();

      expect(config.redactLogs).toBe(true);
    });

    it('sets redactLogs to true if REDACT_LOGS is any string other than true or false', () => {
      replaceEnvironmentVariables({
        REDACT_LOGS: valueGenerator.string(),
      });

      const config = appConfig();

      expect(config.redactLogs).toBe(true);
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
    // { configPropertyName: 'logLevel', environmentVariableName: 'LOG_LEVEL', defaultConfigValue: 'info' },
  ];

  const configParsedAsBooleanFromEnvironmentVariablesWithDefault: {
    configPropertyName: keyof AppConfig;
    environmentVariableName: string;
    defaultConfigValue: boolean;
  }[] = [{ configPropertyName: 'singleLineLogFormat', environmentVariableName: 'SINGLE_LINE_LOG_FORMAT', defaultConfigValue: false }];

  withEnvironmentVariableParsingUnitTests({
    configDirectlyFromEnvironmentVariables,
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
