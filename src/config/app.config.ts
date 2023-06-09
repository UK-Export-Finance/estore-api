import './load-dotenv';

import { registerAs } from '@nestjs/config';

import { InvalidConfigException } from './invalid-config.exception';

const validLogLevels = ['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent'];

export default registerAs('app', (): Record<string, any> => {
  const logLevel = process.env.LOG_LEVEL || 'info';
  if (!validLogLevels.includes(logLevel)) {
    throw new InvalidConfigException(`LOG_LEVEL must be one of ${validLogLevels} or not specified.`);
  }

  return {
    name: process.env.APP_NAME || 'estore',
    env: process.env.NODE_ENV || 'development',

    versioning: {
      enable: process.env.HTTP_VERSIONING_ENABLE === 'true' || false,
      prefix: 'v',
      version: process.env.HTTP_VERSION || '1',
    },

    globalPrefix: '/api',
    port: process.env.HTTP_PORT ? Number.parseInt(process.env.HTTP_PORT, 10) : 3001,
    apiKey: process.env.API_KEY,
    logLevel: process.env.LOG_LEVEL || 'info',
  };
});
