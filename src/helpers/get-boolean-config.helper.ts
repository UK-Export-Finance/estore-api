import { InvalidConfigException } from '@ukef/config/invalid-config.exception';

export const getBooleanConfig = (environmentVariable: string, defaultValue: boolean): boolean => {
  if (typeof environmentVariable === 'undefined') {
    return defaultValue;
  }

  if (typeof environmentVariable !== 'string') {
    throw new InvalidConfigException(`Input environment variable type for ${environmentVariable} should be string.`);
  }

  if (environmentVariable.toLowerCase() !== 'true' && environmentVariable.toLowerCase() !== 'false') {
    throw new InvalidConfigException(`Invalid boolean value "${environmentVariable}" for configuration property.`);
  }

  return environmentVariable.toLowerCase() === 'true';
};
