import { InvalidConfigException } from '@ukef/config/invalid-config.exception';

import { getBooleanConfig } from './get-boolean-config.helper';

describe('GetBooleanConfig helper test', () => {
  describe('getBooleanConfig', () => {
    it.each([
      { testBoolString: 'TRUE', expectedBoolean: true },
      { testBoolString: 'True', expectedBoolean: true },
      { testBoolString: 'True', expectedBoolean: true },
      { testBoolString: 'FALSE', expectedBoolean: false },
      { testBoolString: 'False', expectedBoolean: false },
      { testBoolString: 'false', expectedBoolean: false },
    ])('should return $expectedBoolean if the environmental variable string is "$testBoolString"', ({ testBoolString, expectedBoolean }) => {
      const unexpectedBoolean = !expectedBoolean;
      const result = getBooleanConfig(testBoolString, unexpectedBoolean);

      expect(result).toBe(expectedBoolean);
    });

    it.each(['abc', '12.5', '20th', '0xFF', '0b101'])(`throws InvalidConfigException for "%s" because it is not valid boolean`, (value) => {
      const gettingTheConfig = () => getBooleanConfig(value as unknown as string, false);

      expect(gettingTheConfig).toThrow(InvalidConfigException);
      expect(gettingTheConfig).toThrow(`Invalid boolean value "${value}" for configuration property.`);
    });

    it.each([12, true, null, false, /.*/, {}, [], 0xff, 0b101])(
      'throws InvalidConfigException for "%s" because environment variable type is not string',
      (value) => {
        const gettingTheConfig = () => getBooleanConfig(value as unknown as string, false);

        expect(gettingTheConfig).toThrow(InvalidConfigException);
        expect(gettingTheConfig).toThrow(`Input environment variable type for ${value} should be string.`);
      },
    );

    it('throws InvalidConfigException if environment variable and default value is missing', () => {
      const gettingTheConfig = () => getBooleanConfig(undefined, false);

      expect(gettingTheConfig).toThrow(InvalidConfigException);
      expect(gettingTheConfig).toThrow("Environment variable is missing and doesn't have default value.");
    });
  });
});
