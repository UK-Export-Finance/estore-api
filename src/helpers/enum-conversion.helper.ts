import { SiteStatusEnum } from '@ukef/constants/enums/site-status';
import { EnumConversionException } from './exception/enum-conversion.exception';

export const convertToEnum = <T>(value: unknown, enumObject: T): T[keyof T] => {
  const enumValues = Object.values(enumObject);

  if (enumValues.includes(value as T[keyof T])) {
    return value as T[keyof T];
  } else {
    throw new EnumConversionException(`Enum does not contain value: ${value}`);
  }
};
