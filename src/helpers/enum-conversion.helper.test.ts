import { convertToEnum } from './enum-conversion.helper';

describe('EnumConversion helper', () => {
  enum TestStringEnum {
    VALUE_1 = 'value 1',
    VALUE_2 = 'value 2',
    VALUE_3 = 'value 3',
  }

  enum TestNumberEnum {
    VALUE_1 = 1,
    VALUE_2 = 2,
    VALUE_3 = 3,
  }

    it('should convert a valid string value to the enum', () => {
      expect(convertToEnum<typeof TestStringEnum>('value 1',  TestStringEnum)).toBe(TestStringEnum.VALUE_1);
    });

    it('should convert a valid number value to the enum', () => {
      expect(convertToEnum<typeof TestNumberEnum>(1, TestNumberEnum)).toBe(TestNumberEnum.VALUE_1);
    });

    it('should throw an error for an invalid value', () => {
        const valueNotInList=  'value not in list';
      expect(() => convertToEnum<typeof TestStringEnum>(valueNotInList, TestStringEnum)).toThrowError(`Enum does not contain value: ${valueNotInList}`);
    });
  });

