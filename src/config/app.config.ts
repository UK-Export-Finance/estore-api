import './load-dotenv';

import { registerAs } from '@nestjs/config';
import { APPLICATION } from '@ukef/constants';
import { getIntConfig } from '@ukef/helpers/get-int-config';

import { InvalidConfigException } from './invalid-config.exception';

const { NODE_ENV } = process.env;

const { NAME, VERSION_PREFIX } = APPLICATION;

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

  const version = process.env.HTTP_VERSION || '1';

  return {
    apiKey: process.env.API_KEY,
    env: NODE_ENV,
    globalPrefix: '/api',
    logLevel: process.env.LOG_LEVEL || 'info',
    name: NAME,
    port: getIntConfig(process.env.HTTP_PORT, 3001),
    redactLogs: process.env.REDACT_LOGS !== 'false',
    singleLineLogFormat: process.env.SINGLE_LINE_LOG_FORMAT !== 'false',
    versioning: {
      enable: process.env.HTTP_VERSIONING_ENABLE === 'true',
      prefix: VERSION_PREFIX,
      prefixAndVersion: `${VERSION_PREFIX}${version}`,
      version,
    },
  };
});
