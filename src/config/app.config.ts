import './load-dotenv';

import { registerAs } from '@nestjs/config';
import { getBooleanConfig } from '@ukef/helpers/get-boolean-config.helper';
import { getIntConfig } from '@ukef/helpers/get-int-config';

import { InvalidConfigException } from './invalid-config.exception';

const validLogLevels = ['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent'];

export interface AppConfig {
  name: string;
  env: string;
  versioning: {
    enable: boolean;
    prefix: string;
    version: string;
  };
  globalPrefix: string;
  port: number;
  apiKey: string;
  logLevel: string;
  redactLogs: boolean;
  singleLineLogFormat: boolean;
}

export default registerAs('app', (): Record<string, any> => {
  const logLevel = process.env.LOG_LEVEL || 'info';
  if (!validLogLevels.includes(logLevel)) {
    throw new InvalidConfigException(`LOG_LEVEL must be one of ${validLogLevels} or not specified.`);
  }

  return {
    name: process.env.APP_NAME || 'estore',
    env: process.env.NODE_ENV || 'development',

    versioning: {
      enable: getBooleanConfig(process.env.HTTP_VERSIONING_ENABLE, false),
      prefix: 'v',
      version: process.env.HTTP_VERSION || '1',
    },

    globalPrefix: '/api',
    port: getIntConfig(process.env.HTTP_PORT, 3001),
    apiKey: process.env.API_KEY,
    logLevel: process.env.LOG_LEVEL || 'info',
    redactLogs: getBooleanConfig(process.env.REDACT_LOGS, true),
    singleLineLogFormat: getBooleanConfig(process.env.SINGLE_LINE_LOG_FORMAT, true),
  };
});
